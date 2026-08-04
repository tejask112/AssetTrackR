from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from db.engine import engine
from db.tables.market import MarketStatus


def insert_current_market_status(is_open: bool, session: str | None, holiday: str | None) -> None:
    curr_market_status = MarketStatus(
        is_open=is_open,
        session=session,
        holiday=holiday
    )

    with Session(engine) as session:
        try:
            session.add(curr_market_status)
            session.commit()
            print("inserted into db")

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()