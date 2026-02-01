# All functions below are REST API calls that are used in AssetTrackR's 'Explore Stocks' page.

from flask import Blueprint, jsonify, request, current_app as app
import os, requests
import finnhub

from ..utils.dates import calculateOneWeekAgoDate, calculateEndDate, calculate5YagoDate
from ..services.explore_stocks_service import calculateAllHistoricalBarsFromAPI, calculate24HclosingPriceDiff

bp = Blueprint("explore_stocks", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

headers = {
    "accept": "application/json",
    "APCA-API-KEY-ID": ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
}

# ---------------- RETRIEVES TODAYS TOP GAINERS (STOCKS) ----------------
@bp.route('/biggest_stock_gainers')
def biggest_stock_gainers():
    urlTopGainers = f"https://financialmodelingprep.com/stable/biggest-gainers?apikey={FMP_KEY}"
    try:
        response = requests.get(urlTopGainers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as err:
        app.logger.error("Error fetching top gainers: %s", err)
        return jsonify({"error": "Upstream service unavailable"}), 502
    
    # calculate the dates: 1 week ago, today 2 hours ago -> for historical bars api call
    start_date = calculateOneWeekAgoDate()
    end_date = calculateEndDate()

    listOfTodaysTopGainers = sorted(response.json(), key=lambda s: s["changesPercentage"], reverse=True)[:10]
    allSymbolsList = [s['symbol'] for s in listOfTodaysTopGainers]

    allBars = calculateAllHistoricalBarsFromAPI(allSymbolsList, start_date, end_date)

    output = []
    for s in listOfTodaysTopGainers:
        symbolName = s["symbol"]
        if symbolName in allBars:
            bars = allBars[symbolName]
            closingPrices = [bar['c'] for bar in bars]
        else:
            closingPrices = []

        data = {
            "symbol": symbolName,
            "current_price": s["price"],
            "closing_price_7D": closingPrices,
            "change": s["change"],
            "exchange": s["exchange"],
            "logo": f'https://deweuqoukaoxqgezhzfj.supabase.co/storage/v1/object/public/company_images/{symbolName.lower()}.png',
            "name": s["name"],
            "percentage_change": s["changesPercentage"],
        }

        output.append(data)

    return jsonify(output)

# ---------------- RETRIEVES TODAYS TOP LOSERS (STOCKS) ----------------
@bp.route('/biggest_stock_losers')
def biggest_stock_losers():
    urlTopLosers = f"https://financialmodelingprep.com/stable/biggest-losers?apikey={FMP_KEY}"
    try:
        response = requests.get(urlTopLosers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as err:
        app.logger.error("Error fetching top losers: %s", err)
        return jsonify({"error": "Upstream service unavailable"}), 502

    # calculate the dates: 1 week ago, today 2 hours ago -> for historical bars api call
    start_date = calculateOneWeekAgoDate()
    end_date = calculateEndDate()

    listOfTodaysTopLosers = sorted(response.json(), key=lambda s: s["changesPercentage"])[:10]
    allSymbolsList = [s['symbol'] for s in listOfTodaysTopLosers]

    allBars = calculateAllHistoricalBarsFromAPI(allSymbolsList, start_date, end_date)

    output = []
    for s in listOfTodaysTopLosers:
        symbolName = s["symbol"]
        if symbolName in allBars:
            bars = allBars[symbolName]
            closingPrices = [bar['c'] for bar in bars]
        else:
            closingPrices = []

        data = {
            "symbol": symbolName,
            "current_price": s["price"],
            "closing_price_7D": closingPrices,
            "change": s["change"],
            "exchange": s["exchange"],
            "logo": f'https://deweuqoukaoxqgezhzfj.supabase.co/storage/v1/object/public/company_images/{symbolName.lower()}.png',
            "name": s["name"],
            "percentage_change": s["changesPercentage"],
        }
        output.append(data)


    return jsonify(output)

# ---------------- RETRIEVES MOST ACTIVELY TRADED (STOCKS) ----------------
@bp.route('/most_actively_traded')
def most_actively_traded():
    stockMap = [
        { "symbol": 'NVDA', "name": 'NVIDIA' },
        { "symbol": 'TSLA', "name": 'Tesla' },
        { "symbol": 'MSFT', "name": 'Microsoft' },
        { "symbol": 'AMZN', "name": 'Amazon.com' },
        { "symbol": 'HOOD', "name": 'Robinhood Markets' },
        { "symbol": 'AAPL', "name": 'Apple Inc' },
        { "symbol": 'PLTR', "name": 'Palantir Inc' },
        { "symbol": 'META', "name": 'META Platforms' },
        { "symbol": 'AMD', "name": 'Advanced Micro Devices' },
        { "symbol": 'AVGO', "name": 'Broadcom Inc' }
    ]
    
    # calculate the dates: 1 week ago, today 2 hours ago -> for historical bars api call
    start_date = calculateOneWeekAgoDate()
    end_date = calculateEndDate()

    allSymbolsList = [s["symbol"] for s in stockMap]
    allBars = calculateAllHistoricalBarsFromAPI(allSymbolsList, start_date, end_date)

    output = []
    for s in stockMap:
        symbolName = s['symbol']
        if symbolName in allBars:
            bars = allBars[symbolName]
            closingPrices = [bar['c'] for bar in bars]

            diff, pct = calculate24HclosingPriceDiff(bars)
        else:
            closingPrices = []

        data = {
            "symbol": symbolName,
            "current_price": closingPrices[-1] if closingPrices else 0,
            "closing_price_7D": closingPrices,
            "change": diff,
            "exchange": "unsure", #NEED TO FIX
            "logo": f'https://deweuqoukaoxqgezhzfj.supabase.co/storage/v1/object/public/company_images/{symbolName.lower()}.png',
            "name": s['name'],
            "percentage_change": pct,
        }
        output.append(data)

    return jsonify(output)

# ---------------- SEARCH BAR TO FIND STOCKS | EXPLORE PAGE  ----------------
@bp.route('/symbol_lookup', methods=["GET"])
def symbol_lookup():
    finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

    query = request.args.get("query", "")
    response = finnhub_client.symbol_lookup(query=query)

    output = []
    if 'result' in response:
        results = response["result"]
        for company in results:
            if '.' in company['symbol']:
                continue
            else:
                data = {
                    'symbol': company['symbol'],
                    'name': company['description'],
                }
                output.append(data)

    return jsonify(output)
