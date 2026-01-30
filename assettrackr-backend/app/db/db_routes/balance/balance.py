from flask import Blueprint, request, jsonify, g
import firebase_admin
from firebase_admin import auth as firebase_auth

from ...db_services.userAccounts.user_account_queries import update_liquid_cash
from ...db_services.depositLogs.deposit_logs_queries import add_deposit_log_entry, get_deposit_logs


bp = Blueprint("balance", __name__)

@bp.route('/deposit', methods=['POST'])
def deposit():
    payload = request.get_json()
    uid = payload.get("uid")
    deposit = payload.get("value")
    jwt = payload.get("token")

    if not uid or not deposit or not isinstance(uid, str):
        return jsonify({ "error": "Missing Fields" })
    
    try:
        deposit = float(deposit)
        if deposit>9999999.99 or deposit<0.01:
            raise ValueError("Bad Request")
    except Exception as e:
        return jsonify({ "error": str(e) })
    try:
        remaining = update_liquid_cash(uid, deposit, "DEPOSIT")
        add_deposit_log_entry(uid, deposit)
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
        history = get_deposit_logs(uid)
        print(f"history: {history}")
        return jsonify(history)
    except Exception as e:
        return jsonify({ "error": str(e) })
    

