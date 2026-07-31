from base import Base
from datetime import datetime

from sqlalchemy import TIMESTAMP, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

class MarketStatus(Base):
    __tablename__ = "market_status"

    date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), primary_key=True, nullable=False) 
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    session: Mapped[str] = mapped_column(String, nullable=True)
    holiday: Mapped[str] = mapped_column(String, nullable=True)