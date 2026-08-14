from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from db.engine import engine
from db.tables.company import CompanyProfile, CompanyMetrics
from db.tables.stocks import Stocks, StockRecommendations


async def insert_company_profile(symbol: str, company_profile: dict) -> None:
    """
    Inserts company profile data extracted from Finnhub API into the database table
    'company_profile'. On conflict, all new values are used.

    Parameters:
        symbol: current symbol we are inserting for
        company_profile: a dictionary containing all data to be inserted into db
    """

    with Session(engine) as session:
        try:
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            if stock_id is None:
                raise ValueError(f"No stock_id found for {symbol} in Stocks table")

            statement = insert(CompanyProfile).values(
                stock_id = stock_id,
                **company_profile
            )

            statement = statement.on_conflict_do_update(
                index_elements = [CompanyProfile.stock_id],
                set_ = {
                    key: getattr(statement.excluded, key) for key in company_profile
                }
            )

            session.execute(statement)
            session.commit()

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()


async def insert_stock_recommendations(symbol: str, stock_recommendations: dict) -> None:
    """
    Inserts stock_recommendation data extracted from Finnhub API into the database table
    'stock_recommendations'. On conflict, new values being inserted are ignored.

    Parameters:
        symbol: current symbol we are inserting for
        stock_recommendations: a list of dictionaries containing all recommendation snapshots to be inserted into db
    """

    with Session(engine) as session:
        try:
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            rows = [
                {
                    "stock_id": stock_id,
                    **snapshot
                }
                for snapshot in stock_recommendations
            ]

            statement = insert(StockRecommendations).values(rows)

            statement = statement.on_conflict_do_nothing(
                index_elements = [StockRecommendations.stock_id, StockRecommendations.covering_date_period]
            )

            session.execute(statement)
            session.commit()

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()    


async def insert_company_metrics(symbol: str, company_metrics: dict) -> None:
    """
    Inserts company metric data extracted from Finnhub API into the database table
    'company_metrics'. On conflict, all new values are used.

    Parameters:
        symbol: current symbol we are inserting for
        company_metrics: a dictionary containing all data to be inserted into db
    """

    with Session(engine) as session:
        try:
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            statement = insert(CompanyMetrics).values(
                stock_id = stock_id,
                **company_metrics
            )

            statement = statement.on_conflict_do_update(
                index_elements = [Stocks.stock_id],
                set_ = {
                    key: getattr(statement.excluded, key) for key in company_metrics
                }
            )

            session.execute(statement)
            session.commit()

        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()    