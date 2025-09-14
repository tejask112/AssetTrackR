from sqlalchemy.dialects.postgresql import insert
import sqlalchemy as sa
from sqlalchemy import update, delete, select, func, literal
from decimal import Decimal

from ..database_manager import Portfolio
from ...db_utils.format_numbers import format_quantity
from ..userAccounts.database_userAccounts import updateLiquidCash, checkLiquidCash

# ---------------- RETRIEVE PORTFOLIO FOR SPECIFIC USER  ----------------
def get_portfolio(db, uid):
    if not all ([db, uid]):
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Portfolio.ticker, Portfolio.quantity)
        .where(Portfolio.uid == uid)
    )

    rows = db.execute(stmt).mappings().all()
    return [{"ticker": r["ticker"], "quantity": str(r["quantity"])} for r in rows]

# ---------------- RETRIEVE PORTFOLIO HOLDINGS FOR SPECIFIC USER  ----------------
def get_portfolio_holdings(db, uid):
    if not db or not uid:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(Portfolio.ticker)
        .where(Portfolio.uid == uid)
    )

    return db.execute(stmt).mappings().all()

# ---------------- ADD OWNERSHIP OF STOCK TO PORTFOLIO  ----------------
def add_to_portfolio(db, uid, ticker, quantity, execution_price):
    if not all([uid, ticker, quantity, execution_price]):
        raise ValueError("Internal Server Error")
    if quantity <= 0:
        raise ValueError("You attempted to process a transaction for quantity 0")
    if execution_price < 0:
        raise ValueError("Internal Server Error")
    
    print("database_portfolio: adding purchase to portfolio")

    ticker = ticker.upper()

    try:
        check_add_to_portfolio(db, uid, ticker, quantity, execution_price)

        total_price = execution_price * quantity
        updateLiquidCash(db, uid, total_price, "BUY")

        stmt = (
            insert(Portfolio)
            .values(uid=uid, ticker=ticker, quantity=quantity)
            .on_conflict_do_update(
                index_elements=[Portfolio.uid, Portfolio.ticker],  
                set_={"quantity": Portfolio.quantity + quantity}    # if user already owns that ticker, increase its quantity
            )
            .returning(Portfolio.quantity)
        )

        db.execute(stmt).one()
        db.commit()

        return True
    except Exception as e:
        raise ValueError(e)
    
# ---------------- CHECK IF USER CAN ADD TO PORTFOLIO ----------------
def check_add_to_portfolio(db, uid, ticker, quantity, execution_price):
    if not all([uid, ticker, quantity, execution_price]):
        raise ValueError("Internal Server Error")
    if quantity <= 0:
        raise ValueError("You attempted to process a transaction for quantity 0")
    if execution_price < 0:
        raise ValueError("Internal Server Error")
    
    try:
        total_price = execution_price * quantity
        checkLiquidCash(db, uid, total_price)
        return True
    except Exception as e:
        raise ValueError(e)

# ---------------- REMOVE OWNERSHIP OF STOCK TO PORTFOLIO  ----------------
def remove_from_portfolio(db, uid, ticker, quantity, execution_price):
    if not all([uid, ticker, quantity]):
        raise ValueError("Internal Server Error")

    check_remove_from_portfolio(db, uid, ticker, quantity)
    
    update_stmt = (
        sa.update(Portfolio)
        .where(Portfolio.uid == uid, Portfolio.ticker == ticker, Portfolio.quantity >= quantity)
        .values(quantity=Portfolio.quantity - quantity)
        .returning(Portfolio.quantity)
    )
    result = db.execute(update_stmt)
    new_quantity = result.scalar_one_or_none()

    if new_quantity is None:
        raise ValueError(f"Internal Server Error. Please try again later.")

    if new_quantity == 0:
        delete_stmt = (
            sa.delete(Portfolio)
            .where(Portfolio.uid == uid, Portfolio.ticker == ticker)
        )
        db.execute(delete_stmt)

    db.commit()

    total_price = quantity * execution_price
    updateLiquidCash(db, uid, total_price, "SELL")


    return True

# ---------------- CHECK IF USER CAN REMOVE FROM PORTFOLIO ----------------
def check_remove_from_portfolio(db, uid, ticker, quantity):
    if not all([uid, ticker, quantity]):
        raise ValueError("Internal Server Error")
    
    quantity = Decimal(str(quantity))
    if quantity <= 0:
        raise ValueError("You attempted to process a transaction for quantity 0")
    
    ticker = ticker.upper()

    current_row = db.execute(
        sa.select(Portfolio.uid, Portfolio.ticker, Portfolio.quantity)
        .where(Portfolio.uid == uid, Portfolio.ticker == ticker)
    ).first()

    if current_row is None:
        raise ValueError(f"At the time of the transaction, you did not own any stocks for {ticker} ")
    
    current_quantity = current_row.quantity
    
    if current_quantity < quantity:
        raise ValueError(f"Insufficient quantity. At the time of the transaction you owned {format_quantity(current_quantity)}, but tried to sell {format_quantity(quantity)}")
    
    return True