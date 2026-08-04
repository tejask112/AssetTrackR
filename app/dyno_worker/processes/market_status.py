import os
from dotenv import load_dotenv
import aiohttp
from datetime import datetime
from zoneinfo import ZoneInfo

from dyno_worker.db_queries.market_status import insert_current_market_status

load_dotenv()

FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FINNHUB_URL = "https://finnhub.io/api/v1/stock/market-status"

async def check_market_open() -> None:
    params = { "exchange": "US" }
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }

    try:
        async with aiohttp.ClientSession() as session:
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

        print(
            f"[{date:%Y-%m-%d %H:%M:%S}] "
            f"Market Status Open?: {is_open}, session: {session}, holiday: {holiday}"
        )

        insert_current_market_status(is_open, session, holiday)

    except aiohttp.ClientResponseError as error:
        print(f"check_market_open() failed: Finnhub returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"check_market_open() failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"check_market_open() failed: {error}")

