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
    symbol = request.args.get("query", "")

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

    startDate = calculateStartDate()
    timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1min&start_date={startDate}&outputsize=5000&apikey=08a46fa054fe47238e842fe469d79430"
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
        "price": timeSeriesResult.get("values", -1)[0].get("close", -1),
        "priceTimeShort": timeSeriesResult.get("values", -1)[0].get("datetime", -1)[10:19],
        "priceTimeLong": timeSeriesResult.get("values", -1)[0].get("datetime", -1),
        "rangeLow": companyProfileResult.get("range", "Error").split("-")[0],
        "rangeHigh": companyProfileResult.get("range", "Error").split("-")[1],

        # COMPANY FINANCIALS - Volume
        "volume": companyProfileResult.get("volume", -1),
        "averageVolume": companyProfileResult.get("averageVolume", -1),
        "x10DayAverageTradingVolume": basicFinancialsResultMetric.get("10DayAverageTradingVolume", -1),
        "x3MonthAverageTradingVolume": basicFinancialsResultMetric.get("3MonthAverageTradingVolume", -1),

        # COMPANY FINANCIALS - Asset Turnover
        "assetTurnoverAnnual": basicFinancialsResultMetric.get("assetTurnoverAnnual", -1),
        "assetTurnoverTTM": basicFinancialsResultMetric.get("assetTurnoverTTM", -1),

        # COMPANY FINANCIALS - Price Return over time
        "x5DayPriceReturnDaily": basicFinancialsResultMetric.get("5DayPriceReturnDaily", -1),
        "monthToDatePriceReturnDaily": basicFinancialsResultMetric.get("monthToDatePriceReturnDaily", -1),
        "x13WeekPriceReturnDaily": basicFinancialsResultMetric.get("13WeekPriceReturnDaily", -1),
        "x26WeekPriceReturnDaily": basicFinancialsResultMetric.get("26WeekPriceReturnDaily", -1),
        "x52WeekPriceReturnDaily": basicFinancialsResultMetric.get("52WeekPriceReturnDaily", -1),
        
        # COMPANY FINANCIALS - Valuation & Market Cap
        "marketCapitalisation": basicFinancialsResultMetric.get("marketCapitalization", -1),
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

    # output = {
    #     "x10DayAverageTradingVolume": 49.73162,
    #     "x10DayPriceReturnDaily": -1,
    #     "x13WeekPriceReturnDaily": 16.4462,
    #     "x26WeekPriceReturnDaily": -8.7801,
    #     "x3MonthAverageTradingVolume": 47.85682,
    #     "x52WeekPriceReturnDaily": 14.8519,
    #     "x5DayPriceReturnDaily": -7.7495,
    #     "assetTurnoverAnnual": 1.0209,
    #     "assetTurnoverTTM": 1.0573,
    #     "averageVolume": 42481574,
    #     "companyDescription": "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. The company operates through three segments: North America, International, and Amazon Web Services (AWS). Its products offered through its stores include merchandise and content purchased for resale; and products offered by third-party sellers The company also manufactures and sells electronic devices, including Kindle, Fire tablets, Fire TVs, Rings, Blink, eero, and Echo; and develops and produces media content. In addition, it offers programs that enable sellers to sell their products in its stores; and programs that allow authors, musicians, filmmakers, Twitch streamers, skill and app developers, and others to publish and sell content. Further, the company provides compute, storage, database, analytics, machine learning, and other services, as well as fulfillment, advertising, and digital content subscriptions. Additionally, it offers Amazon Prime, a membership program. The company serves consumers, sellers, developers, enterprises, content creators, and advertisers. Amazon.com, Inc. was incorporated in 1994 and is headquartered in Seattle, Washington.",
    #     "companyLogo": "https://img.logo.dev/ticker/AMZN?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true",
    #     "companyName": "Amazon.com, Inc.",
    #     "dividendGrowthRate5Y": -1,
    #     "dividendPerShareAnnual": -1,
    #     "enterpriseValue": 2272838.5,
    #     "exchange": "NASDAQ",
    #     "exchangeTimezone": "America/New_York",
    #     "forwardPE": 33.1247183049276,
    #     "grossMargin5Y": 44.25,
    #     "grossMarginAnnual": 48.85,
    #     "industry": "Specialty Retail",
    #     "location": "Seattle, US",
    #     "marketCapitalisation": 228643534565,
    #     "monthToDatePriceReturnDaily": -8.2696,
    #     "netProfitMargin5Y": 5.34,
    #     "operatingMargin5Y": 6.15,
    #     "operatingMarginAnnual": 10.75,
    #     "payoutRatioAnnual": -1,
    #     "peAnnual": 38.48,
    #     "pretaxMargin5Y": 6.1,
    #     "pretaxMarginAnnual": 10.76,
    #     "price": 214.75,
    #     "rangeLow": 151.61,
    #     "rangeHigh": 242.52,
    #     "recommendation": "Buy",
    #     "recommendationTools": [
    #         {
    #             "buy": 50,
    #             "hold": 5,
    #             "period": "2025-07-01",
    #             "sell": 0,
    #             "strongBuy": 24,
    #             "strongSell": 0,
    #             "symbol": "AMZN"
    #         },
    #         {
    #             "buy": 50,
    #             "hold": 5,
    #             "period": "2025-06-01",
    #             "sell": 0,
    #             "strongBuy": 24,
    #             "strongSell": 0,
    #             "symbol": "AMZN"
    #         },
    #         {
    #             "buy": 51,
    #             "hold": 6,
    #             "period": "2025-05-01",
    #             "sell": 0,
    #             "strongBuy": 22,
    #             "strongSell": 0,
    #             "symbol": "AMZN"
    #         },
    #         {
    #             "buy": 50,
    #             "hold": 4,
    #             "period": "2025-04-01",
    #             "sell": 0,
    #             "strongBuy": 23,
    #             "strongSell": 0,
    #             "symbol": "AMZN"
    #         }
    #     ],
    #     "roa5Y": 5.84,
    #     "roaRfy": 9.48,
    #     "roe5Y": 16.18,
    #     "roeRfy": 20.72,
    #     "roi5Y": 10.89,
    #     "roiAnnual": 16.38,
    #     "timeseries": [
    #         {
    #             "datetime": "2025-08-01 15:30:00",
    #             "open": "214.875",
    #             "high": "215.99001",
    #             "low": "214.49001",
    #             "close": "214.81000",
    #             "volume": "9525800"
    #         },
    #         {
    #             "datetime": "2025-08-01 14:30:00",
    #             "open": "214.23500",
    #             "high": "215.22000",
    #             "low": "214.14999",
    #             "close": "214.88000",
    #             "volume": "10907741"
    #         },
    #         {
    #             "datetime": "2025-08-01 13:30:00",
    #             "open": "214.33929",
    #             "high": "214.75999",
    #             "low": "212.80000",
    #             "close": "214.24921",
    #             "volume": "10841492"
    #         }
    #     ],
    #     "volume": 119615582,
    #     "website": "https://www.amazon.com"
    # }
    # return jsonify(output)



















if __name__ == '__main__':
    app.run(debug=True, port=5000)