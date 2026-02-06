# all login related api calls

from flask import Blueprint, request, jsonify, make_response, g
from firebase_admin import auth
from functools import wraps
import datetime

from ..db_services.user_accounts.user_account_queries import create_user

bp = Blueprint("login_handler", __name__)

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print("login_handler: Authenticating...")

        auth_header = request.headers.get("Authorization", "")
        parts = auth_header.split()

        # looking for "Authorization: Bearer <ID_TOKEN>" in request header
        if len(parts) != 2 or parts[0].lower() != "bearer": 
            return jsonify({"error": "Missing token"}), 401
        try:
            # verify the JWT is issued by Firebase + hasnt expired.
            decoded = auth.verify_id_token(parts[1]) 
            request.user = decoded
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return wrapper

@bp.route("/authenticate", methods=["POST"])
@require_auth
def authenticate():
    print("login_handler: Received a login request...")
    return jsonify({"ok": True, "uid": request.user["uid"]})

@bp.route("/initialise_user", methods=["POST"])
@require_auth
def initialise_user():
    print("login_handler: Recived an initilisation request...")

    uid = request.user["uid"]
    email = request.user["email"]
    
    create_user(uid, email)

    return jsonify({"ok": True, "uid": request.user["uid"]})


@bp.route("/session", methods=["POST"])
def create_session():
    print("login_handler: Creating session...")
    data = request.get_json(silent=True) or {}
    idToken = data.get("idToken")
    if not idToken:
        return jsonify({
            "error": "idToken required"
        }), 400
    
    try:
        auth.verify_id_token(idToken)
        expiresIn = datetime.timedelta(days=5)
        sessionCookie = auth.create_session_cookie(idToken, expires_in=expiresIn)
    except Exception:
        return jsonify({
            "error": "unauthorised"
        }), 401
    
    response = make_response(jsonify({
        "status": "ok"
    }))
    response.set_cookie(
        "session",
        sessionCookie,
        max_age=int(expiresIn.total_seconds()),
        httponly=True,
        secure=True,
        samesite="Lax",
        path="/"
    )
    return response

@bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({
        "status": "signed out"
    }))
    response.delete_cookie("session", path="/")
    return response