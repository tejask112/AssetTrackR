import aiohttp
from asynciolimiter import StrictLimiter
import asyncio
from app.supported_stocks import STOCKS
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()
FINNHUB_API_KEY_1 = os.environ["FINNHUB_API_KEY_1"]
FINNHUB_API_URL = "https://finnhub.io/api/v1/quote"

limiter = StrictLimiter(2)

async def collect_stock_price(session: aiohttp.ClientSession, symbol: str) -> None:
    await limiter.wait()

    params = { "symbol": symbol }
    try:
        async with session.get(
            url=FINNHUB_API_URL,
            params=params,
        ) as response:
            response.raise_for_status()
            quote = await response.json()

        current_price = quote.get("c")
        if current_price is None:
            raise Exception(f"No current price returned for {symbol}: {quote}")

        print(
            f"[{datetime.now():%Y-%m-%d %H:%M:%S}] "
            f"{symbol}: ${current_price:,.2f}"
        )

    except aiohttp.ClientResponseError as error:
        print(f"collect_stock_price({symbol}) failed: Finnhub returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"collect_stock_price({symbol}) failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"collect_stock_price({symbol}) failed unexpectedly: {error}")


async def collect_prices() -> None:
    # to do: 
    # 1. check market status is open
    # 2. check market hours between 9:30am (inclusive) - 4pm (exclusive)

    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_1 }
    timeout = aiohttp.ClientTimeout(total=5)

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        await asyncio.gather(
            *(collect_stock_price(session, symbol) for symbol in STOCKS)
        )

# if __name__ == '__main__':
#     asyncio.run(collect_prices())