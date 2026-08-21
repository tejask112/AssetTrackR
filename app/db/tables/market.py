from db.tables.base import Base
from datetime import datetime
from sqlalchemy import TIMESTAMP, Boolean, String, func, ForeignKey, Integer, Numeric, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from decimal import Decimal

from db.tables.stocks import Stocks

class MarketStatus(Base):
    __tablename__ = "market_status"

    date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), primary_key=True, nullable=False, server_default=func.now()) 
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    session: Mapped[str | None] = mapped_column(String, nullable=True)
    holiday: Mapped[str | None] = mapped_column(String, nullable=True)

class MarketMovers(Base):
    __tablename__ = "market_movers"

    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.stock_ids"), primary_key=True)
    mover_type: Mapped[str] = mapped_column(String, nullable=False, primary_key=True)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    change_amount_24hr: Mapped[Decimal] = mapped_column(Numeric(20,4), nullable=False)
    change_pct_24hr: Mapped[Decimal] = mapped_column(Numeric(20,2), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint("mover_type IN ('gainer', 'loser')", name="check_mover_type_valid"),
        CheckConstraint("rank BETWEEN 1 AND 15", name="check_rank_range"),
        UniqueConstraint(mover_type, rank, name="unique_rank_per_mover_type"),
        UniqueConstraint(mover_type, stock_id, name="unique_stock_id_per_mover_type")
    )