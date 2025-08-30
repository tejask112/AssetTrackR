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

def remove_from_portfolio(db, uid, ticker, quantity):
    if not all([uid, ticker, quantity]):
        raise ValueError("uid, ticker, quantity are required")
    
    quantity = Decimal(str(quantity))
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")
    
    print("database_portfolio: removing from portfolio")

    ticker = ticker.upper()

    # update ... returning -> only runs when (uid, ticker) exists and quantity>=quantity. it returns the new quantity as 'new_quantity'
    update_cte = (
        sa.update(Portfolio)
        .where(Portfolio.uid == uid, Portfolio.ticker == ticker, Portfolio.quantity >= quantity)
        .values(quantity=Portfolio.quantity - quantity)
        .returning(Portfolio.uid.label("uid"), Portfolio.ticker.label("ticker"), Portfolio.quantity.label("new_quantity"))
        .cte("upd")
    )

    # uses "update" to delete the row if new_quantity==0
    delete_cte = (
        sa.delete(Portfolio)
        .where(Portfolio.uid == update_cte.c.uid, Portfolio.ticker == update_cte.c.ticker, update_cte.c.new_quantity == 0)
        .returning(sa.literal(0).label("new_quantity"))
        .cte("del")
    )

    # chooses delete.new_quantity if a delete happened, otherwise picks updated.new_quantity
    stmt = (sa.select(delete_cte.c.new_quantity).union_all(sa.select(update_cte.c.new_quantity)).limit(1))
    new_quantity = db.execute(stmt).scalar_one_or_none()

    if new_quantity is None:
        raise ValueError(f"database_portfolio: No {ticker} found or insufficient quantity to remove {quantity}") 
    
    db.commit()