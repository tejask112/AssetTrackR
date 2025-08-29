from flask import  g
from ..database_manager import User
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import or_

# ---------------- RETRIEVE ALL USERS  ----------------
def list_users():
    users = g.db.query(User).all() #using pure ORM sqlAlchemy -> better than manually typing SQL queries
    json_data = {"users": [{"id": u.uid, "email": u.email} for u in users]}
    print(f"database_userAccounts: All registered users: {json_data}")
    return json_data

# ---------------- CREATE NEW USER  ----------------
def create_user(db, uid, email):
    print(f"database_userAccounts: Creating new user... uid: {uid}, email: {email}")
    if not uid or not email:
        return ValueError("UID and Email are required")
    
    stmt = (
        insert(User)
        .values(uid=uid, email=email)
        .on_conflict_do_nothing(index_elements=[User.uid])
        .returning(User.uid)
    )
    db.execute(stmt)
    db.commit()