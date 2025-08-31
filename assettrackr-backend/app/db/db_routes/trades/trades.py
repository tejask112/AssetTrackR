from flask import Blueprint, request, g, jsonify
from decimal import Decimal
from datetime import datetime

from ....db.db_services.trades.database_trades import get_user_trades

bp = Blueprint("trades", __name__)


# ---------------- RETRIEVE ALL TRADE HISTORY FOR USER  ----------------
@bp.route('/trade_history', methods=["GET"])
def trade_history():
    uid = request.args.get("query", "")
    trades = get_user_trades(g.db, uid)

    response = []
    for trade in trades:
        d = dict(trade)

        if isinstance(d["quantity"], Decimal): 
            d["quantity"] = float(d["quantity"])

        if isinstance(d["execution_price"], Decimal): 
            d["execution_price"] = float(d["execution_price"])

        if isinstance(d["execution_total_price"], Decimal): 
            d["execution_total_price"] = float(d["execution_total_price"]) 

        if hasattr(d["date"], "isoformat"): 
            d["date"] = d["date"].isoformat()

        response.append(d)
    
    return jsonify(response)