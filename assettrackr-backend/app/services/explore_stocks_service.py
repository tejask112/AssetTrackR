import os, requests, pandas as pd

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")

headers = {
    "accept": "application/json",
    "APCA-API-KEY-ID": ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
}

def calculateAllHistoricalBarsFromAPI(listOfStocks, start_date, end_date):
    allSymbolsList = listOfStocks
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
