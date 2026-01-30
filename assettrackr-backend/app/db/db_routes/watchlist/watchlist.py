from flask import Blueprint, request, g, jsonify

bp = Blueprint("watchlist", __name__)

from ...db_services.user_accounts.database_userAccounts import addToWatchList, removeFromWatchList
from ...db_services.user_accounts.user_account_queries import add_to_watchlist, remove_from_watchlist

# ---------------- ADD TICKER/COMPANYNAME TO WATCHLIST  ----------------
@bp.route('/watchlist_add', methods=["POST"])
def addToWatchlist():

    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    company_name = request.args.get("companyName")

    if not all([uid, ticker, company_name]):
        return jsonify({"error": "Bad Request/Missing Fields"})
    
    try:
        add_to_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

# ---------------- REMOVE TICKER/COMPANYNAME TO WATCHLIST  ----------------
@bp.route('/watchlist_remove', methods=["POST"])
def removeFromWatchlist():
    
    uid = request.args.get("uid")
    ticker = request.args.get("ticker")

    if not all([uid, ticker]):
        return jsonify({"error": "Bad Request/Missing Fields"})
    
    try:
        remove_from_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

