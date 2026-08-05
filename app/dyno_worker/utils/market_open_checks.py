from datetime import datetime, timezone, time
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
import os
import aiohttp

from db.tables.market import MarketStatus
from dyno_worker.db_queries.market_status import get_current_market_status, insert_current_market_status

load_dotenv()

FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FINNHUB_URL = "https://finnhub.io/api/v1/stock/market-status"

MARKET_OPEN = time(hour=9, minute=30)
MARKET_CLOSE = time(hour=16, minute=0)

async def check_hour(now_et: datetime) -> bool:
    """
    Checks whether the current time is between NY market open hours.

    Parameters:
        now_et = a python datetime object holding the current time.
    Returns:
        True if now_et is or after 9:30am and strictly before 4:00pm.
    """
    current_time = now_et.time()
    return MARKET_OPEN <= current_time < MARKET_CLOSE


async def check_weekday(now_et: datetime) -> bool:
    """
    Checks whether the current date is a weekday.
    
    Parameters:
        now_et = a python datetime object holding the current date and time.
    Returns:
        True if the current date is between/inclusive Monday-Friday
    """
    return now_et.weekday() < 5


async def check_market_open() -> bool:
    """
    Checks whether the current date and time align with generic market open hours
    
    Returns:
        True if current date is between Mon-Fri, and 9:30am-4:00pm
    """
    now_utc = datetime.now(timezone.utc)
    now_et = now_utc.astimezone(ZoneInfo("America/New_York"))

    is_weekday = await check_weekday(now_et)
    if not is_weekday:
        return False

    is_valid_hour = await check_hour(now_et)
    if not is_valid_hour:
        return False

    print("Market Hours - Check Passed")

    return True


async def check_market_status() -> bool:
    """
    Checks whether the current market is open based on today's cached market status record. If 
    no record exists in the 'market_status' table, or the record is from a previous date, it
    retrieves the latest status from Finnhub and stores it in the 'market_status' table
    
    Returns:
        True if the latest market-status record retrieved indicates the market is open.
    """
    current_status = get_current_market_status()
    
    if current_status is not None:
        now_date_et = datetime.now(ZoneInfo("America/New_York")).date()
        status_date_et = current_status.date.astimezone(ZoneInfo("America/New_York")).date()

        if now_date_et == status_date_et:
            print("Market Status - Database Lookup Check Passed")
            return current_status.is_open

    current_status = await market_status_api_call()
    print(current_status.__dict__)

    if current_status is None:
        print("Alert: Current market status could not be retrieved from either the database or Finnhub.")
        return False

    is_open = current_status.is_open  #need this, otherwise sqlalchemy will throw DetachedInstanceError
    insert_current_market_status(current_status)
    print("Market Status - New API Call Made, Check Passed")
    
    return is_open


async def market_status_api_call() -> MarketStatus | None:
    """
    Retrieves the current market status from Finnhub, stores the result in the database
    'market_status' table, and returns it as a MarketStatus object.

    Returns:
        curr_market_status: a MarketStatus object containing current open status, trading 
        session, and holiday information. Returns None if the request/db insert fails.
    """
    params = { "exchange": "US" }
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url=FINNHUB_URL,
                params=params,
                headers=headers
            ) as response:
                response.raise_for_status()
                market_status = await response.json()

        curr_market_status = MarketStatus(
            is_open=market_status["isOpen"],
            session=market_status["session"],
            holiday=market_status["holiday"]
        )

        return curr_market_status

    except aiohttp.ClientResponseError as error:
        print(f"market_status_api_call() failed: Finnhub returned HTTP {error.status} — {error.message}")
    
    except aiohttp.ClientError as error:
        print(f"market_status_api_call() failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"market_status_api_call() failed: {error}")

    return None