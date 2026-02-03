from flask import Blueprint, request, jsonify

from ...utils.payload_validations import validate_trade_history_payload

from ...db.db_services.trades.trades_queries import get_user_trades

bp = Blueprint("trade_history_page", __name__)

# ---------------- RETRIEVE ALL USER'S TRADES  ----------------
# future improvement: include pagination to reduce server load? 
@bp.route('/trade-history', methods=["GET"])
def trade_history():
    allowed, error_msg = validate_trade_history_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_msg }), 400
    
    uid = request.args.get("uid", "")

    try:
        user_trades = get_user_trades(uid)
        return jsonify(user_trades)
    except Exception as e:
        print(f"trade_history() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

