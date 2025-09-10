import requests, os
from decimal import Decimal, ROUND_HALF_UP

Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

def get_time_series_15min(symbol, startDate):
    interval = "15min"
    timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval={interval}&start_date={startDate}&outputsize=5000&apikey={TWELVE_API_KEY}"
    timeSeriesResponse = (requests.get(url=timeSeriesUrl)).json()

    prices = timeSeriesResponse.get("values", [])
    res = {
        "ticker": symbol,
        "prices" : prices
    }
    return res