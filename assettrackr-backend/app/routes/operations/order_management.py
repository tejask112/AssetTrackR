from flask import Blueprint, request, jsonify
from decimal import Decimal

from ...utils.payload_validations import validate_submit_order_payload
from ...utils.api_responses import compute_submit_order_response
from ...db.db_utils.market_hours import check_market_open, check_when_market_opens


from ...db.db_services.trades.trades_queries import execute_trade, queue_trade

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
        res = execute_trade(uid, action, quantity, ticker)
        

        success, message, status_code = compute_submit_order_response(res)
        
        if success:
            return jsonify({ "ok": message }), 200
        else:
            return jsonify({ "error": message }), status_code
    
    except Exception as e:
        print(f"order_management - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

    
