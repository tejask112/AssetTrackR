from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from db.engine import engine
from db.tables.stocks import Stocks
from supported_stocks import STOCKS

def initialise_stocks() -> None:
    new_stock_objs = [
        Stocks(symbol = stock.upper()) for stock in STOCKS
    ]
    try:
        with Session(engine) as session:
            session.add_all(new_stock_objs)
            session.commit()

        print(f"Successfully inserted {len(new_stock_objs)} to 'Stocks' table")

    except SQLAlchemyError as e:
        print(str(e))
        session.rollback()

if __name__=="__main__":
    initialise_stocks()