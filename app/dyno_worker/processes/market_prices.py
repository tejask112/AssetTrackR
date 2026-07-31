import aiohttp
from asynciolimiter import StrictLimiter
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()
FINNHUB_API_KEY_1 = os.environ["FINNHUB_API_KEY_1"]
FINNHUB_API_URL = "https://finnhub.io/api/v1/quote"

limiter = StrictLimiter(2)

stocks = [
    "MSFT", "GOOGL", "AVGO", "AMD", "ARM", "PLTR", "ORCL", "ADBE",
    "CSCO", "CRWD", "PANW", "AMZN", "NVDA", "QCOM", "PYPL", "COIN", 
    "HOOD", "V", "MA", "SOFI", "AFRM", "SNDK", "XYZ", "FISV", "GPN",
    "JPM", "BAC", "GS", "C", "AXP", "BLK", "BX", "COF", "MCO", "BNY",
    "WFC", "MS", "NOC", "BA", "GE", "RTX", "LMT", "GD", "SPCX", "LHX", 
    "HII", "TDG", "HWM", "AVAV", "AAPL"
]

async def collect_stock_price(symbol: str) -> None:
    await limiter.wait()

    params = { "symbol": symbol }
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_1 }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url=FINNHUB_API_URL,
                params=params,
                headers=headers
            ) as response:
                response.raise_for_status()
                quote = await response.json()

        close_price = quote["c"]
        print(
            f"[{datetime.now():%Y-%m-%d %H:%M:%S}] "
            f"{symbol}: ${close_price:,.2f}"
        )

    except Exception as e:
        print(f"Exception raised in market_prices.py, collect_stock_price(symbol={symbol}): {str(e)}")

async def collect_prices() -> None:
    # to do: 
    # 1. check market status is open
    # 2. check market hours between 9:30am (inclusive) - 4pm (exclusive)

    await asyncio.gather(
        *(collect_stock_price(symbol) for symbol in stocks)
    )