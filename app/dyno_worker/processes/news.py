from asynciolimiter import StrictLimiter
import aiohttp
import asyncio
from dotenv import load_dotenv
import os

from supported_stocks import STOCKS


load_dotenv()


limiter = StrictLimiter(1/30)
FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FINNHUB_GENERAL_NEWS_API_URL = "https://finnhub.io/api/v1/news"
FINNHUB_STOCK_NEWS_API_URL = "https://finnhub.io/api/v1/company-news"

async def get_stock_news(session: aiohttp.ClientSession, symbol: str) -> None:
    await limiter.wait()
    # get news per stock given as parameter


async def get_general_feed_news(symbol: str) -> None:
    await limiter.wait()
    # get general feed news


async def collect_news() -> None:

    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2}
    timeout = aiohttp.ClientTimeout(timeout=10)

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        await get_general_feed_news(session)
        await asyncio.gather(
            *(get_stock_news(session, symbol) for symbol in STOCKS)
        )

    
