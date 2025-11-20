from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func

from ..database_manager import CashHistory

def addEntryInCashHistory(db, uid, deposit):
    if not db or not uid or not deposit:
        raise ValueError("Internal Server Error")
    
    stmt = (
        insert(CashHistory)
        .values(uid=uid, deposit=deposit, date=func.now())
    )
    db.execute(stmt)
    db.commit()