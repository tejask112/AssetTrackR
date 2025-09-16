from datetime import datetime, time
from sqlalchemy import select, update, func
from zoneinfo import ZoneInfo 
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.dialects.postgresql import insert
import requests, os

from ..database_manager import Timeline
from ..portfolio.database_portfolio import get_portfolio_holdings
from ..trades.database_trades import get_filtered_trades
from ...db_utils.dates import roundTo15Min
from ...db_utils.market_hours import incrementNext15minMarket


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
    
    latest_timeline = get_latest_user_timeline_date(db, uid) #returns datetime object
    portfolio = get_portfolio_holdings(db, uid)
    filtered_trades = get_filtered_trades(db, uid, latest_timeline)
    
    current_date = datetime.now(ZoneInfo("America/New_York"))
    date = latest_timeline.astimezone(ZoneInfo("America/New_York"))

    timeseries = get_time_series_15min(portfolio, date)

    print("------------------------------------------------------ PORTFOLIO:" + str(portfolio))
    print("------------------------------------------------------ UPDATE TS:" + str(latest_timeline))
    print("------------------------------------------------------ FILTERED TRADES:" + str(filtered_trades))
    print("------------------------------------------------------ TIME SERIES:" + str(timeseries))

    if date.minute not in {0, 15, 30, 45}:
        date = roundTo15Min(date)
    
    date = incrementNext15minMarket(date)
    prevPortfolio = get_latest_user_timeline_portfolio(db, uid)

    print("------------------------------------------------------ PREVIOUS PORTFOLIO:" + str(prevPortfolio))

    index = 0

    while date <= current_date:
        # 1. get portfolio at previous date
        newPortfolio = prevPortfolio
        trades_at_date = filtered_trades.get(date)
        if trades_at_date is not None:
            # 2. check trades for any changes to portfolio (eg buy or sell of a stock)
            for trade in trades_at_date:
                ticker = trade.get('ticker')
                quantity = trade.get('quantity')
                action = trade.get('action')

                if action == 'BUY':
                    newQuantity = newPortfolio.get(ticker) + quantity
                elif action == 'SELL':
                    newQuantity = newPortfolio.get(ticker) - quantity
                
                # 3. update new portfolio for current date 
                if newQuantity > 0:
                    newPortfolio.update({ ticker: newQuantity })
                else:
                    newPortfolio.pop(ticker, None)
                
        # 4. calculate value of user's assets using the portfolio (where a trade occured, use the execution_price)
        assetValue = Decimal("0")
        for ticker, quantity in newPortfolio.items():
            ticker_trade = trades_at_date.get(ticker)
            if ticker_trade is not None:
                if ticker_trade.get('action') == 'BUY':
                    assetValue += ticker_trade.get('execution_total_price')
                elif ticker_trade.get('action') == 'SELL':
                    ticker_timeseries = timeseries.get(ticker)
                    ohlc = ticker_timeseries[index]
                    ohlc_date = datetime.strptime(ohlc.get('datetime'), "%Y-%m-%d %H:%M:%S").date()
                    if ohlc_date == date.date():
                        prev_quantity = Decimal(str(prevPortfolio.get(ticker, 0)))
                        assetValue -= (Decimal(ohlc.get('close'))*prev_quantity) - ticker_trade.get('execution_total_price')
                    else:
                        continue
                        #use same value as the previous known price of the stock. do not leave it as empty
            else:
                ohlc = timeseries.get(ticker)[index]
                ohlc_date = datetime.strptime(ohlc.get('datetime'), "%Y-%m-%d %H:%M:%S").date()
                if ohlc_date == date.date():
                    assetValue += Decimal(ohlc.get('close'))*quantity
                else:
                    continue
                    #use same value as the previous known price of the stock. do not leave it as empty

        # 5. save uid, date, assetValue, newPortfolio to database
        add_ts(db, uid, date, assetValue, newPortfolio)

        # 6. increment index and date, reset prevPortfolio
        index+=1
        prevPortfolio = newPortfolio
        date = incrementNext15minMarket(date)
              


    
