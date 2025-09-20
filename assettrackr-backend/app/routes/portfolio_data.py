from flask import Blueprint, jsonify, g
import os
from datetime import timezone


from ..db.db_services.portfolio.database_portfolio import get_portfolio, calculate_portfolio_value
from ..db.db_services.timeline.database_timeline import update_ts, get_user_entire_timeline
from ..db.db_services.userAccounts.database_userAccounts import getLiquidCash


bp = Blueprint("portfolio_data", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

@bp.route('/home_data')
def getHomeData():
    uid = "X5s2HImyTfNITElXIdhIRu0K70F3"
    
    # get the portfolio
    user_portfolio = get_portfolio(g.db, uid) # example: {'ticker1': quantity, 'ticker2': quantity, ... }
    portfolio = [user_portfolio]

    # get latest portfolio value
    assetValue = calculate_portfolio_value(g.db, uid)

    # get user's cash
    cash = str(getLiquidCash(g.db, uid))
    
    # update + retrieve the user's timeline
    # update_ts(g.db, uid)
    user_timeline = get_user_entire_timeline(g.db, uid) # example: [{'date': datetime obj, 'value': Decimal obj}, ...]
    timeline = []
    for record in user_timeline:
        timeline.append({ 
            "datetime": record.get('date').astimezone(timezone.utc).isoformat(), 
            "value": str(round(record.get('value'), 2))
        })

    output = {
        'assetValue': assetValue,
        'cash': cash,
        'portfolio': portfolio,
        'timeline': timeline
    }

    return jsonify(output)