from db.tables.base import Base

import uuid
from datetime import datetime
from sqlalchemy import UUID, Integer, String, Boolean, TIMESTAMP, func, UniqueConstraint, Index, text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


class NewsArticles(Base):
    __tablename__ = "news_articles"

    news_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("news_articles.news_id"), primary_key=True, nullable=False)
    finnhub_id: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    headline: Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str] = mapped_column(String, nullable=False)
    article_url: Mapped[str] = mapped_column(String, nullable=False)
    general_feed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false")) 
    published_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    stock_news_article_relationships: Mapped[list["StockNewsArticles"]] = relationship(back_populates="news_fk")  # foreign key to 'stock_recommendations.stock_id'

    __table_args__ = (
        UniqueConstraint(finnhub_id, name="unique_finnhub_id"),      # 'finnhub_id' must be unique to prevent same articles being stored multiple times
        Index("general_feed_index", published_at.desc(), postgresql_where=general_feed.is_(True))   # index to quickly look up recent general feed 
    )

