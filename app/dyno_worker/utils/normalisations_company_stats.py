from datetime import date
import json

async def normalise_company_profile_api_resp(company_profile: dict | None) -> dict:
    """
    Normalises the company profile json FMP API responds with in a format that can be inserted
    into the database. 

    Parameters:
        company_profile: the json FMP API responds with

    Returns:
        dict containing normalised values.
    """

    return {
        "exchange": company_profile.get("exchange"),
        "name": company_profile.get("companyName"),
        "description": company_profile.get("description"),
        "industry": company_profile.get("industry"),
        "sector": company_profile.get("sector"),
        "website": company_profile.get("website"),
        "country": company_profile.get("country"),

        "full_time_employees": (
            int(company_profile["fullTimeEmployees"])
            if company_profile.get("fullTimeEmployees")
            else None
        ),

        "address": company_profile.get("address"),

        "ipo_date": (
            date.fromisoformat(company_profile["ipoDate"])
            if company_profile.get("ipoDate")
            else None
        ),

        "ceo": company_profile.get("ceo"),
        "cik": company_profile.get("cik"),
        "isin": company_profile.get("isin"),
        "cusip": company_profile.get("cusip"),
    }


async def normalise_stock_recommendations_api_resp(recommendation_trends: list[dict] | None) -> list[dict]:
    """
    Normalises the stock recommendations json Finnhub API responds with in a format that can be inserted
    into the database correctly. Also adds extra fields the database requires.

    Parameters:
        recommendation_trends: the list of jsons Finhubb API responds with

    Returns:
        list of dicts containing normalised values for each month's recommendations
    """

    normalised = []

    if recommendation_trends is None:
        return normalised

    rating_mappings = {
        "strongBuy": "strong_buy",
        "buy": "buy",
        "hold": "hold",
        "sell": "sell",
        "strongSell": "strong_sell",
    }   

    for recommendation in recommendation_trends:
        most_voted_recommendation = max(
            list(rating_mappings.keys()),
            key=lambda key: recommendation[key]
        )

        new_dict = {}

        new_dict["covering_date_period"] = date.fromisoformat(recommendation["period"])
        new_dict["current_recommendation"] = rating_mappings[most_voted_recommendation]

        for rating, normalised_rating in rating_mappings.items():
            new_dict[normalised_rating] = recommendation.get(rating, 0)

        normalised.append(new_dict)

    return normalised


async def normalise_company_metrics_api_resp(earnings: list[dict] | None, basic_financials: dict | None) -> dict:
    """
    Normalises the company metrics data from multiple API sources into one dictionary that can be cleanly
    inserted into the database. 

    Volatile/time-sensitive metics are always included in the dictionary. If API returns null for a volatile 
    field, the value in the returned dictionary is set to None so db value can be overwritten with NULL.

    Non-volatile/non-time-sensitive metrics are only included if the API returns a non-null value. If a value
    is unavailable, the field is not included in the returned dictionary so the old value in db can remain.

    If an API request failed entirely and is passed in as None, no fields from that API source are included.
    This ensures that existing database values aren't overwritten with null.

    Parameters:
        earnings: the company's earnings data json that API responded with.
        basic_financials: the company's basic financials json the API responded with.

    Returns:
        dictionary containing all normalised fields.
    """

    normalised = {}

    # EARNINGS - volatile
    # earnings == None -> API request failed, don't update
    # earnings == []   -> successful response, but no earnings -> NULL
    if earnings is not None:
        valid_earnings = [
            earning
            for earning in earnings
            if earning.get("date")
        ]

        latest_earnings = (
            max(
                valid_earnings,
                key=lambda earning: date.fromisoformat(earning["date"])
            )
            if valid_earnings
            else None
        )

        normalised["upcoming_earnings_date"] = (
            date.fromisoformat(latest_earnings["date"])
            if latest_earnings
            else None
        )

        normalised["upcoming_earnings_hour_type"] = (
            latest_earnings.get("hour")
            if latest_earnings
            else None
        )


    if basic_financials is None:
        return normalised

    # Volatile metrics - must always include, even if api responded with None
    volatile_fields = {
        # Valuation / market dependent
        "market_capitalization": "marketCapitalization",
        "enterprise_value": "enterpriseValue",
        "enterprise_value_to_ebitda_ttm": "evEbitdaTTM",
        "enterprise_value_to_revenue_ttm": "evRevenueTTM",
        "enterprise_value_to_free_cash_flow_ttm": "currentEv/freeCashFlowTTM",
        "pe_ratio_ttm": "peTTM",
        "forward_pe_ratio": "forwardPE",
        "peg_ratio_ttm": "pegTTM",
        "forward_peg_ratio": "forwardPEG",
        "ps_ratio_ttm": "psTTM",
        "pb_ratio": "pb",
        "price_to_cash_flow_per_share_ttm": "pcfShareTTM",
        "price_to_free_cash_flow_per_share_ttm": "pfcfShareTTM",

        # Trading / risk
        "x10_day_average_trading_volume": "10DayAverageTradingVolume",
        "x3_month_average_trading_volume": "3MonthAverageTradingVolume",
        "beta": "beta",
        "x3_month_ad_return_std": "3MonthADReturnStd",
        "x52_week_high": "52WeekHigh",
        "x52_week_low": "52WeekLow",

        # Price performance
        "x5_day_price_return_daily": "5DayPriceReturnDaily",
        "month_to_date_price_return_daily": "monthToDatePriceReturnDaily",
        "x13_week_price_return_daily": "13WeekPriceReturnDaily",
        "x26_week_price_return_daily": "26WeekPriceReturnDaily",
        "x52_week_price_return_daily": "52WeekPriceReturnDaily",
        "year_to_date_price_return_daily": "yearToDatePriceReturnDaily",

        # Relative performance
        "price_relative_to_sp500_4_week": "priceRelativeToS&P5004Week",
        "price_relative_to_sp500_13_week": "priceRelativeToS&P50013Week",
        "price_relative_to_sp500_26_week": "priceRelativeToS&P50026Week",
        "price_relative_to_sp500_52_week": "priceRelativeToS&P50052Week",
        "price_relative_to_sp500_ytd": "priceRelativeToS&P500Ytd",

        # Dividend yields
        "dividend_yield_indicated_annual": "dividendYieldIndicatedAnnual",
        "current_dividend_yield_ttm": "currentDividendYieldTTM",
    }

    # Not volatile metrics - if api resp was none, keep whatever's currently stored in the db
    fundamental_fields = {
        # Valuation
        "enterprise_value_to_free_cash_flow_annual": "currentEv/freeCashFlowAnnual",
        "pe_ratio_annual": "peAnnual",
        "basic_pe_ratio_excluding_extraordinary_items_ttm": "peBasicExclExtraTTM",
        "pe_ratio_excluding_extraordinary_items_ttm": "peExclExtraTTM",
        "pe_ratio_excluding_extraordinary_items_annual": "peExclExtraAnnual",
        "pe_ratio_including_extraordinary_items_ttm": "peInclExtraTTM",
        "normalized_pe_ratio_annual": "peNormalizedAnnual",
        "ps_ratio_annual": "psAnnual",
        "pb_ratio_quarterly": "pbQuarterly",
        "pb_ratio_annual": "pbAnnual",
        "price_to_tangible_book_value_quarterly": "ptbvQuarterly",
        "price_to_tangible_book_value_annual": "ptbvAnnual",
        "price_to_cash_flow_per_share_annual": "pcfShareAnnual",
        "price_to_free_cash_flow_per_share_annual": "pfcfShareAnnual",

        # Income statement / per-share
        "revenue_per_share_ttm": "revenuePerShareTTM",
        "revenue_per_share_annual": "revenuePerShareAnnual",
        "eps_ttm": "epsTTM",
        "eps_annual": "epsAnnual",
        "basic_eps_excluding_extraordinary_items_ttm": "epsBasicExclExtraItemsTTM",
        "basic_eps_excluding_extraordinary_items_annual": "epsBasicExclExtraItemsAnnual",
        "eps_excluding_extraordinary_items_ttm": "epsExclExtraItemsTTM",
        "eps_excluding_extraordinary_items_annual": "epsExclExtraItemsAnnual",
        "eps_including_extraordinary_items_ttm": "epsInclExtraItemsTTM",
        "eps_including_extraordinary_items_annual": "epsInclExtraItemsAnnual",
        "normalized_eps_annual": "epsNormalizedAnnual",
        "ebitda_per_share_ttm": "ebitdPerShareTTM",
        "ebitda_per_share_annual": "ebitdPerShareAnnual",

        # Cash flow
        "cash_flow_per_share_ttm": "cashFlowPerShareTTM",
        "cash_flow_per_share_quarterly": "cashFlowPerShareQuarterly",
        "cash_flow_per_share_annual": "cashFlowPerShareAnnual",
        "cash_per_share_quarterly": "cashPerSharePerShareQuarterly",
        "cash_per_share_annual": "cashPerSharePerShareAnnual",

        # Balance sheet / liquidity
        "book_value_per_share_quarterly": "bookValuePerShareQuarterly",
        "book_value_per_share_annual": "bookValuePerShareAnnual",
        "tangible_book_value_per_share_quarterly": "tangibleBookValuePerShareQuarterly",
        "tangible_book_value_per_share_annual": "tangibleBookValuePerShareAnnual",
        "current_ratio_quarterly": "currentRatioQuarterly",
        "current_ratio_annual": "currentRatioAnnual",
        "quick_ratio_quarterly": "quickRatioQuarterly",
        "quick_ratio_annual": "quickRatioAnnual",
        "long_term_debt_to_equity_quarterly": "longTermDebt/equityQuarterly",
        "long_term_debt_to_equity_annual": "longTermDebt/equityAnnual",
        "total_debt_to_total_equity_quarterly": "totalDebt/totalEquityQuarterly",
        "total_debt_to_total_equity_annual": "totalDebt/totalEquityAnnual",
        "net_interest_coverage_ttm": "netInterestCoverageTTM",
        "net_interest_coverage_annual": "netInterestCoverageAnnual",

        # Profitability
        "gross_margin_ttm": "grossMarginTTM",
        "gross_margin_annual": "grossMarginAnnual",
        "gross_margin_5y": "grossMargin5Y",
        "operating_margin_ttm": "operatingMarginTTM",
        "operating_margin_annual": "operatingMarginAnnual",
        "operating_margin_5y": "operatingMargin5Y",
        "pretax_margin_ttm": "pretaxMarginTTM",
        "pretax_margin_annual": "pretaxMarginAnnual",
        "pretax_margin_5y": "pretaxMargin5Y",
        "net_profit_margin_ttm": "netProfitMarginTTM",
        "net_profit_margin_annual": "netProfitMarginAnnual",
        "net_profit_margin_5y": "netProfitMargin5Y",

        # Efficiency / returns
        "return_on_assets_ttm": "roaTTM",
        "return_on_assets_rfy": "roaRfy",
        "return_on_assets_5y": "roa5Y",
        "return_on_equity_ttm": "roeTTM",
        "return_on_equity_rfy": "roeRfy",
        "return_on_equity_5y": "roe5Y",
        "return_on_investment_ttm": "roiTTM",
        "return_on_investment_annual": "roiAnnual",
        "return_on_investment_5y": "roi5Y",
        "asset_turnover_ttm": "assetTurnoverTTM",
        "asset_turnover_annual": "assetTurnoverAnnual",
        "inventory_turnover_ttm": "inventoryTurnoverTTM",
        "inventory_turnover_annual": "inventoryTurnoverAnnual",
        "receivables_turnover_ttm": "receivablesTurnoverTTM",
        "receivables_turnover_annual": "receivablesTurnoverAnnual",
        "revenue_per_employee_ttm": "revenueEmployeeTTM",
        "revenue_per_employee_annual": "revenueEmployeeAnnual",
        "net_income_per_employee_ttm": "netIncomeEmployeeTTM",
        "net_income_per_employee_annual": "netIncomeEmployeeAnnual",

        # Growth
        "revenue_growth_ttm_yoy": "revenueGrowthTTMYoy",
        "revenue_growth_quarterly_yoy": "revenueGrowthQuarterlyYoy",
        "revenue_growth_3y": "revenueGrowth3Y",
        "revenue_growth_5y": "revenueGrowth5Y",
        "revenue_per_share_growth_5y": "revenueShareGrowth5Y",
        "eps_growth_ttm_yoy": "epsGrowthTTMYoy",
        "eps_growth_quarterly_yoy": "epsGrowthQuarterlyYoy",
        "eps_growth_3y": "epsGrowth3Y",
        "eps_growth_5y": "epsGrowth5Y",
        "ebitda_cagr_5y": "ebitdaCagr5Y",
        "ebitda_interim_cagr_5y": "ebitdaInterimCagr5Y",
        "focf_cagr_5y": "focfCagr5Y",
        "capex_cagr_5y": "capexCagr5Y",
        "book_value_per_share_growth_5y": "bookValueShareGrowth5Y",
        "tangible_book_value_cagr_5y": "tbvCagr5Y",
        "net_margin_growth_5y": "netMarginGrowth5Y",

        # Dividends
        "dividend_indicated_annual": "dividendIndicatedAnnual",
        "dividend_per_share_ttm": "dividendPerShareTTM",
        "dividend_per_share_annual": "dividendPerShareAnnual",
        "payout_ratio_ttm": "payoutRatioTTM",
        "payout_ratio_annual": "payoutRatioAnnual",
        "dividend_growth_rate_5y": "dividendGrowthRate5Y",
    }

    # process all volatile fields
    for db_field, api_field in volatile_fields.items():
        normalised[db_field] = basic_financials.get(api_field)

    normalised["x52_week_high_date"] = (
        date.fromisoformat(basic_financials["52WeekHighDate"])
        if basic_financials.get("52WeekHighDate")
        else None
    )

    normalised["x52_week_low_date"] = (
        date.fromisoformat(basic_financials["52WeekLowDate"])
        if basic_financials.get("52WeekLowDate")
        else None
    )

    # process all non-volatile fields
    for db_field, api_field in fundamental_fields.items():
        value = basic_financials.get(api_field)

        if value is not None:
            normalised[db_field] = value

    return normalised