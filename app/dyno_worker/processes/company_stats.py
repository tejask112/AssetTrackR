import asyncio
import aiohttp
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from asynciolimiter import StrictLimiter

from supported_stocks import STOCKS
from dyno_worker.utils.company_stats_api_calls import basic_financials_api_call, recommendation_trends_api_call, earnings_api_call, company_profile_api_call
from dyno_worker.utils.normalisations import normalise_company_metrics_api_resp, normalise_company_profile_api_resp, normalise_stock_recommendations_api_resp

limiter = StrictLimiter(1/4)

async def collect_company_stats(session: aiohttp.ClientSession, symbol: str) -> None:
    """
    Collects Company Profile, Basic Financials, Recommendation Trends, and Upcoming Earnings from 
    API providers for a single stock. Each stock's collection is upserted into the respective
    database table.

    Parameters:
        session: aiohttp client session object to make all http calls,
        symbol: the stock to collect all the data for
    """
    await limiter.wait()

    company_profile = await company_profile_api_call(session, symbol)
    earnings = await earnings_api_call(session, symbol)
    basic_financials = await basic_financials_api_call(session, symbol)
    recommendation_trends = await recommendation_trends_api_call(session, symbol)

    company_profile_dict = normalise_company_profile_api_resp(company_profile)
    company_metrics_dict = normalise_company_metrics_api_resp(earnings, basic_financials)
    stock_recommendations_list = normalise_stock_recommendations_api_resp(recommendation_trends)
    
    

    
    




async def refresh_all_company_stats() -> None:
    """
    Collects Company Profile, Basic Financials, Recommendation Trends, and Upcoming Earnings from 
    API providers for all stocks. Each collection is upserted into the respective database tables.
    """
    print("Starting collect_company_stats()")

    timeout = aiohttp.ClientTimeout(total=3)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        await asyncio.gather(
            *(collect_company_stats(session, symbol) for symbol in STOCKS)
        )