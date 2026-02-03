from flask import Blueprint, request, jsonify

from ...utils.payload_validations import validate_company_data_payload
from ...utils.price_calculations import calculate_current_price

from ...db.db_services.company_profile.company_profile_queries import get_company_profile
from ...db.db_services.market_data.market_data_queries import get_market_data
from ...db.db_services.user_accounts.user_account_queries import check_in_watchlist

bp = Blueprint("detailed_stock_view_page", __name__)

# ---------------- RETRIEVE COMPANY PROFILE DATA  ----------------
@bp.route('/company-data', methods=["GET"])
def company_data():
    allowed, error_msg = validate_company_data_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_msg }), 400

    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    ticker = ticker.upper()
    
    try:
        company_profile_data = get_company_profile(ticker)
        company_market_data = get_market_data(ticker)
        current_price, current_price_date = calculate_current_price(company_market_data)
        in_watchlist = check_in_watchlist(uid, ticker)

        company_market_data.reverse()
    except Exception as e:
        print(f"company_data() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500
    
    response = {
        "company_data": company_profile_data,
        "current_price": current_price,
        "current_price_date": current_price_date,
        "historical_prices": company_market_data,
        "in_watchlist": in_watchlist,
    }

    return jsonify(response), 200