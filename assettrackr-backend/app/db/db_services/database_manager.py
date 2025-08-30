import os
import uuid

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base, relationship

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
    cash = Column(Integer, nullable=False)

    trades = relationship (
        "Trades",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<User id:{self.uid} email={self.email!r} cash={self.cash!r}>"

# Trades Table
class Trades(Base):
    __tablename__ = "trades"
    trade_id = Column(String(128), primary_key=True, default=lambda: str(uuid.uuid4()))
    uid = Column(String(128), ForeignKey("users.uid", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    ticker = Column(String(128), nullable=False)
    status = Column(String(128), nullable=False)
    action = Column(String(128), nullable=False)
    quantity = Column(Integer, nullable=False)
    execution_price = Column(Numeric(18, 4), nullable=False)
    execution_total_price = Column(Numeric(18, 4), nullable=False)
    trading_type = Column(String(128)) #eg Over the Counter (OTC)
    
    user = relationship("User", back_populates="trades")

    
def init_db():
    # create tables (only for dev - use Alembic when migrating)
    Base.metadata.create_all(bind=engine)