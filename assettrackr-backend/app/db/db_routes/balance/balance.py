from flask import Blueprint, request, jsonify, g
import firebase_admin
from firebase_admin import auth as firebase_auth

from ...db_services.userAccounts.database_userAccounts import updateLiquidCash

bp = Blueprint("balance", __name__)

@bp.route('/deposit', methods=['POST'])
def deposit():
    payload = request.get_json()
    uid = payload.get("uid")
    deposit = payload.get("value")
    jwt = payload.get("token")

    if not uid or not deposit or not jwt or not isinstance(uid, str):
        return jsonify({ "error": "Bad Request/Missing Fields" })
    
    try:
        decoded = firebase_auth.verify_id_token(jwt)
        uid_from_token = decoded["uid"]
        if uid_from_token != uid:
            raise ValueError
    except:
        return jsonify({ "error": "Invalid JWT" })
    
    try:
        deposit = float(deposit)
    except:
        return jsonify({ "error": "Bad Request/Missing Fields" })

    if deposit>9999999.99 or deposit<0.01:
        return jsonify({ "error": "Bad Request/Missing Fields" })
    
    try:
        remaining = updateLiquidCash(g.db, uid, deposit, "DEPOSIT")
    except Exception as e:
        return jsonify({ "error": str(e) })
    
    return jsonify({ 
        "success": "ok",
        "remaining_balance": str(remaining) 
    })
    

