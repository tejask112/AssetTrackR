from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
import requests
from datetime import datetime, timedelta, timezone
import finnhub

app = Flask(__name__)
CORS(app)

headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": "PKSBHQZ8SKVL9FA4OE75",
        "APCA-API-SECRET-KEY": "bLa4uLT72RV2GAJjUf7hQBQfShk1a0jfioav79kF"
        }

def calculateStartDate():
    current_date = datetime.now(timezone.utc)
    start_date_obj = current_date - timedelta(days=7)
    start_date = start_date_obj.strftime("%Y-%m-%d")
    return start_date

def calculateEndDate():
    current_date = datetime.now(timezone.utc)
    end_date_obj = current_date - timedelta(hours=1, minutes=45)
    end_date = end_date_obj.strftime("%Y-%m-%dT%H:%M:%SZ")
    return end_date

def calculate5YagoDate():
    current_date = datetime.now(timezone.utc)
    fiveYearsAgo_date_obj = current_date - timedelta(days=(365*5))
    fiveYearsAgo_date = fiveYearsAgo_date_obj.strftime("%Y-%m-%d" + " " + "%H:%M:%S")
    return fiveYearsAgo_date

def calculateAllHistoricalBarsFromAPI(listOfStocks, start_date, end_date):
    allSymbolsList = [s['symbol'] for s in listOfStocks]
    allSymbolsString = ",".join(allSymbolsList)
    print("All keys AssetTrackR requested:" + allSymbolsString + " | count = " + str(len(allSymbolsList)))

    allBars = {}
    urlHistoricalBars = f"https://data.alpaca.markets/v2/stocks/bars"
    params = {  
        "symbols": allSymbolsString,
        "timeframe": "1H",
        "start": start_date,
        "end": end_date,
        "limit": 10000,
        "adjustment": "raw",
        "sort": "asc",
    }

    nextPageToken = None
    while True:
        response = requests.get(urlHistoricalBars, headers=headers, params=params)
        responseJson = response.json()
        barsReceived = responseJson['bars']
        allBars.update(barsReceived)        

        if responseJson['next_page_token'] == None:
            break
        else:
            nextPageToken = responseJson['next_page_token']
            params.update({ 'page_token': nextPageToken })

        if 'message' in responseJson:
            print("Error - " + responseJson['message'])
            break

    print("All keys API responded with: " + ",".join(allBars.keys()) + " | count = " + str(len(allBars)))
    return allBars

def calculate24HclosingPriceDiff(bars):
    if not bars:
        return 0.0, 0.0

    df = pd.DataFrame(bars)
    df['t'] = pd.to_datetime(df['t'], utc=True)
    df = df.sort_values('t')
    latest_row = df.iloc[-1]
    latest_price = latest_row['c']
    target_time = latest_row['t'] - pd.Timedelta(hours=24)

    prior = df[df['t'] <= target_time]
    if not prior.empty:
        price_24h = prior.iloc[-1]['c']
    else:
        # fallback: closest timestamp to 24h ago
        diffs = (df['t'] - target_time).abs()
        price_24h = df.loc[diffs.idxmin(), 'c']

    diff = latest_price - price_24h
    pct = (diff / price_24h) * 100 if price_24h != 0 else 0.0
    return diff, pct


# ---------------- RETRIEVES TODAYS TOP GAINERS (STOCKS) ----------------
@app.route('/api/biggest_stock_gainers')
def biggest_stock_gainers():
    urlTopGainers = "https://financialmodelingprep.com/stable/biggest-gainers?apikey=JbWRPbI6VGapru3LipUIte6b8TML23lg"
    try:
        response = requests.get(urlTopGainers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as err:
        app.logger.error("Error fetching top gainers: %s", err)
        return jsonify({"error": "Upstream service unavailable"}), 502
    
    # calculate the dates: 1 week ago, today 2 hours ago -> for historical bars api call
    start_date = calculateStartDate()
    end_date = calculateEndDate()

    listOfTodaysTopGainers = sorted(response.json(), key=lambda s: s["changesPercentage"], reverse=True)[:10]

    allBars = calculateAllHistoricalBarsFromAPI(listOfTodaysTopGainers, start_date, end_date)

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
            "logo": f'https://img.logo.dev/ticker/{symbolName}?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true',
            "name": s["name"],
            "percentage_change": s["changesPercentage"],
        }

        output.append(data)

    return jsonify(output)

# ---------------- RETRIEVES TODAYS TOP LOSERS (STOCKS) ----------------
@app.route('/api/biggest_stock_losers')
def biggest_stock_losers():
    urlTopLosers = "https://financialmodelingprep.com/stable/biggest-losers?apikey=JbWRPbI6VGapru3LipUIte6b8TML23lg"
    try:
        response = requests.get(urlTopLosers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as err:
        app.logger.error("Error fetching top losers: %s", err)
        return jsonify({"error": "Upstream service unavailable"}), 502

    # calculate the dates: 1 week ago, today 2 hours ago -> for historical bars api call
    start_date = calculateStartDate()
    end_date = calculateEndDate()

    listOfTodaysTopLosers = sorted(response.json(), key=lambda s: s["changesPercentage"])[:10]
    allBars = calculateAllHistoricalBarsFromAPI(listOfTodaysTopLosers, start_date, end_date)

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
            "logo": f'https://img.logo.dev/ticker/{symbolName}?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true',
            "name": s["name"],
            "percentage_change": s["changesPercentage"],
        }
        output.append(data)


    return jsonify(output)

# ---------------- RETRIEVES MOST ACTIVELY TRADED (STOCKS) ----------------
@app.route('/api/most_actively_traded')
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
    start_date = calculateStartDate()
    end_date = calculateEndDate()

    allBars = calculateAllHistoricalBarsFromAPI(stockMap, start_date, end_date)

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
            "logo": f'https://img.logo.dev/ticker/{symbolName}?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true',
            "name": s['name'],
            "percentage_change": pct,
        }
        output.append(data)

    return jsonify(output)

# ---------------- SEARCH BAR TO FIND STOCKS | EXPLORE PAGE  ----------------
@app.route('/api/symbol_lookup', methods=["GET"])
def symbol_lookup():
    finnhub_client = finnhub.Client(api_key="d1vs1apr01qmbi8prd4gd1vs1apr01qmbi8prd50")

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

# ---------------- RETRIEVE COMPANY PROFILE DATA  ----------------
@app.route('/api/profile_data', methods=["GET"])
def profile_data():
    symbol = 'AMZN'

    companyProfileUrl = f"https://financialmodelingprep.com/stable/profile?symbol={symbol}&apikey=JbWRPbI6VGapru3LipUIte6b8TML23lg"
    companyProfileResponse = requests.get(url=companyProfileUrl)
    companyProfileResponseJson = companyProfileResponse.json()
    companyProfileResult = companyProfileResponseJson[0] if isinstance(companyProfileResponseJson, list) and companyProfileResponseJson else {}

    basicFinancialsUrl = f"https://finnhub.io/api/v1/stock/metric?symbol={symbol}&metric=all&token=d1vs1apr01qmbi8prd4gd1vs1apr01qmbi8prd50"
    basicFinancialsResponse = requests.get(url=basicFinancialsUrl)
    basicFinancialsResult = basicFinancialsResponse.json()
    basicFinancialsResultMetric = basicFinancialsResult.get("metric")

    recommendationToolsUrl = f"https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token=d1vs1apr01qmbi8prd4gd1vs1apr01qmbi8prd50"
    recommendationToolsResponse = requests.get(url=recommendationToolsUrl)
    recommendationToolsResult = recommendationToolsResponse.json()

    startDate = calculate5YagoDate()
    timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1h&start_date={startDate}&outputsize=5000&apikey=08a46fa054fe47238e842fe469d79430"
    timeSeriesResponse = requests.get(url=timeSeriesUrl)
    timeSeriesResult = timeSeriesResponse.json()

    modified_data = {
        # COMPANY METADATA
        "companyName": companyProfileResult.get("companyName", "Error"),
        "companyDescription": companyProfileResult.get("description", "Error"),
        "exchange": companyProfileResult.get("exchange", "Error"),
        "exchangeTimezone": timeSeriesResult.get("meta", "Error").get("exchange_timezone", "Error"),
        "website": companyProfileResult.get("website", "Error"),
        "industry": companyProfileResult.get("industry", "Error"),
        "location": companyProfileResult.get("city","Error") + ", " + companyProfileResult.get("country", "Error"),
        "companyLogo": f'https://img.logo.dev/ticker/{symbol}?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true',
        "price": companyProfileResult.get("price", "0"),
        "range": companyProfileResult.get("range", "Error"),

        # COMPANY FINANCIALS - Volume
        "volume": companyProfileResult.get("volume", -1),
        "averageVolume": companyProfileResult.get("averageVolume", -1),
        "10DayAverageTradingVolume": basicFinancialsResultMetric.get("10DayAverageTradingVolume", -1),
        "3MonthAverageTradingVolume": basicFinancialsResultMetric.get("3MonthAverageTradingVolume", -1),

        # COMPANY FINANCIALS - Asset Turnover
        "assetTurnoverAnnual": basicFinancialsResultMetric.get("assetTurnoverAnnual", -1),
        "assetTurnoverTTM": basicFinancialsResultMetric.get("assetTurnoverTTM", -1),

        # COMPANY FINANCIALS - Price Return over time
        "5DayPriceReturnDaily": basicFinancialsResultMetric.get("5DayPriceReturnDaily", -1),
        "10DayPriceReturnDaily": basicFinancialsResultMetric.get("10DayPriceReturnDaily", -1),
        "monthToDatePriceReturnDaily": basicFinancialsResultMetric.get("monthToDatePriceReturnDaily", -1),
        "13WeekPriceReturnDaily": basicFinancialsResultMetric.get("13WeekPriceReturnDaily ", -1),
        "26WeekPriceReturnDaily": basicFinancialsResultMetric.get("26WeekPriceReturnDaily", -1),
        "52WeekPriceReturnDaily": basicFinancialsResultMetric.get("52WeekPriceReturnDaily", -1),
        
        # COMPANY FINANCIALS - Valuation & Market Cap
        "marketCapitalisation": basicFinancialsResultMetric.get("marketCapitalisation", -1),
        "enterpriseValue": basicFinancialsResultMetric.get("enterpriseValue", -1),
        "forwardPE": basicFinancialsResultMetric.get("forwardPE", -1),
        "peAnnual": basicFinancialsResultMetric.get("peAnnual", -1),

        # COMPANY FINANCIALS - Profitability & Margins
        "grossMargin5Y": basicFinancialsResultMetric.get("grossMargin5Y", -1),
        "grossMarginAnnual": basicFinancialsResultMetric.get("grossMarginAnnual", -1),

        "operatingMargin5Y": basicFinancialsResultMetric.get("operatingMargin5Y", -1),
        "operatingMarginAnnual": basicFinancialsResultMetric.get("operatingMarginAnnual", -1),

        "netProfitMargin5Y": basicFinancialsResultMetric.get("netProfitMargin5Y", -1),
        "netProfitMargin5Y": basicFinancialsResultMetric.get("netProfitMargin5Y", -1),

        "pretaxMargin5Y": basicFinancialsResultMetric.get("pretaxMargin5Y", -1),
        "pretaxMarginAnnual": basicFinancialsResultMetric.get("pretaxMarginAnnual", -1),

        "roe5Y": basicFinancialsResultMetric.get("roe5Y", -1),
        "roeRfy": basicFinancialsResultMetric.get("roeRfy", -1),

        "roi5Y": basicFinancialsResultMetric.get("roi5Y", -1),
        "roiAnnual": basicFinancialsResultMetric.get("roiAnnual", -1),

        "roa5Y": basicFinancialsResultMetric.get("roa5Y", -1),
        "roaRfy": basicFinancialsResultMetric.get("roaRfy", -1),

        # COMPANY FINANCIALS - Profitability & Margins
        "dividendPerShareAnnual": basicFinancialsResultMetric.get("dividendPerShareAnnual", -1),
        "dividendGrowthRate5Y": basicFinancialsResultMetric.get("dividendGrowthRate5Y", -1),
        "payoutRatioAnnual": basicFinancialsResultMetric.get("payoutRatioAnnual", -1),

        # RECOMMENDATION TOOLS
        "recommendationTools": recommendationToolsResult,

        # TIME SERIES DATA (interval=1hour)
        "timeseries": timeSeriesResult.get("values", "Error")
    }

    return jsonify(modified_data)


















if __name__ == '__main__':
    app.run(debug=True, port=5000)