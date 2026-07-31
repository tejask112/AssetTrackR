import os
from dotenv import load_dotenv
import aiohttp
import asyncio
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

load_dotenv()
logger = logging.getLogger(__name__)

FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FINNHUB_URL = "https://finnhub.io/api/v1/stock/market-status"

async def check_market_open() -> None:
    logger.info("Starting market cycle")

    params = { "exchange": "US" }
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }

    try:
        timeout = aiohttp.ClientTimeout(total=10)

        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(
                url=FINNHUB_URL,
                params=params,
                headers=headers,
            ) as response:
                response.raise_for_status()
                market_status = await response.json()

        date = datetime.now(ZoneInfo("America/New_York"))
        is_open = market_status["isOpen"]
        session = market_status["session"]
        holiday = market_status["holiday"]

        print(f"{date}, {is_open}, {session}, {holiday}")

    except Exception as e:
        print(f"Exception raised in market_status.py: {str(e)}")

