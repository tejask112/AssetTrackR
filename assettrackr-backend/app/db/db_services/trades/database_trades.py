from datetime import datetime, timezone

from ..database_manager import Trades
from ....services.detailed_stock_view_service import retrieveLatestPrice

# ---------------- FETCH ALL TRADES (for specific user) ----------------
def get_user_trades(db, uid):
    return db.query(Trades).filter(Trades.user_uid == uid).order_by(Trades.placed_at.desc()).all()

# ---------------- LOG A TRADE  ----------------
def log_trade(db, uid, ticker, status, action, quantity, tradingType):
    if not all([uid, ticker, status, action, quantity, tradingType]):
        raise ValueError("uid, ticker, status, action, quantity, tradingType are required")

    execution_price = retrieveLatestPrice(ticker)
    execution_total_price = execution_price * quantity

    date = datetime.now(timezone.utc)
    # marketHour = datetime.datetime.now(pytz.timeZone('America/New_York'))

    ticker = ticker.upper()

    print("database_trades: logging order to database...")
    trade = Trades (
        uid=uid,
        date=date,
        ticker=ticker,
        status=status,
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
    return trade