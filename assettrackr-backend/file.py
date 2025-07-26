from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app)

headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": "PKSBHQZ8SKVL9FA4OE75",
        "APCA-API-SECRET-KEY": "bLa4uLT72RV2GAJjUf7hQBQfShk1a0jfioav79kF"
        }

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
    current_date = datetime.now(timezone.utc)

    start_date_obj = current_date - timedelta(days=7)
    start_date = start_date_obj.strftime("%Y-%m-%d")

    end_date_obj = current_date - timedelta(hours=2)
    end_date = end_date_obj.strftime("%Y-%m-%dT%H:%M:%SZ")

    print("Dates Requested: " + start_date + " - " + end_date)

    listOfTodaysTopGainers = sorted(response.json(), key=lambda s: s["changesPercentage"], reverse=True)[:10]

    allSymbolsList = [s['symbol'] for s in listOfTodaysTopGainers]
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

    output = []
    for s in listOfTodaysTopGainers:
        symbolName = s["symbol"]
        bars = allBars[symbolName]
        closingPrices = [bar['c'] for bar in bars]

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


















if __name__ == '__main__':
    app.run(debug=True, port=5000)