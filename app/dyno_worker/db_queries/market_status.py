from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import delete, select

from db.engine import engine
from db.tables.market import MarketStatus

def insert_current_market_status(curr_market_status: MarketStatus) -> None:
    with Session(engine) as session:
        try:
            session.execute(delete(MarketStatus))
            session.add(curr_market_status)
            session.commit()
            print("inserted into db")

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()

def get_current_market_status() -> MarketStatus | None:
    with Session(engine) as session:
        try:
            curr_market_status = session.scalars(select(MarketStatus)).first()
            return curr_market_status
        
        except SQLAlchemyError as e:
            print(str(e))
            
        return None