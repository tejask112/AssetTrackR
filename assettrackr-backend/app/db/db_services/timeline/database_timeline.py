from datetime import datetime, time
from sqlalchemy import select, update, func
from zoneinfo import ZoneInfo 
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.dialects.postgresql import insert
import requests, os
from flask import jsonify

from ..database_manager import Timeline
from ..trades.database_trades import get_filtered_trades
from ...db_utils.dates import roundTo15Min
from ...db_utils.market_hours import incrementNext15minMarket
from ...db_utils.json_formatter import to_jsonable
from ...db_utils.trades_formatter import createFormattedTimeseries

Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

# ---------------- FETCH ENTIRE TIMELINE (for specific user) ----------------
def get_user_entire_timeline(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Timeline.date, Timeline.value).
        where(Timeline.uid == uid).
        order_by(Timeline.date.desc())
    )

    return db.execute(stmt).mappings().all() # something like [{'date': ..., 'value': ...}, ...]

# ---------------- FETCH ONLY LATEST TIMELINE DATE (for specific user) ----------------
def get_latest_user_timeline_date(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(func.max(Timeline.date))
        .where(Timeline.uid == uid)
    )

    return db.execute(stmt).scalar_one_or_none()

# ---------------- FETCH ONLY LATEST TIMELINE VALUE (for specific user) ----------------
def get_latest_user_timeline_value(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Timeline.value)
        .where(Timeline.uid == uid)
        .order_by(Timeline.date.desc())
        .limit(1)
    )

    return db.execute(stmt).scalars().first()

# ---------------- FETCH ONLY LATEST TIMELINE PORTFOLIO (for specific user) ----------------
def get_latest_user_timeline_portfolio(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Timeline.portfolio)
        .where(Timeline.uid == uid)
        .order_by(Timeline.date.desc())
        .limit(1)
    )

    return db.execute(stmt).scalars().first()

# ---------------- CREATE INITIAL TIMELINE FOR NEW USER  ----------------
def initialise_ts(db, uid):
    if not uid:
        raise ValueError("Internal Server Error")
    
    startingValue = 0
    utc_now = datetime.now(tz=ZoneInfo("UTC"))

    stmt = (
        insert(Timeline)
        .values(uid=uid, date=utc_now, value=startingValue, portfolio={})
        .on_conflict_do_nothing(constraint="pk_timeline_uid_date")
        .returning(Timeline.uid)
    )
    db.execute(stmt)
    db.commit()

# ---------------- ADD NEW TIMELINE FOR USER  ----------------
def add_ts(db, uid, date, assetValue, portfolio):
    if db is None or not uid or date is None or assetValue is None or portfolio is None:
        raise ValueError("Internal Server Error")
    
    stmt = (
        insert(Timeline)
        .values(uid=uid, date=date, value=assetValue, portfolio=portfolio)
        .on_conflict_do_nothing(constraint="pk_timeline_uid_date")
    )
    db.execute(stmt)
    db.commit()

# ---------------- API CALL TO RETRIEVE TIMESERIES FOR LIST OF SYMBOLS  ----------------
def get_time_series_15min(symbols, startDate):
    interval = "15min"

    groupedTimeSeries: dict[str, list[dict]] = {}

    for symbol in symbols:
        ticker = symbol.get('ticker')
        if ticker is None:
            continue

        timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={ticker}&interval={interval}&start_date={startDate}&outputsize=5000&apikey={TWELVE_API_KEY}"
        timeSeriesResponse = (requests.get(url=timeSeriesUrl)).json()

        prices = timeSeriesResponse.get("values", [])
        prices.reverse()
        groupedTimeSeries[ticker] = prices
    
    return groupedTimeSeries

# ---------------- UPDATE TIMELINE FOR USER SINCE LAST LOG IN  ----------------
def update_ts(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    from ..portfolio.database_portfolio import get_portfolio_holdings

    latest_timeline = get_latest_user_timeline_date(db, uid) #returns datetime object
    portfolio = get_portfolio_holdings(db, uid)
    filtered_trades = get_filtered_trades(db, uid, latest_timeline)
    
    current_date = datetime.now(ZoneInfo("America/New_York"))
    date = latest_timeline.astimezone(ZoneInfo("America/New_York"))

    timeseries = get_time_series_15min(portfolio, date)
    ts_by_ticker = createFormattedTimeseries(timeseries)

    print("------------------------------------------------------ PORTFOLIO:" + str(portfolio))
    print("------------------------------------------------------ UPDATE TS:" + str(latest_timeline))
    print("------------------------------------------------------ FILTERED TRADES:" + str(filtered_trades))
    print("------------------------------------------------------ PRICES:" + str(timeseries))

    if date.minute not in {0, 15, 30, 45}:
        date = roundTo15Min(date)
    
    date = incrementNext15minMarket(date)
    prevPortfolio = get_latest_user_timeline_portfolio(db, uid)

    print("------------------------------------------------------ PREVIOUS PORTFOLIO:" + str(prevPortfolio))

    prev_known_price = {}
    prev_date = latest_timeline.astimezone(ZoneInfo("America/New_York"))

    while date <= current_date:
        print("UPDATE_TS: ----------------------------------------------------")

        # 1. get portfolio at previous date
        newPortfolio = prevPortfolio.copy()
        
        # Get trades that occurred between prev_date and current date
        trades_at_date = {}
        for trade_date, trade_data in filtered_trades.items():
            # Check if trade happened in the time window
            if prev_date < trade_date <= date:
                for ticker, trades_list in trade_data.items():
                    if ticker not in trades_at_date:
                        trades_at_date[ticker] = []
                    trades_at_date[ticker].extend(trades_list)
        
        print(f"UPDATE_TS: TRADES AT DATE {date}: {trades_at_date}")
        
        if trades_at_date:
            # 2. check trades for any changes to portfolio (eg buy or sell of a stock)
            for ticker, listOfTrades in trades_at_date.items():
                new_qty = Decimal("0")
                for trade in listOfTrades:
                    print(f"UPDATE_TS: CURRENT TRADE ITERATION: {ticker} {trade}")
                    quantity = Decimal(str(trade.get('quantity')))
                    action = trade.get('action')

                    if action == 'BUY':
                        new_qty += quantity
                    elif action == 'SELL':
                        new_qty -= quantity
                
                # 3. update new portfolio for current date 
                prev_qty = newPortfolio.get(ticker, Decimal("0"))
                final_qty = Decimal(str(prev_qty)) + new_qty
                
                if final_qty > 0: 
                    newPortfolio[ticker] = final_qty
                else:
                    newPortfolio.pop(ticker, None)
                    
                print(f"UPDATE_TS: {ticker} new quantity: {final_qty}")

        # 4. calculate value of user's assets using the portfolio
        assetValue = Decimal("0")
        for ticker, quantity in newPortfolio.items():
            incr_qty = Decimal("0")
            ticker_trade = trades_at_date.get(ticker)
            
            if ticker_trade:
                for trade in ticker_trade:
                    if trade.get('action') == 'BUY':
                        incr_qty += Decimal(str(trade.get('quantity')))
                        assetValue += Decimal(str(trade.get('execution_total_price')))
            
            remaining_qty = Decimal(str(quantity)) - incr_qty
            if remaining_qty > 0:
                print(f"UPDATE_TS: ---FETCHING FOR {ticker}")
                
                # Use .get() to handle missing tickers
                ticker_timeline = ts_by_ticker.get(ticker)
                
                if ticker_timeline is None:
                    print(f"UPDATE_TS: WARNING - No timeseries data for {ticker}")
                    price = prev_known_price.get(ticker)
                    if price is None:
                        print(f"UPDATE_TS: ERROR - No price data available for {ticker}, skipping")
                        continue
                else:
                    ohlc = ticker_timeline.get(date)
                    if ohlc:
                        price = Decimal(str(ohlc["close"]))
                        print(f"UPDATE_TS: ---PRICE: {price}")
                        prev_known_price[ticker] = price
                    else:
                        price = prev_known_price.get(ticker)
                        print(f"UPDATE_TS: ---N/A PRICE, USING PREV RECORDED PRICE {price}")
                
                if price is not None:
                    assetValue += price * remaining_qty
                else:
                    print(f"UPDATE_TS: WARNING - Cannot calculate value for {ticker}, no price available")

        print(f"UPDATE_TS: DATE: {date}")
        print(f"UPDATE_TS: NEW PORTFOLIO: {newPortfolio}")
        print(f"UPDATE_TS: NEW ASSET VALUE: {assetValue}")

        # 5. save uid, date, assetValue, newPortfolio to database
        safe_portfolio = to_jsonable(newPortfolio)
        add_ts(db, uid, date, assetValue, safe_portfolio)

        # 6. increment date + reset prevPortfolio
        prev_date = date  # Update previous date tracker
        prevPortfolio = newPortfolio
        date = incrementNext15minMarket(date)

        print("UPDATE_TS: ----------------------------------------------------")
