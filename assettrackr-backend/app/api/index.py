from flask import Blueprint, request, jsonify, make_response
from firebase_admin import auth
from functools import wraps
from decimal import Decimal
import datetime

api = Blueprint("routes", __name__)

from ..utils.payload_validations import (
    validate_deposit_payload, validate_deposit_history_payload,
    validate_submit_order_payload, validate_cancel_order_payload,
    validate_watchlist_add_payload, validate_watchlist_remove_payload,
    validate_company_data_payload, validate_home_data_payload,
    validate_portfolio_analytics_payload, validate_trade_history_payload
)
from ..utils.api_responses import compute_submit_order_response, compute_cancel_order_response
from ..utils.market_hours import check_market_open, check_when_market_opens
from ..utils.price_calculations import calculate_returns, calculate_current_price
from ..utils.watchlist_aggregator import get_watchlist_data

from ..db_services.user_accounts.user_account_queries import (
    update_liquid_cash, create_user, add_to_watchlist, 
    remove_from_watchlist, check_in_watchlist, get_liquid_cash
)
from ..db_services.deposit_logs.deposit_logs_queries import add_deposit_log_entry, get_deposit_logs
from ..db_services.timeline.timeline_queries import initialise_user_timeline, get_user_timeline_2w, get_user_timeline
from ..db_services.trades.trades_queries import execute_trade, queue_trade, cancel_trade, get_user_trades
from ..db_services.company_profile.company_profile_queries import get_company_profile
from ..db_services.market_data.market_data_queries import get_market_data
from ..db_services.portfolio.portfolio_queries import get_portfolio_balance, get_portfolio, get_portfolio_with_prices
from ..db_services.market_news.market_news_queries import get_market_news

# --------------------------------------------------------------------------------
# LOGIN + LOGOUT
# --------------------------------------------------------------------------------
def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print("login_handler: Authenticating...")

        auth_header = request.headers.get("Authorization", "")
        parts = auth_header.split()

        # looking for "Authorization: Bearer <ID_TOKEN>" in request header
        if len(parts) != 2 or parts[0].lower() != "bearer": 
            return jsonify({"error": "Missing token"}), 401
        try:
            # verify the JWT is issued by Firebase + hasnt expired.
            decoded = auth.verify_id_token(parts[1]) 
            request.user = decoded
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return wrapper

@api.route("/authenticate", methods=["POST"])
@require_auth
def authenticate():
    print("login_handler: Received a login request...")
    return jsonify({"ok": True, "uid": request.user["uid"]})

@api.route("/initialise_user", methods=["POST"])
@require_auth
def initialise_user():
    print("login_handler: Recived an initilisation request...")

    uid = request.user["uid"]
    email = request.user["email"]
    
    create_user(uid, email)
    initialise_user_timeline(uid)

    return jsonify({"ok": True, "uid": request.user["uid"]})


@api.route("/session", methods=["POST"])
def create_session():
    print("login_handler: Creating session...")
    data = request.get_json(silent=True) or {}
    idToken = data.get("idToken")
    if not idToken:
        return jsonify({
            "error": "idToken required"
        }), 400
    
    try:
        auth.verify_id_token(idToken)
        expiresIn = datetime.timedelta(days=5)
        sessionCookie = auth.create_session_cookie(idToken, expires_in=expiresIn)
    except Exception:
        return jsonify({
            "error": "unauthorised"
        }), 401
    
    response = make_response(jsonify({
        "status": "ok"
    }))
    response.set_cookie(
        "session",
        sessionCookie,
        max_age=int(expiresIn.total_seconds()),
        httponly=True,
        secure=True,
        samesite="Lax",
        path="/"
    )
    return response

@api.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({
        "status": "signed out"
    }))
    response.delete_cookie("session", path="/")
    return response

# --------------------------------------------------------------------------------
# BALANCE MANAGEMENT (fund deposits)
# --------------------------------------------------------------------------------
@api.route('/deposit', methods=['POST'])
def deposit():
    allowed, error_message = validate_deposit_payload(request.get_json(silent=True))

    if not allowed:
        return jsonify({ "error": error_message }), 400

    payload = request.get_json()
    uid = payload.get("uid")
    deposit = payload.get("value")

    try:
        deposit = float(deposit)
        remaining = update_liquid_cash(uid, deposit, "DEPOSIT")
        add_deposit_log_entry(uid, deposit)

        return jsonify({ 
            "success": "ok",
            "remaining_balance": str(remaining) 
        })
    
    except Exception as e:
        print(f"deposit() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" })
     
@api.route('/deposit-history', methods=["GET"])
def deposit_history():
    allowed, error_message = validate_deposit_history_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400

    uid = request.args.get("uid")

    try:
        history = get_deposit_logs(uid)
        print(f"history: {history}")
        return jsonify(history)
    
    except Exception as e:
        print(f"deposit_history() - Exception raised: {str(e)}")
        return jsonify({ "error": str(e) })
    
# --------------------------------------------------------------------------------
# ORDER MANAGEMENT (place/cancel orders)
# --------------------------------------------------------------------------------
@api.route('/submit-order', methods=["POST"])
def submit_order():

    payload = request.get_json(silent=True) or {}
    allowed, error_msg = validate_submit_order_payload(payload)

    if not allowed:
        return jsonify({ "error" : error_msg }), 400

    uid = payload["uid"]
    jwt = payload["jwt"]
    ticker = payload["ticker"].upper()
    action = payload["action"].upper()
    quantity = Decimal(str(payload["quantity"]))
       
    print(f"/submit-order: action={action}, ticker={ticker}, quantity={quantity}")
    try:
        if check_market_open():
            res = execute_trade(uid, action, quantity, ticker)
        else:
            res = queue_trade(uid, action, quantity, ticker)

        success, message, status_code = compute_submit_order_response(res)
        
        if success:
            return jsonify({ "ok": message }), 200
        else:
            return jsonify({ "error": message }), status_code
    
    except Exception as e:
        print(f"submit_order() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

@api.route("/cancel-order", methods=["POST"])
def cancel_order():
    
    payload = request.get_json(silent=True) or {}
    allowed, error_message = validate_cancel_order_payload(payload)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = payload.get("uid")
    trade_id = payload.get("tradeid")

    try:
        res = cancel_trade(uid, trade_id)
        success, message, status_code = compute_cancel_order_response(res)

        if success:
            return jsonify({ "ok": message }), 200
        else:
            return jsonify({ "error": message }), status_code
    
    except Exception as e:
        print(f"cancel_order() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500
    
# --------------------------------------------------------------------------------
# WATCHLIST MANAGEMENT (add/remove tickers to/from watchlist)
# --------------------------------------------------------------------------------
@api.route('/watchlist-add', methods=["POST"])
def addToWatchlist():
    allowed, error_message = validate_watchlist_add_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400

    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    company_name = request.args.get("companyName")
    
    try:
        add_to_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

@api.route('/watchlist-remove', methods=["POST"])
def removeFromWatchlist():
    allowed, error_message = validate_watchlist_remove_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = request.args.get("uid")
    ticker = request.args.get("ticker")

    
    try:
        remove_from_watchlist(uid, ticker)
        return jsonify({ticker: "success"})
    except Exception as e:
        return jsonify({"error": str(e)})

# --------------------------------------------------------------------------------
# PAGES - DetailedStockView (fetch company data for specific company)
# --------------------------------------------------------------------------------
@api.route('/company-data', methods=["GET"])
def company_data():
    allowed, error_msg = validate_company_data_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_msg }), 400

    uid = request.args.get("uid")
    ticker = request.args.get("ticker")
    ticker = ticker.upper()
    
    try:
        company_profile_data = get_company_profile(ticker)
        company_market_data = get_market_data(ticker)
        current_price, current_price_date = calculate_current_price(company_market_data)
        in_watchlist = check_in_watchlist(uid, ticker)

        company_market_data.reverse()
    except Exception as e:
        print(f"company_data() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500
    
    response = {
        "company_data": company_profile_data,
        "current_price": current_price,
        "current_price_date": current_price_date,
        "historical_prices": company_market_data,
        "in_watchlist": in_watchlist,
    }

    return jsonify(response), 200

# --------------------------------------------------------------------------------
# PAGES - ExploreStocks (fetch brief company data for all companies)
# --------------------------------------------------------------------------------
@api.route("explore-stocks", methods=["GET"])
def explore_stocks():
    allowed, error_mgs = validate_explore_stocks_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_mgs }), 400
    
    try:
        company_data = get_brief_company_profiles()
        company_prices = get_seven_days_prices()

        res = format_explore_stocks_response(company_data, company_prices)

        return jsonify(res)
    
    except Exception as e:
        print(f"explore_stocks() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

# --------------------------------------------------------------------------------
# PAGES - Home (fetch home data for specific user)
# --------------------------------------------------------------------------------
@api.route('/home-data', methods=['GET'])
def home_data():
    allowed, error_message = validate_home_data_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message}), 400
    
    uid = request.args.get('uid')

    try:
        cash_balance = round(get_liquid_cash(uid), 2)
        market_news = get_market_news()
        portfolio_balance = round(get_portfolio_balance(uid), 2)
        portfolio = get_portfolio(uid)
        timeline = get_user_timeline_2w(uid)
        watchlist_data = get_watchlist_data(uid)

        return jsonify({ 
            "cash_balance": cash_balance,
            "portfolio_balance": portfolio_balance,
            "portfolio": portfolio,
            "x2w_timeline": timeline,
            "market_news": market_news,
            "watchlist_data": watchlist_data
        })

    except Exception as e:
        print(f"home_data() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

# --------------------------------------------------------------------------------
# PAGES - PortfolioAnalytics (fetch portfolio analytics for specific user)
# --------------------------------------------------------------------------------
@api.route("/portfolio-analytics", methods=["GET"])
def portfolio_analytics():
    allowed, error_message = validate_portfolio_analytics_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_message }), 400
    
    uid = request.args.get("uid")

    try:
        portfolio = get_portfolio_with_prices(uid)
        cash_balance = round(get_liquid_cash(uid), 2)
        timeline = get_user_timeline(uid)
        returns = calculate_returns(timeline)
        
        res = {
            "cash_balance": cash_balance,
            "portfolio": portfolio,
            "returns": returns,
            "timeline": timeline
        }

        return jsonify(res)
    
    except Exception as e:
        print(f"portfolio_analytics() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

# --------------------------------------------------------------------------------
# PAGES - TradeHistory (fetch all trades for specific user)
# --------------------------------------------------------------------------------
@api.route('/trade-history', methods=["GET"])
def trade_history():
    allowed, error_msg = validate_trade_history_payload(request.args)

    if not allowed:
        return jsonify({ "error": error_msg }), 400
    
    uid = request.args.get("uid", "")
    
    # future improvement: include pagination to reduce server load? 
    try:
        user_trades = get_user_trades(uid)
        return jsonify(user_trades)
    except Exception as e:
        print(f"trade_history() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" }), 500

