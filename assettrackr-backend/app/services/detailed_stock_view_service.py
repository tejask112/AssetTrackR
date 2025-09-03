import requests, os

from ..utils.dates import calculateStartDate, calculate5YagoDate

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

def get_time_series(symbol):
    # retrieve minutely data from past 7 days
    minutelyStartDate = calculateStartDate() # date 7 days ago

    minutelyInterval = "1min"
    minutelyTimeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval={minutelyInterval}&start_date={minutelyStartDate}&outputsize=5000&apikey={TWELVE_API_KEY}"
    minutelyTimeSeriesResponse = (requests.get(url=minutelyTimeSeriesUrl)).json()

    extraMetaData = minutelyTimeSeriesResponse.get("meta", {})
    minutelyTimeSeriesData = minutelyTimeSeriesResponse.get("values", [])

    cutoffTime = minutelyTimeSeriesData[-1].get("datetime","Error")
    print(f"CUTOFF TIME: {cutoffTime}")

    # retrieve hourly data from past 5 years
    hourlyInterval = "1h"
    hourlyTimeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval={hourlyInterval}&end_date={cutoffTime}&outputsize=5000&apikey={TWELVE_API_KEY}"
    hourlyTimeSeriesData = ((requests.get(url=hourlyTimeSeriesUrl)).json()).get("values",["Error"])
    hourlyTimeSeriesData.pop(0)

    # combine both results
    fullTimeSeries = minutelyTimeSeriesData + hourlyTimeSeriesData
    output = {
        "meta": extraMetaData,
        "values": fullTimeSeries,
    }

    return output

def retrieveLatestPriceIndividual(ticker):
    return 100

def retrieveLatestPriceList(tickers):
    prices: dict[str, int] = {}

    for ticker in tickers:
        prices[ticker] = 150.55

    return prices