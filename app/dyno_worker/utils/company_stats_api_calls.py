import asyncio
import aiohttp
import os
import json
from dotenv import load_dotenv
from asynciolimiter import StrictLimiter

load_dotenv()
FINNHUB_API_KEY_2 = os.environ["FINNHUB_API_KEY_2"]
FMP_KEY = os.environ["FMP_KEY"]

COMPANY_PROFILE_URL="https://financialmodelingprep.com/stable/profile"
BASIC_FINANCIALS_URL="https://finnhub.io/api/v1/stock/metric"
RECOMMENDATION_TRENDS_URL="https://finnhub.io/api/v1/stock/recommendation"
EARNINGS_URL="https://finnhub.io/api/v1/calendar/earnings"

async def earnings_api_call(session: aiohttp.ClientSession, symbol: str) -> json:
    """
    Makes an API call to Finnhub /api/v1/stock/recommendations endpoint to collect stock
    recommendations trends for the given symbol.

    Parameters:
        session: aiohttp client session object to make all http calls,
        symbol: the stock to collect all the data for

    Returns:
        recommendations: json API response Finnhub responded with
    """
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }
    params = { "symbol": symbol.upper() }

    try:
        async with session.get(
            url=EARNINGS_URL,
            params=params,
            headers=headers,
        ) as response:
            response.raise_for_status()
            earnings = await response.json()
            earnings_calendar = earnings["earningsCalendar"]

        if earnings_calendar is None:
            print("empty response")
            
        return earnings_calendar
    
    except aiohttp.ClientResponseError as error:
        print(f"recommendation_trends_api_call({symbol}) failed: Finnhub returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"recommendation_trends_api_call({symbol}) failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"recommendation_trends_api_call({symbol}) failed unexpectedly: {error}")


async def recommendation_trends_api_call(session: aiohttp.ClientSession, symbol: str) -> json:
    """
    Makes an API call to Finnhub /api/v1/stock/recommendations endpoint to collect stock
    recommendations trends for the given symbol.

    Parameters:
        session: aiohttp client session object to make all http calls,
        symbol: the stock to collect all the data for

    Returns:
        recommendations: json API response Finnhub responded with
    """
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }
    params = { "symbol": symbol.upper() }

    try:
        async with session.get(
            url=RECOMMENDATION_TRENDS_URL,
            params=params,
            headers=headers,
        ) as response:
            response.raise_for_status()
            recommendations = await response.json()

        if recommendations is None:
            print("empty response")

        return recommendations
    
    except aiohttp.ClientResponseError as error:
        print(f"recommendation_trends_api_call({symbol}) failed: Finnhub returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"recommendation_trends_api_call({symbol}) failed: Finnhub request error — {error}")

    except Exception as error:
        print(f"recommendation_trends_api_call({symbol}) failed unexpectedly: {error}")


async def company_profile_api_call(session: aiohttp.ClientSession, symbol: str) -> json:
    """
    Makes an API call to Financial Modelling Prep /stable/profile endpoint to collect company 
    profile for the given symbol.

    Parameters:
        session: aiohttp client session object to make all http calls,
        symbol: the stock to collect all the data for

    Returns:
        company_profile: json FMP api responded with
    """
    headers = { "apikey": FMP_KEY }
    params = { "symbol": symbol.upper() }

    try:
        async with session.get(
            url=COMPANY_PROFILE_URL,
            params=params,
            headers=headers,
        ) as response:
            response.raise_for_status()
            company_profile = await response.json()

        if company_profile is None:
            print("empty response")

        return company_profile[0]
    
    except aiohttp.ClientResponseError as error:
        print(f"company_profile_api_call({symbol}) failed: FMP returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"company_profile_api_call({symbol}) failed: FMP request error — {error}")

    except Exception as error:
        print(f"company_profile_api_call({symbol}) failed unexpectedly: {error}")


async def basic_financials_api_call(session: aiohttp.ClientSession, symbol: str) -> json:
    """
    Makes an API call to Finnhub /api/v1/stock/metric endpoint to collect basic financials 
    profile for the given symbol.

    Parameters:
        session: aiohttp client session object to make all http calls,
        symbol: the stock to collect all the data for

    Returns:
        metrics: json API response Finnhub responded with
    """
    headers = { "X-Finnhub-Token": FINNHUB_API_KEY_2 }
    params = { "symbol": symbol.upper(), "metric": "all" }

    try:
        async with session.get(
            url=BASIC_FINANCIALS_URL,
            params=params,
            headers=headers,
        ) as response:
            response.raise_for_status()
            basic_financials = await response.json()

        metrics = basic_financials["metric"]

        if metrics is None:
            print("empty response")

        return metrics
    
    except aiohttp.ClientResponseError as error:
        print(f"company_profile_api_call({symbol}) failed: FMP returned HTTP {error.status} — {error.message}")

    except aiohttp.ClientError as error:
        print(f"company_profile_api_call({symbol}) failed: FMP request error — {error}")

    except Exception as error:
        print(f"company_profile_api_call({symbol}) failed unexpectedly: {error}")