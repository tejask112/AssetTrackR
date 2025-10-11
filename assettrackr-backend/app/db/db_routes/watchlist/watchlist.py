from flask import Blueprint, request, g, jsonify

bp = Blueprint("watchlist", __name__)

from ...db_services.userAccounts.database_userAccounts import addToWatchList

# ---------------- ADD TICKER/COMPANYNAME TO WATCHLIST  ----------------
@bp.route('/watchlist', methods=["POST"])
def addToWatchlist():
    
    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    company_name = request.args.get("companyName")

    print(f"received add to watchlist request: {uid}, {ticker}, {company_name}")

    if not uid or not ticker or not company_name:
        return jsonify({"error": "Bad Request/Missing Fields"})
    
    try:
        addToWatchList(g.db, uid, ticker, company_name)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

    

