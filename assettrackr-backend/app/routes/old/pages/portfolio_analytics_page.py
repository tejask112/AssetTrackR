from flask import Blueprint, request, jsonify

from ....utils.payload_validations import validate_portfolio_analytics_payload
from ....utils.price_calculations import calculate_returns

from ....db_services.timeline.timeline_queries import get_user_timeline
from ....db_services.portfolio.portfolio_queries import get_portfolio_with_prices
from ....db_services.user_accounts.user_account_queries import get_liquid_cash


bp = Blueprint("portfolio_analytics_page",  __name__)

@bp.route("/portfolio-analytics", methods=["GET"])
def portfolio_analytics():
    allowed, error_message = validate_portfolio_analytics_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = request.args.get("uid")

    try:
        portfolio = get_portfolio_with_prices(uid)
        cash_balance = round(get_liquid_cash(uid), 2)
        timeline = get_user_timeline(uid)
        returns = calculate_returns(timeline)
        

        res = {
            "cash_balance": cash_balance,
            "portfolio": portfolio,
            "returns": returns,
            "timeline": timeline
        }

        return jsonify(res)
    
    except Exception as e:
        print(f"portfolio_analytics() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500