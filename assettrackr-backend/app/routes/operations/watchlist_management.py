from flask import Blueprint, request, jsonify

bp = Blueprint("watchlist", __name__)

from ...db_services.user_accounts.user_account_queries import add_to_watchlist, remove_from_watchlist
from ...utils.payload_validations import validate_watchlist_add_payload, validate_watchlist_remove_payload

# ---------------- ADD TICKER/COMPANYNAME TO WATCHLIST  ----------------
@bp.route('/watchlist-add', methods=["POST"])
def addToWatchlist():
    allowed, error_message = validate_watchlist_add_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400

    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    company_name = request.args.get("companyName")
    
    try:
        add_to_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

# ---------------- REMOVE TICKER/COMPANYNAME TO WATCHLIST  ----------------
@bp.route('/watchlist-remove', methods=["POST"])
def removeFromWatchlist():
    allowed, error_message = validate_watchlist_remove_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = request.args.get("uid")
    ticker = request.args.get("ticker")

    
    try:
        remove_from_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

