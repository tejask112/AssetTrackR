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

# ---------------- FETCH ONLY LATEST TIMELINE (for specific user) ----------------
def get_latest_user_timeline(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(func.max(Timeline.date))
        .where(Timeline.uid == uid)
    )

    return db.execute(stmt).scalar_one_or_none()

# ---------------- CREATE INITIAL TIMELINE FOR NEW USER  ----------------
def initialise_ts(db, uid):
    if not uid:
        raise ValueError("Internal Server Error")
    
    startingValue = 0
    utc_now = datetime.now(tz=ZoneInfo("UTC"))

    stmt = (
        insert(Timeline)
        .values(uid=uid, date=utc_now, value=startingValue)
        .on_conflict_do_nothing(constraint="pk_timeline_uid_date")
        .returning(Timeline.uid)
    )
    db.execute(stmt)
    db.commit()

def get_time_series_15min(symbols, startDate):
    interval = "15min"
    for symbol in symbols:
        timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval={interval}&start_date={startDate}&outputsize=5000&apikey={TWELVE_API_KEY}"
        timeSeriesResponse = (requests.get(url=timeSeriesUrl)).json()

        prices = timeSeriesResponse.get("values", [])
        res = {
            "ticker": symbol,
            "prices" : prices
        }
    

# ---------------- UPDATE TIMELINE FOR USER SINCE LAST LOG IN  ----------------
def update_ts(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    latest_timeline = get_latest_user_timeline(db, uid) #returns datetime object
    portfolio = get_portfolio_holdings(db, uid)
    filtered_trades = get_filtered_trades(db, uid, latest_timeline)

    print("------------------------------------------------------ PORTFOLIO:" + str(portfolio))
    print("------------------------------------------------------ UPDATE TS:" + str(latest_timeline))
    # print("------------------------------------------------------ FILTERED TRADES:" + str(format_trades(filtered_trades)))
    print("------------------------------------------------------ FILTERED TRADES:" + str(filtered_trades))
    
    date = latest_timeline.astimezone(ZoneInfo("America/New_York"))

    if date.minute not in {0, 15, 30, 45}:
        date = roundTo15Min(date)
    
    date = incrementNext15minMarket(date)

    print(f"LAST LOGIN: {latest_timeline}, NEXT OPEN MARKET DATE: {date}")
