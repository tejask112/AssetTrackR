from flask import Blueprint, jsonify, request, g
from decimal import Decimal, ROUND_HALF_UP
import requests
import os
import finnhub

from ..utils.recommendations import getRecommendation
from ..services.detailed_stock_view_service import get_time_series
from ..services.detailed_stock_view_service import retrieveLatestPriceIndividual

from ..db.db_services.trades.database_trades import log_trade
from ..db.db_services.portfolio.database_portfolio import add_to_portfolio, remove_from_portfolio, check_remove_from_portfolio, check_add_to_portfolio, get_portfolio, calculate_portfolio_value
from ..db.db_utils.market_hours import checkMarketOpen, checkWhenMarketOpens
from ..services.run_queued_trades import run_queued_trades
from ..db.db_services.userAccounts.database_userAccounts import getLiquidCash, checkInWatchList

bp = Blueprint("detailed_stock_view", __name__)

ALPACA_KEY = os.getenv("ALPACA_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FMP_KEY = os.getenv("FMP_KEY", "")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY", "")
LOGO_DEV_KEY = os.getenv("LOGO_DEV_KEY", "")

Q8  = Decimal('1.00000000')              # 8 dp
P16 = Decimal('1.0000000000000000')      # 16 dp

finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

# ---------------- RETRIEVE COMPANY PROFILE DATA  ----------------
@bp.route('/profile_data', methods=["GET"])
def profile_data():
    symbol = request.args.get("symbol", "")
    uid = request.args.get("uid", "")

    if (uid==""):
        return jsonify({ "error": "Missing UID argument" })

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

    timeSeriesResult = get_time_series(symbol)

    inWatchlist = checkInWatchList(g.db, uid, symbol)
    
    modified_data = {
        # COMPANY METADATA
        "companyName": companyProfileResult.get("companyName", "Error"),
        "companyDescription": companyProfileResult.get("description", "Error"),
        "exchange": companyProfileResult.get("exchange", "Error"),
        "exchangeTimezone": timeSeriesResult.get("meta", "Error").get("exchange_timezone", "Error"),
        "website": companyProfileResult.get("website", "Error"),
        "industry": companyProfileResult.get("industry", "Error"),
        "location": companyProfileResult.get("city","Error") + ", " + companyProfileResult.get("country", "Error"),
        "companyLogo": f'https://img.logo.dev/ticker/{symbol}?token={LOGO_DEV_KEY}&size=300&retina=true',
        "price": timeSeriesResult.get("values", -1)[0].get("close", -1),
        "priceTimeShort": timeSeriesResult.get("values", -1)[0].get("datetime", -1)[10:19],
        "priceTimeLong": timeSeriesResult.get("values", -1)[0].get("datetime", -1),
        "rangeLow": companyProfileResult.get("range", "Error").split("-")[0],
        "rangeHigh": companyProfileResult.get("range", "Error").split("-")[1],
        "inWatchlist": inWatchlist,

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

        # TIME SERIES DATA
        "timeseries": timeSeriesResult.get("values", [])
    }

    return jsonify(modified_data)

@bp.route('/run_queued_trades')
def run():
    # print(f"Portfolio: {get_portfolio(g.db, 'X5s2HImyTfNITElXIdhIRu0K70F3')}")
    # print(f"Portfolio Value: {calculate_portfolio_value(g.db, 'X5s2HImyTfNITElXIdhIRu0K70F3')}")
    # print(f"Cash: {getLiquidCash(g.db, 'X5s2HImyTfNITElXIdhIRu0K70F3')}")
    
    result = run_queued_trades()
    return jsonify(result)

@bp.route('/submit_order', methods=["POST"])
def submit_order():
    print("detailed_stock_view: received order..")
    data = request.get_json(silent=True) or {}

    try:
        uid = data["uid"]
        jwt = data["jwt"]
        ticker = data["ticker"]
        action = data["action"]
        quantity = Decimal(str(data["quantity"])).quantize(Decimal(Q8), rounding=ROUND_HALF_UP)
    except KeyError as e:
        return jsonify({ "error": f"Missing field: {e.args[0]}" }, 400)
    
    try:
        if quantity <= 0 or quantity > Decimal('99999999999999999999.99999999'):
            raise ValueError("Quantity out of range")
    except Exception as exception:
        return jsonify({ "error": str(exception) }, 401)

    
    print(f"detailed_stock_view: action={action} ticker={ticker} quantity={quantity}")

    # verify the JWT

    tradingType = "Over The Counter (OTC)"
    
    try:
        res = finnhub_client.quote(ticker)
        execution_price = Decimal(res.get("c", 0)).quantize(P16, rounding=ROUND_HALF_UP)
        print(f"EXECUTION PRICE: {execution_price}")
        # execution_price = Decimal(retrieveLatestPriceIndividual).quantize(P16, rounding=ROUND_HALF_UP)
        # check if market is open NY 9:30am - 4pm
        # execution_price = Decimal(229.05).quantize(P16, rounding=ROUND_HALF_UP)
        if (checkMarketOpen()):
            status="FILLED"
            if action=="BUY":
                add_to_portfolio(g.db, uid, ticker, quantity, execution_price)
            elif action=="SELL":
                remove_from_portfolio(g.db, uid, ticker, quantity, execution_price)
        else:
            status="QUEUED"
            if action=="BUY":
                check_add_to_portfolio(g.db, uid, ticker, quantity, execution_price)
            elif action=="SELL":
                check_remove_from_portfolio(g.db, uid, ticker, quantity)

        status_tooltip = ""
        res = log_trade(g.db, uid, ticker, status, status_tooltip, action, quantity, execution_price, tradingType)
        if res=="QUEUED":
            marketOpens = checkWhenMarketOpens()
            return jsonify({ "ok": True, "message": str(marketOpens) })
        else:
            return jsonify({ "ok": True })

    except Exception as exception:
        status = "REJECTED"
        status_tooltip = str(exception)
        log_trade(g.db, uid, ticker, status, status_tooltip, action, quantity, execution_price, tradingType)
        print(f"detailed_stock_view: Error = {exception}")
        return jsonify({"error": str(exception)}), 402
    