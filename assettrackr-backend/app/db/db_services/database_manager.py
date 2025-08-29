import os
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base

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

class User(Base):
    __tablename__ = "users"
    uid = Column(String(128), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)

    def __repr__(self):
        return f"<User id:{self.uid} email={self.email!r}>"
    
def init_db():
    # create tables (only for dev - use Alembic when migrating)
    Base.metadata.create_all(bind=engine)