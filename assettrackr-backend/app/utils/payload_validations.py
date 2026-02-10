from decimal import Decimal
import uuid

from .authenticator import verify_jwt

def validate_submit_order_payload(payload):
    required_fields = ["uid", "ticker", "action", "quantity", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    uid = payload["uid"]
    jwt = payload["jwt"]
    ticker = payload["ticker"].upper()
    action = payload["action"].upper()
    quantity = Decimal(str(payload["quantity"]))

    if quantity<=0:
        return False, "Bad Request, 'quantity' parameter cannot be less than or equal to zero."
    
    if action!="BUY" and action!="SELL":
        return False, "Bad Request, 'action' parameter must be 'BUY' or 'SELL'"
        
    recognised_tickers = ["NVDA", "GOOG", "AAPL", "TSLA", "AMZN", "MSFT", "META", "ORCL", "UBER", "NFLX", "SHOP", "TSM", "AMD", "AVGO", "MU"]
    if ticker not in recognised_tickers:
        return False, f"Bad Request, {ticker} currently not recognised/supported. Support for this asset may be coming soon. Please stay tuned for future updates - AssetTrackR team."
    
    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_cancel_order_payload(payload):
    required_fields = ["uid", "tradeid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    trade_id = payload.get("tradeid")
    try:
        uuid.UUID(str(trade_id)) # trade_id is always a 36-character (incl dashes) 8-4-4-4-12 char pattern (uuid).
    except:
        return False, "Bad Request, 'trade_id' is not a valid UUID code."
    
    uid = payload.get("uid")
    jwt = payload.get("jwt")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None
    
def validate_company_data_payload(payload):
    required_fields = ["uid", "ticker", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    ticker = payload.get("ticker", "")

    if len(ticker.strip()) == 0:
        return False, f"Bad Request, 'ticker' cannot be an empty string."
    
    recognised_tickers = ["NVDA", "GOOG", "AAPL", "TSLA", "AMZN", "MSFT", "META", "ORCL", "UBER", "NFLX", "SHOP", "TSM", "AMD", "AVGO", "MU"]
    if ticker not in recognised_tickers:
        return False, f"Bad Request, {ticker} is currently not recognised/supported. Support for this asset may be coming soon. Please stay tuned for future updates - AssetTrackR team."
    
    uid = payload.get("uid")
    jwt = payload.get("jwt")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message
    
    return True, None

def validate_explore_stocks_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    if len(jwt.strip()) == 0:
        return False, f"Bad Request, Missing fields: JWT Token"    

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_trade_history_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_home_data_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_portfolio_analytics_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_deposit_payload(payload):
    required_fields = ["uid", "jwt", "value"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    uid = payload.get("uid")
    deposit = payload.get("value")
    jwt = payload.get("jwt")

    if deposit>9999999.99 or deposit<0.01:
        return False, f"Bad Request, Invalid deposit quantity"

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_deposit_history_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_watchlist_add_payload(payload):
    required_fields = ["uid", "ticker", "companyName", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_watchlist_remove_payload(payload):
    required_fields = ["uid", "ticker", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None

def validate_portfolio_summary_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    jwt = payload.get("jwt", "")
    uid = payload.get("uid", "")

    valid, error_message = verify_jwt(uid, jwt)
    if not valid:
        return False, error_message

    return True, None    