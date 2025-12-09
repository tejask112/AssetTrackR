from flask import Blueprint, request, jsonify, g
import firebase_admin
from firebase_admin import auth as firebase_auth

from ...db_services.userAccounts.database_userAccounts import updateLiquidCash
from ...db_services.cashHistory.database_cashHistory import addEntryInCashHistory, getDepositHistory

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
            raise ValueError("Invalid JWT")
        
        deposit = float(deposit)
        if deposit>9999999.99 or deposit<0.01:
            raise ValueError("Bad Request/Missing Fields")
    except Exception as e:
        return jsonify({ "error": str(e) })
    try:
        remaining = updateLiquidCash(g.db, uid, deposit, "DEPOSIT")
        addEntryInCashHistory(g.db, uid, deposit)
    except Exception as e:
        return jsonify({ "error": str(e) })
    
    return jsonify({ 
        "success": "ok",
        "remaining_balance": str(remaining) 
    })
    
@bp.route('/deposit_history', methods=["GET"])
def deposit_history():
    print("entering endpoint")
    uid = request.args.get("uid")

    print("checking for uid")
    if not uid:
        print("no uid found")
        return jsonify({ "error": "Bad Request/Missing Fields" })
    
    print("entering try catch")
    try:
        history = getDepositHistory(g.db, uid)
        print(f"history: {history}")
        return jsonify(history)
    except Exception as e:
        return jsonify({ "error": str(e) })
    

