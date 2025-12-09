import os
import uuid

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, create_engine, CheckConstraint, PrimaryKeyConstraint, Index, select, JSON, text
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.sql import func

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://dev_user:password@localhost:5432/postgres",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
    echo=False
)

SessionLocal = scoped_session(
    sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
        future=True
    )
)

Base = declarative_base()

# User Table
class User(Base):
    __tablename__ = "users"
    uid = Column(String(128), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    cash = Column(Numeric(64, 16), nullable=False)
    watchlist = Column(MutableDict.as_mutable(JSONB),nullable=False,server_default=text("'{}'::jsonb"))

    trades = relationship (
        "Trades",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    portfolio = relationship (
        "Portfolio",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<User id:{self.uid} email={self.email!r} cash={self.cash!r}>"

# Table containing all trades eg BUY, SELL history
class Trades(Base):
    __tablename__ = "trades"
    trade_id = Column(String(128), primary_key=True, default=lambda: str(uuid.uuid4()))
    uid = Column(String(128), ForeignKey("users.uid", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    ticker = Column(String(8), nullable=False)
    status = Column(String(128), nullable=False)
    status_tooltip = Column(String(128))
    quantity = Column(Numeric(28, 8), nullable=False)
    action = Column(String(128), nullable=False)
    execution_price = Column(Numeric(64, 16), nullable=False)
    execution_total_price = Column(Numeric(64, 16), nullable=False)
    trading_type = Column(String(128)) #eg Over the Counter (OTC)
    
    user = relationship("User", back_populates="trades")

# Table containing all stocks a user holds
class Portfolio(Base):
    __tablename__ = "portfolio"
    uid = Column(String(128), ForeignKey("users.uid", ondelete="CASCADE"), primary_key=True, nullable=False, index=True)
    ticker = Column(String(8), primary_key=True, nullable=False)
    quantity = Column(Numeric(28, 8), nullable=False)

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="portfolio_quantity_nonneg"),
    )

    user = relationship("User", back_populates="portfolio")

class Timeline(Base):
    __tablename__ = "timeline"
    uid = Column(String(128), ForeignKey("users.uid", ondelete="CASCADE"), primary_key=True, nullable=False)
    date = Column(DateTime(timezone=True),  primary_key=True, nullable=False)
    value = Column(Numeric(64, 16), nullable=False)
    portfolio = Column(MutableDict.as_mutable(JSON), default=dict, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('uid', 'date', name='pk_timeline_uid_date'),
        Index('ix_timeline_uid_date_desc', 'uid', date.desc()),
    )

class CashHistory(Base):
    __tablename__ = "cashHistory"
    uid = Column(String(128), ForeignKey("users.uid", ondelete="CASCADE"), primary_key=True, nullable=False)
    date = Column(DateTime(timezone=True),  primary_key=True, nullable=False, server_default=func.now())
    deposit = Column(Numeric(11, 3), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('uid', 'date', name='pk_cashHistory_uid_date'),
    )


def init_db():
    # create tables (only for dev - use Alembic when migrating)
    Base.metadata.create_all(bind=engine)