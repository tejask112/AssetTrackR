from asynciolimiter import StrictLimiter
import aiohttp
import asyncio
from dotenv import load_dotenv
import os
import json

from supported_stocks import STOCKS
from ..utils.normalisations_news import normalise_company_news_api_resp


load_dotenv()


# limiter = StrictLimiter(1/30) 

limiter = StrictLimiter(1)  #for testing

FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FINNHUB_GENERAL_NEWS_API_URL = "https://finnhub.io/api/v1/news"
FINNHUB_STOCK_NEWS_API_URL = "https://finnhub.io/api/v1/company-news"

async def get_stock_news(session: aiohttp.ClientSession, symbol: str) -> None:
    await limiter.wait()

    params = { "symbol": symbol }
    news = await make_api_call(
        url=FINNHUB_STOCK_NEWS_API_URL,
        params=params,
        session=session,
        general_feed=False
    )


async def get_general_feed_news(session: aiohttp.ClientSession) -> None:
    await limiter.wait()

    params = { "category": "general" }
    news = await make_api_call(
        url=FINNHUB_GENERAL_NEWS_API_URL,
        params=params,
        session=session,
        general_feed=True
    )


async def make_api_call(url: str, params: dict, session: aiohttp.ClientSession, general_feed: bool) -> None:
    try:
        async with session.get(
            url=url,
            params=params
        ) as resp:
            resp.raise_for_status()
            news = await resp.json()

        normalised_news = await normalise_company_news_api_resp(news=news, general_feed=general_feed)
        print(json.dumps(normalised_news, indent=4, default=str))

    except aiohttp.ClientResponseError as error:
        print(f"make_api_call(url={url}, params={params}) failed: Finnhub returned HTTP {error.status} — {error.message}")
    
    except aiohttp.ClientError as error:
        print(f"make_api_call(url={url}, params={params}) failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"make_api_call(url={url}, params={params}) failed unexpectedly: {error}")


async def collect_news() -> None:

    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2}
    timeout = aiohttp.ClientTimeout(total=10)

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        await get_general_feed_news(session)
        await asyncio.gather(
            *(get_stock_news(session, symbol) for symbol in STOCKS)
        )

    
