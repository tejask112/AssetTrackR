from datetime import datetime, time
from sqlalchemy import select, update, func
from zoneinfo import ZoneInfo 
from decimal import Decimal, ROUND_HALF_UP

from ..database_manager import Trades
from ...db_utils.market_hours import checkMarketOpen

Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

# ---------------- FETCH ALL TRADES (for specific user) ----------------
def get_user_trades(db, uid):
    stmt = (
        select(Trades.trade_id, Trades.ticker, Trades.status, Trades.status_tooltip, Trades.action, Trades.quantity, Trades.trading_type, Trades.date, Trades.execution_price, Trades.execution_total_price)
        .where(Trades.uid == uid)
        .order_by(Trades.date.desc())
    )

    res = db.execute(stmt).mappings().all()
    return res

# ---------------- LOG A TRADE  ----------------
def log_trade(db, uid, ticker, status, status_tooltip, action, quantity, execution_price, tradingType):
    if any(param is None for param in [uid, ticker, status, status_tooltip, action, quantity, execution_price, tradingType]):
        raise ValueError("Internal Server Error")

    if status=="REJECTED":
        execution_price = Decimal(0).quantize(P16, rounding=ROUND_HALF_UP)
        execution_total_price = Decimal(0).quantize(P16, rounding=ROUND_HALF_UP)
        tradingType = "-"
    else:
        execution_total_price = execution_price * quantity
        status_tooltip = "Success"
        execution_price = Decimal(execution_price).quantize(P16, rounding=ROUND_HALF_UP)
        execution_total_price = Decimal(execution_total_price).quantize(P16, rounding=ROUND_HALF_UP)

    utc_now = datetime.now(tz=ZoneInfo("UTC"))

    ticker = ticker.upper()

    print("database_trades: logging order to database...")
    trade = Trades (
        uid=uid,
        date=utc_now,
        ticker=ticker,
        status=status,
        status_tooltip=status_tooltip,
        action=action,
        quantity=quantity,
        execution_price=execution_price,
        execution_total_price=execution_total_price,
        trading_type=tradingType
    )
    try:
        db.add(trade)
        db.commit()
        db.refresh(trade)
        print("database_trades: logged")
    except Exception as error:
        print("database_trades: ", error)

    return status

# ---------------- UPDATE A TRADE (for queued orders) ----------------
def update_trade(db, trade_id, uid, status, status_tooltip, execution_price, execution_total_price):
    if any(param is None for param in [db, trade_id, uid, status, status_tooltip, execution_price, execution_total_price]):
        raise ValueError("Internal Server Error")

    if status=="REJECTED":
        execution_price = Decimal(0).quantize(P16, rounding=ROUND_HALF_UP)
        execution_total_price = Decimal(0).quantize(P16, rounding=ROUND_HALF_UP)
        trading_type = "-"
    else:
        execution_price = Decimal(execution_price).quantize(P16, rounding=ROUND_HALF_UP)
        execution_total_price = Decimal(execution_total_price).quantize(P16, rounding=ROUND_HALF_UP)
        trading_type = "Over The Counter (OTC)"

    stmt = (
        update(Trades)
        .where(Trades.trade_id==trade_id, Trades.uid==uid, Trades.status=="QUEUED")
        .values(status=status, status_tooltip=status_tooltip, execution_price=execution_price, execution_total_price=execution_total_price, trading_type=trading_type, date=func.now())
    )

    res = db.execute(stmt)
    db.commit()
    return res.rowcount == 1
    
# ---------------- FETCH ALL QUEUED TRADES (all users) ----------------
def get_queued_trades(db):
    status = "QUEUED"
    stmt = (
        select(Trades.trade_id, Trades.uid, Trades.ticker, Trades.quantity, Trades.action)
        .where(Trades.status == status)
        .order_by(Trades.date.asc())
    )
    res = db.execute(stmt).mappings().all()
    return res

# ---------------- FETCH FILTERED TRADES (for timeline) ----------------
def get_filtered_trades(db, uid, date_cutoff):
    if any(param is None for param in [db, uid, date_cutoff]):
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Trades.date, Trades.ticker, Trades.quantity, Trades.action, Trades.execution_total_price)
        .where((Trades.uid == uid) & (Trades.status == "FILLED") & (Trades.date > date_cutoff))
        .order_by(Trades.date.desc())
    )

    return db.execute(stmt).scalars().all()