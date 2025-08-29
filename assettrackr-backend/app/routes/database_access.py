from flask import Blueprint, g
from ..services.database_manager import User

bp = Blueprint("database_access", __name__)


# ---------------- RETRIEVE ALL USERS  ----------------
@bp.route("/users")
def list_users():
    users = g.db.query(User).all #using pure ORM sqlAlchemy -> better than manually typing SQL queries
    return {"users": [{"id": u[0], "email": u[1]} for u in users]}

# ---------------- CREATE A NEW USER  ----------------
def create_user():
    pass