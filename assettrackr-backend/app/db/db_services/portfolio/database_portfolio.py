from sqlalchemy.dialects.postgresql import insert
import sqlalchemy as sa
from sqlalchemy import update, delete, select, func, literal
from decimal import Decimal

from ..database_manager import Portfolio

# ---------------- ADD OWNERSHIP OF STOCK TO PORTFOLIO  ----------------
def add_to_portfolio(db, uid, ticker, quantity):
    if not all([uid, ticker, quantity]):
        raise ValueError("uid, ticker, quantity are required")
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")
    
    print("database_portfolio: adding purchase to portfolio")

    ticker = ticker.upper()

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

def remove_from_portfolio(db, uid, ticker, quantity):
    if not all([uid, ticker, quantity]):
        raise ValueError("uid, ticker, quantity are required")
    
    quantity = Decimal(str(quantity))
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    ticker = ticker.upper()

    current_row = db.execute(
        sa.select(Portfolio.uid, Portfolio.ticker, Portfolio.quantity)
        .where(Portfolio.uid == uid, Portfolio.ticker == ticker)
    ).first()

    if current_row is None:
        raise ValueError(f"database_portfolio: No {ticker} found for user {uid}")
    
    current_quantity = current_row.quantity
    
    if current_quantity < quantity:
        raise ValueError(f"database_portfolio: Insufficient quantity. Have {current_quantity}, trying to remove {quantity}")

    update_stmt = (
        sa.update(Portfolio)
        .where(Portfolio.uid == uid, Portfolio.ticker == ticker, Portfolio.quantity >= quantity)
        .values(quantity=Portfolio.quantity - quantity)
        .returning(Portfolio.quantity)
    )
    result = db.execute(update_stmt)
    new_quantity = result.scalar_one_or_none()

    if new_quantity is None:
        raise ValueError(f"database_portfolio: Update failed - no rows affected")

    if new_quantity == 0:
        delete_stmt = (
            sa.delete(Portfolio)
            .where(Portfolio.uid == uid, Portfolio.ticker == ticker)
        )
        db.execute(delete_stmt)

    db.commit()

    return True