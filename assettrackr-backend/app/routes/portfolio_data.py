from flask import Blueprint, jsonify, g
import os

from ..db.db_services.portfolio.database_portfolio import get_portfolio

bp = Blueprint("portfolio_data", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

@bp.route('/home_data')
def getHomeData():
    uid = "GIxkGXxmQHTxM2ZZ6B0sbYP0ykA3"
    portfolio = get_portfolio(g.db, uid) # example: [ {"quantity": "200.00000000","ticker": "AMZN"},{"quantity": "5.00000000","ticker": "TSLA"} ]

    
    


    return jsonify(portfolio)