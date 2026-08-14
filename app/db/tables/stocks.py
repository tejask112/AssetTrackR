from db.tables.base import Base
from db.tables.news import NewsArticles
from db.tables.company import CompanyProfile, CompanyMetrics

import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy import Identity, Integer, String, Numeric, TIMESTAMP, UUID, UniqueConstraint, CheckConstraint, ForeignKey, Index, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

class Stocks(Base):
    __tablename__ = "stocks"

    stock_id: Mapped[int] = mapped_column(Integer, Identity(always=True), primary_key=True, nullable=False)
    symbol: Mapped[str] = mapped_column(String, nullable=False)

    historical_prices: Mapped[list["StockHistoricalPrices"]] = relationship(back_populates="stock_fk")
    current_price: Mapped[Optional["StockCurrentPrices"]] = relationship(back_populates="stock_fk")
    news_articles: Mapped[list["StockNewsArticles"]] = relationship(back_populates="stock_fk")
    recommendations: Mapped[list["StockRecommendations"]] = relationship(back_populates="stock_fk")
    company_profile: Mapped[Optional["CompanyProfile"]] = relationship(back_populates="stock_fk")
    company_metrics: Mapped[Optional["CompanyMetrics"]] = relationship(back_populates="stock_fk")

    __table_args__ = (
        UniqueConstraint("symbol", name="symbol_constraint"),   # unique constraint on 'symbol'
        CheckConstraint("symbol = UPPER(symbol)", name="check_symbol_uppercase")    # upper case constraint on 'symbol'
    )


class StockHistoricalPrices(Base):
    __tablename__ = "stock_historical_prices"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_id"), primary_key=True)
    price: Mapped[Decimal] = mapped_column(Numeric(20,4), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    recorded_minute: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, primary_key=True)

    stock_fk: Mapped["Stocks"] = relationship(back_populates="historical_prices")    # foreign key to 'stocks.stock_id'

    __table_args__ = (
        CheckConstraint("recorded_minute = date_trunc('minute', recorded_at)", name="check_recorded_at_minute_aligns"),     # checks whether 'recorded_at' and 'recorded_bucket' align to the same minute
        CheckConstraint("(recorded_minute AT TIME ZONE 'America/New_York')::time BETWEEN TIME '09:30:00' AND TIME '16:00:00'", name="check_recorded_minute_market_hours"),    # check prices are between market hours only
        CheckConstraint("price >= 0", name="check_price_nonnegative"),   # check the price is not negative
        Index("stock_id_price_index", stock_id, recorded_minute.desc())
    )


class StockCurrentPrices(Base):
    __tablename__ = "stock_current_prices"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_id"), primary_key=True)
    price: Mapped[Decimal] = mapped_column(Numeric(20,4), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    recorded_minute: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

    stock_fk: Mapped["Stocks"] = relationship(back_populates="current_price")    # foreign key to 'stocks.stock_id'

    __table_args__ = (
        UniqueConstraint("stock_id", name="stock_id_constraint"),    # only 1 stock_id price should exist (only the current price)
        CheckConstraint("recorded_minute = date_trunc('minute', recorded_at)", name="check_recorded_at_minute_aligns"),     # checks whether 'recorded_at' and 'recorded_bucket' align to the same minute
        CheckConstraint("(recorded_minute AT TIME ZONE 'America/New_York')::time BETWEEN TIME '09:30:00' AND TIME '16:00:00'", name="check_recorded_minute_market_hours"),    # check prices are between market hours only
        CheckConstraint("price >= 0", name="check_price_nonnegative")   # check the price is not negative
    )


class StockNewsArticles(Base):
    __tablename__ = "stock_news_articles"

    news_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("news_articles.news_id"), primary_key=True, nullable=False)
    stock_id: Mapped[int] = mapped_column(Integer, ForeignKey("stocks.stock_id"), primary_key=True, nullable=False)

    stock_fk: Mapped["Stocks"] = relationship(back_populates="news_articles")
    news_fk: Mapped["NewsArticles"] = relationship(back_populates="stock_news_article_relationships")


class StockRecommendations(Base):
    __tablename__ = "stock_recommendations"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_id"), primary_key=True)
    covering_date_period: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), primary_key=True, nullable=False)
    current_recommendation: Mapped[str] = mapped_column(String)
    strong_buy: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    buy: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    hold: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    sell: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    strong_sell: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

    stock_fk: Mapped["Stocks"] = relationship(back_populates="recommendations")

    __table_args__ = (
        CheckConstraint("strong_buy >= 0 AND buy >= 0 AND hold >=0 AND sell >= 0 AND strong_sell >= 0", name="check_ratings_nonnegative"),  # check the ratings are non negative
        CheckConstraint("current_recommendation IS NULL OR current_recommendation IN ('strong_buy', 'buy', 'hold', 'sell', 'strong_sell')", name="check_current_recommendation_valid")  # checks current recommendation is either null or a valid recommendation
    )
