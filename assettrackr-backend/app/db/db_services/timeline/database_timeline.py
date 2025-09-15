from datetime import datetime, time
from sqlalchemy import select, update, func
from zoneinfo import ZoneInfo 
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.dialects.postgresql import insert

from ..database_manager import Timeline
from ..portfolio.database_portfolio import get_portfolio_holdings
from ..trades.database_trades import get_filtered_trades
from ...db_utils.dates import roundTo15Min


Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

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

# ---------------- UPDATE TIMELINE FOR USER SINCE LAST LOG IN  ----------------
def update_ts(db, uid):
    if not uid or not db:
        raise ValueError("Internal Server Error")
    
    latest_timeline = get_latest_user_timeline(db, uid) #returns datetime object
    portfolio = get_portfolio_holdings(db, uid)
    filtered_trades = get_filtered_trades(db, uid, latest_timeline)

    print("--------------------------- PORTFOLIO:" + str(portfolio))
    print("--------------------------- UPDATE TS:" + str(latest_timeline))
    print("--------------------------- FILTERED TRADES:" + str(filtered_trades))
    
    date = latest_timeline.astimezone(ZoneInfo("America/New_York"))

    if date.minute not in {0, 15, 30, 45}:
        date = roundTo15Min(date)

    
    

    
