from flask import Blueprint, jsonify, request

from ...utils.payload_validations import validate_explore_stocks_payload
from ...utils.response_formatters import format_explore_stocks_response

from ...db.db_services.company_profile.company_profile_queries import get_brief_company_profiles
from ...db.db_services.market_data.market_data_queries import get_seven_days_prices

bp = Blueprint("explore_stocks_page", __name__)

# ---------------- GET EXPLORE STOCKS PAGE DATA  ----------------
@bp.route("explore-stocks", methods=["GET"])
def explore_stocks():
    allowed, error_mgs = validate_explore_stocks_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_mgs }), 400
    
    try:
        company_data = get_brief_company_profiles()
        company_prices = get_seven_days_prices()

        res = format_explore_stocks_response(company_data, company_prices)

        return jsonify(res)
    
    except Exception as e:
        print(f"explore_stocks() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500