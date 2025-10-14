from flask import g
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import literal
from sqlalchemy.dialects.postgresql import JSONB
import sqlalchemy as sa
from sqlalchemy import select, func
from datetime import datetime
from zoneinfo import ZoneInfo 
from sqlalchemy import update, func, cast, literal
from sqlalchemy.dialects.postgresql import JSONB

from ..database_manager import User, Timeline

# ---------------- RETRIEVE ALL USERS  ----------------
def list_users():
    users = g.db.query(User).all() #using pure ORM sqlAlchemy -> better than manually typing SQL queries
    json_data = {"users": [{"id": u.uid, "email": u.email, "cash": u.cash} for u in users]}
    print(f"database_userAccounts: All registered users: {json_data}")
    return json_data

# ---------------- CREATE NEW USER  ----------------
def create_user(db, uid, email):
    print(f"database_userAccounts: Creating new user... uid: {uid}, email: {email}")
    if not uid or not email:
        return ValueError("UID and Email are required")
    
    stmt = (
        insert(User)
        .values(uid=uid, email=email, cash=100000, watchlist=literal({}).cast(JSONB))
        .on_conflict_do_nothing(index_elements=[User.uid])
        .returning(User.uid)
    )
    db.execute(stmt)
    db.commit()

    list_users()

# ---------------- GET USER'S CASH BALANCE  ----------------
def getLiquidCash(db, uid):
    if not uid:
        raise ValueError("Internal Server Error")
    
    stmt = (
        select(User.cash)
        .where(User.uid == uid)
    )

    return db.execute(stmt).scalar_one()

# ---------------- CHECK IF USER HAS ENOUGH CASH FOR TRANSACTION  ----------------
def checkLiquidCash(db, uid, total_price):
    if not all([uid, total_price]):
        raise ValueError("Internal Server Error")
    
    if total_price < 0:
        raise ValueError("Internal Server Error")
    
    current_user = db.execute(
        sa.select(User.uid, User.cash)
        .where(User.uid == uid)
    ).first()

    if current_user is None:
        raise ValueError("Internal Server Error")
    
    print(f"database_userAccounts: Retrieved user record: {current_user}")
    
    current_cash_balance = current_user.cash
    if (current_cash_balance <= total_price):
        raise ValueError("You do not have sufficient funds to complete this transaction")
    
    return True  

# ---------------- UPDATE USER'S CASH BALANCE  ----------------
def updateLiquidCash(db, uid, total_price, action):
    if not all([uid, total_price]):
        raise ValueError("Internal Server Error")
    
    try:
        if (action == "BUY"):
            checkLiquidCash(db, uid, total_price)

            update_stmt = (
                sa.update(User)
                .where(User.uid == uid)
                .values(cash = User.cash - total_price)
                .returning(User.cash)
            )
        elif (action == "SELL"):
            update_stmt = (
                sa.update(User)
                .where(User.uid == uid)
                .values(cash = User.cash + total_price)
                .returning(User.cash)
            )
        else:
            raise ValueError("Internal Server Error")

        result = db.execute(update_stmt)
        new_cash_balance = result.scalar_one_or_none()

        if new_cash_balance is None:
            raise ValueError("Internal Server Error")

    except Exception as e:
        raise ValueError(e)

# ---------------- GET USER'S WATCHLIST ----------------
def getWatchList(db, uid):
    if not db or not uid:
        raise ValueError("Internal Server Error")

    user = db.get(User, uid)
    if user is None:
        raise ValueError("User not found")
    watchlist = user.watchlist or {}
    return watchlist

# ---------------- CHECK COMPANY IN WATCHLIST ----------------
def checkInWatchList(db, uid, ticker):
    if not all ([db, uid, ticker]):
        raise ValueError("Internal Server Error")
    
    user = db.get(User, uid)
    if user is None:
        raise ValueError("User not found")
    watchlist = user.watchlist or {}
    return ticker in watchlist

# ---------------- ADD COMPANY TO WATCHLIST  ----------------
def addToWatchList(db, uid, ticker, companyName):
    if not all ([db, uid, ticker, companyName]):
        raise ValueError("Internal Server Error")
    
    user = db.get(User, uid)
    if user is None:
        raise ValueError("User not found")
    if user.watchlist is None:
        user.watchlist = {}
    user.watchlist.setdefault(ticker, companyName) 
    db.commit()

# ---------------- ADD COMPANY TO WATCHLIST  ----------------
def removeFromWatchList(db, uid, ticker):
    if not all ([db, uid, ticker]):
        raise ValueError("Internal Server Error")
    
    user = db.get(User, uid)
    if user is None:
        raise ValueError("User not found")
    if user.watchlist is None:
        user.watchlist = {}
    user.watchlist.pop(ticker, None)
    db.commit()