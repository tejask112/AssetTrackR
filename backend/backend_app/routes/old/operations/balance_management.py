from flask import Blueprint, request, jsonify, g

from ....utils.payload_validations import validate_deposit_payload, validate_deposit_history_payload

from ....db_services.user_accounts.user_account_queries import update_liquid_cash
from ....db_services.deposit_logs.deposit_logs_queries import add_deposit_log_entry, get_deposit_logs

bp = Blueprint("balance", __name__)

@bp.route('/deposit', methods=['POST'])
def deposit():
    allowed, error_message = validate_deposit_payload(request.get_json(silent=True))

    if not allowed:
        return jsonify({ "error": error_message }), 400

    payload = request.get_json()
    uid = payload.get("uid")
    deposit = payload.get("value")

    try:
        deposit = float(deposit)
        remaining = update_liquid_cash(uid, deposit, "DEPOSIT")
        add_deposit_log_entry(uid, deposit)

        return jsonify({ 
            "success": "ok",
            "remaining_balance": str(remaining) 
        })
    
    except Exception as e:
        print(f"deposit() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" })
     
@bp.route('/deposit-history', methods=["GET"])
def deposit_history():
    allowed, error_message = validate_deposit_history_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400

    uid = request.args.get("uid")

    try:
        history = get_deposit_logs(uid)
        print(f"history: {history}")
        return jsonify(history)
    
    except Exception as e:
        print(f"deposit_history() - Exception raised: {str(e)}")
        return jsonify({ "error": str(e) })