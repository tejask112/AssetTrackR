from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
from decimal import Decimal

from db.engine import engine
from db.tables.stocks import Stocks, StockHistoricalPrices, StockCurrentPrices

def insert_to_current_prices(symbol: str, price: Decimal, recorded_at: datetime, recorded_minute: datetime) -> None:
    """
    Inserts the price for a given symbol into 'stock_current_prices' database table. If there is
    a conflict on stock_id, the row is updated to contain the new price and recorded_at values.

    Parameters:
        symbol: str symbol/ticker representing the stock
        price: decimal price value of the stock
        recorded_at: datetime object of when the price was ingested at (down to second and millisecond)
        recorded_minute: datetime object representing the minute bucket.
    """
    with Session(engine) as session:
        try:
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            if stock_id is None:
                raise ValueError(f"No stock_id found for {symbol} in Stocks table")

            statement = insert(StockCurrentPrices).values(
                stock_id=stock_id,
                price=price,
                recorded_at=recorded_at,
                recorded_minute=recorded_minute
            )

            statement = statement.on_conflict_do_update(
                index_elements = [StockCurrentPrices.stock_id],
                set_ = {
                    "price": statement.excluded.price,
                    "recorded_at": statement.excluded.recorded_at,
                    "recorded_minute": statement.excluded.recorded_minute
                }
            )

            session.execute(statement)
            session.commit()

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()


def insert_to_historical_prices(symbol: str, price: Decimal, recorded_at: datetime, recorded_minute: datetime) -> None:
    """
    Inserts the price for a given symbol into 'stock_historical_prices' database table.

    Parameters:
        symbol: str symbol/ticker representing the stock
        price: decimal price value of the stock
        recorded_at: datetime object of when the price was ingested at (down to second and millisecond)
        recorded_minute: datetime object representing the minute bucket.
    """
    with Session(engine) as session:
        try:
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            statement = insert(StockHistoricalPrices).values(
                stock_id=stock_id,
                price=price,
                recorded_at=recorded_at,
                recorded_minute=recorded_minute
            )

            session.execute(statement)
            session.commit()

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()

def insert_price_into_db(symbol: str, price: Decimal, recorded_at: datetime) -> None:
    """
    Proxy function which takes recorded price data and inserts it into the current price cache
    table and the historical prices table.

    Parameters:
        symbol: str symbol/ticker representing the stock
        price: decimal price value of the stock
        recorded_at: datetime object of when the price was ingested at
    """
    recorded_minute = recorded_at.replace(second = 0, microsecond = 0)

    insert_to_current_prices(symbol, price, recorded_at, recorded_minute)
    insert_to_historical_prices(symbol, price, recorded_at, recorded_minute)