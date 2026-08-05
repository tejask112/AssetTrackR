from sqlalchemy.orm import Session

from db.engine import engine
from db.tables.stocks import StockHistoricalPrices

def insert_price_into_db() -> None:
    pass