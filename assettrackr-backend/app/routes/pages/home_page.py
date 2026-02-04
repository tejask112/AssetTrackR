from flask import Blueprint, request, jsonify

from ...utils.payload_validations import validate_home_data_payload
from ...utils.watchlist_aggregator import get_watchlist_data

from ...db.db_services.user_accounts.user_account_queries import get_liquid_cash
from ...db.db_services.portfolio.portfolio_queries import get_portfolio_balance, get_portfolio
from ...db.db_services.timeline.timeline_queries import get_user_timeline_2w
from ...db.db_services.market_news.market_news_queries import get_market_news

bp = Blueprint('home_page_bp', __name__)

@bp.route('/home-data', methods=['GET'])
def home_data():
    allowed, error_message = validate_home_data_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message}), 400
    
    uid = request.args.get('uid')

    try:
        cash_balance = round(get_liquid_cash(uid), 2)
        market_news = get_market_news()
        portfolio_balance = round(get_portfolio_balance(uid), 2)
        portfolio = get_portfolio(uid)
        timeline = get_user_timeline_2w(uid)
        watchlist_data = get_watchlist_data(uid)

        return jsonify({ 
            "cash_balance": cash_balance,
            "portfolio_balance": portfolio_balance,
            "portfolio": portfolio,
            "x2w_timeline": timeline,
            "market_news": market_news,
            "watchlist_data": watchlist_data
        })

    except Exception as e:
        print(f"home_data() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500