from datetime import datetime, time
from sqlalchemy import select
from zoneinfo import ZoneInfo 

from ..database_manager import Trades
from ....services.detailed_stock_view_service import retrieveLatestPrice
from ...db_utils.market_hours import checkMarketOpen

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
def log_trade(db, uid, ticker, status, status_tooltip, action, quantity, tradingType):
    if any(param is None for param in [uid, ticker, status, status_tooltip, action, quantity, tradingType]):
        raise ValueError("Internal Server Error")

    if status=="REJECTED":
        execution_price = 0
        execution_total_price = 0
        tradingType = "-"
    else:
        execution_price = retrieveLatestPrice(ticker)
        execution_total_price = execution_price * quantity
        status_tooltip = "Success"

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
