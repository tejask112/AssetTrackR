from flask import Blueprint, request, jsonify
from decimal import Decimal

from ....utils.payload_validations import validate_submit_order_payload, validate_cancel_order_payload
from ....utils.api_responses import compute_submit_order_response, compute_cancel_order_response
from ....utils.market_hours import check_market_open, check_when_market_opens


from ....db_services.trades.trades_queries import execute_trade, queue_trade, cancel_trade

bp = Blueprint("order_management", __name__)

# ---------------- EXECUTE A TRADE  ----------------
@bp.route('/submit-order', methods=["POST"])
def submit_order():

    payload = request.get_json(silent=True) or {}
    allowed, error_msg = validate_submit_order_payload(payload)

    if not allowed:
        return jsonify({ "error" : error_msg }), 400

    uid = payload["uid"]
    # jwt = payload["jwt"]
    ticker = payload["ticker"].upper()
    action = payload["action"].upper()
    quantity = Decimal(str(payload["quantity"]))
       
    print(f"/submit-order: action={action}, ticker={ticker}, quantity={quantity}")
    try:
        if check_market_open():
            res = execute_trade(uid, action, quantity, ticker)
        else:
            res = queue_trade(uid, action, quantity, ticker)

        success, message, status_code = compute_submit_order_response(res)
        
        if success:
            return jsonify({ "ok": message }), 200
        else:
            return jsonify({ "error": message }), status_code
    
    except Exception as e:
        print(f"submit_order() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

# ---------------- CANCEL A TRADE  ----------------
@bp.route("/cancel-order", methods=["POST"])
def cancel_order():
    
    payload = request.get_json(silent=True) or {}
    allowed, error_message = validate_cancel_order_payload(payload)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = payload.get("uid")
    trade_id = payload.get("tradeid")

    try:
        res = cancel_trade(uid, trade_id)
        success, message, status_code = compute_cancel_order_response(res)

        if success:
            return jsonify({ "ok": message }), 200
        else:
            return jsonify({ "error": message }), status_code
    
    except Exception as e:
        print(f"cancel_order() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500
    
