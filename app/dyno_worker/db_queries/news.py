from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from db.engine import engine
from db.tables.stocks import Stocks, StockNewsArticles
from db.tables.news import NewsArticles


async def insert_news(general_news:bool, symbol:str | None, news:list[dict]) -> None:
    with Session(engine) as session:
        try :
            insert_statement = insert(NewsArticles).values(news)
            insert_statement = insert_statement.on_conflict_do_nothing(index_elements=[NewsArticles.finnhub_id])
            session.execute(insert_statement)

            if general_news:
                session.commit()
                return

            # collect all finnhub id's from the news articles
            finnhub_ids = []
            for article in news:
                finnhub_ids.append(article["finnhub_id"])

            # for those finnhub id's we just inserted, get all the news_id uuid's for them
            retrieve_ids_statement = (
                select(NewsArticles.news_id)
                .where(NewsArticles.finnhub_id.in_(finnhub_ids))
            )

            result = session.execute(retrieve_ids_statement)
            news_ids = result.scalars().all()

            # get the current stock's stock_id
            stock_id = session.scalar(
                select(Stocks.stock_id)
                .where(Stocks.symbol == symbol)
            )

            if stock_id is None:
                raise ValueError(f"No stock_id found for {symbol} in Stocks table")

            # combine stock_id and news_id uuid into one dictionary
            join_values = []
            for id in news_ids:
                join_values.append({
                    "news_id": id,
                    "stock_id": stock_id
                })

            # insert the dictionary into StockNewsArticles to join the articles with the stock/company
            insert_into_stock_news = insert(StockNewsArticles).values(join_values)
            insert_into_stock_news = insert_into_stock_news.on_conflict_do_nothing(index_elements=[StockNewsArticles.stock_id, StockNewsArticles.news_id])
            session.execute(insert_into_stock_news)

            session.commit()
                            
        except SQLAlchemyError as e:
            print(str(e))
            session.rollback()