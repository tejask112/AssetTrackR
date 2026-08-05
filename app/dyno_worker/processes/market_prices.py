import aiohttp
import asyncio
import os
from asynciolimiter import StrictLimiter
from supported_stocks import STOCKS
from datetime import datetime, timezone
from dotenv import load_dotenv


from dyno_worker.utils.market_open_checks import check_market_open, check_market_status
from dyno_worker.db_queries.market_prices import insert_price_into_db

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
        current_time = datetime.now()
        if current_price is None:
            raise Exception(f"No current price returned for {symbol}: {quote}")

        print(
            f"[{current_time:%Y-%m-%d %H:%M:%S}] "
            f"{symbol}: ${current_price:,.2f} "
            f"type:{type(current_price)}"
        )

        insert_price_into_db(symbol=symbol, price=current_price, recorded_at=current_time)
        
        # process all queued trades
        # process all market/limit trades


    except aiohttp.ClientResponseError as error:
        print(f"collect_stock_price({symbol}) failed: Finnhub returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"collect_stock_price({symbol}) failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"collect_stock_price({symbol}) failed unexpectedly: {error}")


async def collect_prices() -> None:
    """
    Collects latest quote for each stock in 'supported_stocks.py' if markets are open. Asyncio limiter spaces each stocks
    API call 0.5 seconds apart. Each quote is inserted into stock_current_prices and into stock_historical_prices.
    """

    is_market_open = await check_market_open()
    if not is_market_open:
        return

    is_open_status = await check_market_status()
    if not is_open_status:
        return

    print("!!!!! All Timing Checks Passed")

    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_1 }
    timeout = aiohttp.ClientTimeout(total=5)

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        await asyncio.gather(
            *(collect_stock_price(session, symbol) for symbol in STOCKS)
        )