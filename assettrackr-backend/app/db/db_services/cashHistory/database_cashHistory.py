from sqlalchemy import func, select, insert

from ..database_manager import CashHistory
from ...db_utils.cashHistory_formatter import historyFormatter

def addEntryInCashHistory(db, uid, deposit):
    if not db or not uid or not deposit:
        raise ValueError("Internal Server Error")
    
    stmt = (
        insert(CashHistory)
        .values(uid=uid, deposit=deposit, date=func.now())
    )
    db.execute(stmt)
    db.commit()

def getDepositHistory(db, uid):
    if not db or not uid:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(CashHistory.uid, CashHistory.date, CashHistory.deposit)
        .where(uid == CashHistory.uid)
        .order_by(CashHistory.date.desc())
    )
    return historyFormatter(db.execute(stmt).mappings().all(), uid)