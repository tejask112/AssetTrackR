from flask import Blueprint, jsonify, request
import requests
import os, websocket, json

from ..utils.dates import calculateStartDate
from ..utils.recommendations import getRecommendation

bp = Blueprint("detailed_stock_view", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

# ---------------- RETRIEVE COMPANY PROFILE DATA  ----------------
@bp.route('/profile_data', methods=["GET"])
def profile_data():
    symbol = request.args.get("query", "")

    companyProfileUrl = f"https://financialmodelingprep.com/stable/profile?symbol={symbol}&apikey={FMP_KEY}"
    companyProfileResponse = requests.get(url=companyProfileUrl)
    companyProfileResponseJson = companyProfileResponse.json()
    companyProfileResult = companyProfileResponseJson[0] if isinstance(companyProfileResponseJson, list) and companyProfileResponseJson else {}

    basicFinancialsUrl = f"https://finnhub.io/api/v1/stock/metric?symbol={symbol}&metric=all&token={FINNHUB_API_KEY}"
    basicFinancialsResponse = requests.get(url=basicFinancialsUrl)
    basicFinancialsResult = basicFinancialsResponse.json()
    basicFinancialsResultMetric = basicFinancialsResult.get("metric")

    recommendationToolsUrl = f"https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token={FINNHUB_API_KEY}"
    recommendationToolsResponse = requests.get(url=recommendationToolsUrl)
    recommendationToolsResult = recommendationToolsResponse.json()

    startDate = calculateStartDate()
    timeSeriesUrl = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1min&start_date={startDate}&outputsize=5000&apikey={TWELVE_API_KEY}"
    timeSeriesResponse = requests.get(url=timeSeriesUrl)
    timeSeriesResult = timeSeriesResponse.json()

    modified_data = {
        # COMPANY METADATA
        "companyName": companyProfileResult.get("companyName", "Error"),
        "companyDescription": companyProfileResult.get("description", "Error"),
        "exchange": companyProfileResult.get("exchange", "Error"),
        "exchangeTimezone": timeSeriesResult.get("meta", "Error").get("exchange_timezone", "Error"),
        "website": companyProfileResult.get("website", "Error"),
        "industry": companyProfileResult.get("industry", "Error"),
        "location": companyProfileResult.get("city","Error") + ", " + companyProfileResult.get("country", "Error"),
        "companyLogo": f'https://img.logo.dev/ticker/{symbol}?token={LOGO_DEV_KEY}&retina=true',
        "price": timeSeriesResult.get("values", -1)[0].get("close", -1),
        "priceTimeShort": timeSeriesResult.get("values", -1)[0].get("datetime", -1)[10:19],
        "priceTimeLong": timeSeriesResult.get("values", -1)[0].get("datetime", -1),
        "rangeLow": companyProfileResult.get("range", "Error").split("-")[0],
        "rangeHigh": companyProfileResult.get("range", "Error").split("-")[1],

        # COMPANY FINANCIALS - Volume
        "volume": companyProfileResult.get("volume", -1),
        "averageVolume": companyProfileResult.get("averageVolume", -1),
        "x10DayAverageTradingVolume": basicFinancialsResultMetric.get("10DayAverageTradingVolume", -1),
        "x3MonthAverageTradingVolume": basicFinancialsResultMetric.get("3MonthAverageTradingVolume", -1),

        # COMPANY FINANCIALS - Asset Turnover
        "assetTurnoverAnnual": basicFinancialsResultMetric.get("assetTurnoverAnnual", -1),
        "assetTurnoverTTM": basicFinancialsResultMetric.get("assetTurnoverTTM", -1),

        # COMPANY FINANCIALS - Price Return over time
        "x5DayPriceReturnDaily": basicFinancialsResultMetric.get("5DayPriceReturnDaily", -1),
        "monthToDatePriceReturnDaily": basicFinancialsResultMetric.get("monthToDatePriceReturnDaily", -1),
        "x13WeekPriceReturnDaily": basicFinancialsResultMetric.get("13WeekPriceReturnDaily", -1),
        "x26WeekPriceReturnDaily": basicFinancialsResultMetric.get("26WeekPriceReturnDaily", -1),
        "x52WeekPriceReturnDaily": basicFinancialsResultMetric.get("52WeekPriceReturnDaily", -1),
        
        # COMPANY FINANCIALS - Valuation & Market Cap
        "marketCapitalisation": basicFinancialsResultMetric.get("marketCapitalization", -1),
        "enterpriseValue": basicFinancialsResultMetric.get("enterpriseValue", -1),
        "forwardPE": basicFinancialsResultMetric.get("forwardPE", -1),
        "peAnnual": basicFinancialsResultMetric.get("peAnnual", -1),

        # COMPANY FINANCIALS - Profitability & Margins
        "grossMargin5Y": basicFinancialsResultMetric.get("grossMargin5Y", -1),
        "grossMarginAnnual": basicFinancialsResultMetric.get("grossMarginAnnual", -1),

        "operatingMargin5Y": basicFinancialsResultMetric.get("operatingMargin5Y", -1),
        "operatingMarginAnnual": basicFinancialsResultMetric.get("operatingMarginAnnual", -1),

        "netProfitMargin5Y": basicFinancialsResultMetric.get("netProfitMargin5Y", -1),
        "netProfitMargin5Y": basicFinancialsResultMetric.get("netProfitMargin5Y", -1),

        "pretaxMargin5Y": basicFinancialsResultMetric.get("pretaxMargin5Y", -1),
        "pretaxMarginAnnual": basicFinancialsResultMetric.get("pretaxMarginAnnual", -1),

        "roe5Y": basicFinancialsResultMetric.get("roe5Y", -1),
        "roeRfy": basicFinancialsResultMetric.get("roeRfy", -1),

        "roi5Y": basicFinancialsResultMetric.get("roi5Y", -1),
        "roiAnnual": basicFinancialsResultMetric.get("roiAnnual", -1),

        "roa5Y": basicFinancialsResultMetric.get("roa5Y", -1),
        "roaRfy": basicFinancialsResultMetric.get("roaRfy", -1),

        # COMPANY FINANCIALS - Profitability & Margins
        "dividendPerShareAnnual": basicFinancialsResultMetric.get("dividendPerShareAnnual", -1),
        "dividendGrowthRate5Y": basicFinancialsResultMetric.get("dividendGrowthRate5Y", -1),
        "payoutRatioAnnual": basicFinancialsResultMetric.get("payoutRatioAnnual", -1),

        # RECOMMENDATION TOOLS
        "recommendationTools": recommendationToolsResult,
        "recommendation": getRecommendation(recommendationToolsResult),

        # TIME SERIES DATA (interval=1hour)
        "timeseries": timeSeriesResult.get("values", "Error")
    }

    return jsonify(modified_data)
