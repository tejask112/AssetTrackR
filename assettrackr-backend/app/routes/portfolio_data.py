from flask import Blueprint, jsonify, g, request
import os
from datetime import timezone


from ..db.db_services.portfolio.database_portfolio import get_portfolio, calculate_portfolio_value
from ..db.db_services.timeline.database_timeline import update_ts, get_user_entire_timeline
from ..db.db_services.userAccounts.database_userAccounts import getLiquidCash
from ..services.news_service import retrieve_news


bp = Blueprint("portfolio_data", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

@bp.route('/home_data')
def getHomeData():
    uid = request.args.get("query", type=str)
    if not uid:
        raise ValueError("UID not found")
    
    # get the portfolio
    user_portfolio = get_portfolio(g.db, uid) # example: {'ticker1': quantity, 'ticker2': quantity, ... }
    portfolio = [user_portfolio]

    # get latest portfolio value
    assetValue = calculate_portfolio_value(g.db, uid)

    # get user's cash
    cash = str(getLiquidCash(g.db, uid))
    
    # update + retrieve the user's timeline
    update_ts(g.db, uid)
    user_timeline = get_user_entire_timeline(g.db, uid) # example: [{'date': datetime obj, 'value': Decimal obj}, ...]
    timeline = []
    for record in user_timeline:
        timeline.append({ 
            "datetime": record.get('date').astimezone(timezone.utc).isoformat(), 
            "value": str(round(record.get('value'), 2))
        })

    # news
    news = retrieve_news()

    output = {
        'assetValue': assetValue,
        'cash': cash,
        'portfolio': portfolio,
        'timeline': timeline,
        'news': news,
    }

    return jsonify(output)