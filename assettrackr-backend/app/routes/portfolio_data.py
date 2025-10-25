from flask import Blueprint, jsonify, g, request
import requests
import os
from datetime import timezone
import finnhub

from ..db.db_services.portfolio.database_portfolio import get_portfolio, calculate_portfolio_value
from ..db.db_services.timeline.database_timeline import update_ts, get_user_entire_timeline
from ..db.db_services.userAccounts.database_userAccounts import getLiquidCash, getWatchList
from ..services.news_service import retrieve_news
from ..services.explore_stocks_service import calculateAllHistoricalBarsFromAPI
from ..utils.dates import calculateEndDate, calculateTwoWeekAgoDate, calculateOneWeekAgoDate

bp = Blueprint("portfolio_data", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

@bp.route('/home_data')
def getHomeData():
    uid = request.args.get("query", type=str)
    if not uid:
        raise ValueError("UID not found")
    
    print(f"Received Home Page request for: {uid}")
    
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

    # watchlist
    user_watchlist = getWatchList(g.db, uid)
    watchlist = []
    if len(user_watchlist)>0:
        start_date = calculateOneWeekAgoDate()
        end_date = calculateEndDate()
        all_bars = calculateAllHistoricalBarsFromAPI(list(user_watchlist.keys()), start_date, end_date)
        
        for ticker, companyName in user_watchlist.items():
            element = {}
            element["ticker"] = ticker
            element["companyName"] = companyName
            element["currentPrice"] = finnhub_client.quote(ticker).get('c')
            element["companyLogo"] = f'https://img.logo.dev/ticker/{ticker}?token={LOGO_DEV_KEY}&size=300&retina=true'

            try:
                url = f"https://financialmodelingprep.com/stable/stock-price-change?symbol={ticker}&apikey={FMP_KEY}"
                priceChanges = requests.get(url).json()

                element["oneD"] = priceChanges[0].get("1D")
                element["fiveD"] = priceChanges[0].get("5D")
            except:
                print(f"1D/5D didnt load for {companyName}")

            if ticker in all_bars:
                bars = all_bars[ticker]
                element["timeseries"] = [bar['c'] for bar in bars]
            else:
                element["timeseries"] = []

            watchlist.append(element)

    output = {
        'assetValue': assetValue,
        'cash': cash,
        'portfolio': portfolio,
        'timeline': timeline,
        'news': news,
        'watchlist': watchlist
    }

    return jsonify(output)