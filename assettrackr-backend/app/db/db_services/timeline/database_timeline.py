from datetime import datetime, time
from sqlalchemy import select, update, func
from zoneinfo import ZoneInfo 
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.dialects.postgresql import insert

from ..database_manager import Timeline


Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

# ---------------- FETCH TIMELINE (for specific user) ----------------
def get_user_timeline(db, uid):
    stmt = (
        select(Timeline.date, Timeline.value).
        where(Timeline.uid == uid).
        order_by(Timeline.date.desc())
    )

    return db.execute(stmt).mappings().all() # something like [{'date': ..., 'value': ...}, ...]

# ---------------- CREATE INITIAL TIMELINE FOR NEW USER  ----------------
def initialise_ts(db, uid):
    if not uid:
        raise ValueError("Internal Server Error")
    
    startingValue = 0
    utc_now = datetime.now(tz=ZoneInfo("UTC"))

    stmt = (
        insert(Timeline)
        .values(uid=uid, date=utc_now, value=startingValue)
        .on_conflict_do_nothing(index_elements=[Timeline.uid])
        .returning(Timeline.uid)
    )
    db.execute(stmt)
    db.commit()