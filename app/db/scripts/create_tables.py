from db.engine import engine
from db.tables.base import Base

from db.tables.market import MarketStatus
from db.tables.stocks import Stocks, StockHistoricalPrices, StockCurrentPrices, StockNewsArticles, StockRecommendations
from db.tables.news import NewsArticles

def create_tables() -> None:
    try:
        Base.metadata.create_all(engine)
        print("Database tables created")
    except Exception as error:
        print(f"Exception: {error}")

if __name__ == "__main__":
    create_tables()