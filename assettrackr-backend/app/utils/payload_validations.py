from decimal import Decimal
import uuid

def validate_submit_order_payload(payload):
    required_fields = ["uid", "ticker", "action", "quantity"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    uid = payload["uid"]
    # jwt = payload["jwt"]
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
    
    # ADD - VERIFY JWT TOKEN

    return True, None

def validate_cancel_order_payload(payload):
    if "trade_id" not in payload:
        return False, "Bad Request, 'trade_id' parameter cannot be empty."
    
    trade_id = payload.get("trade_id")
    try:
        uuid.UUID(str(trade_id)) # trade_id is always a 36-character (incl dashes) 8-4-4-4-12 char pattern (uuid).
    except:
        return False, "Bad Request, 'trade_id' is not a valid UUID code."
    
    # ADD - VERIFY JWT TOKEN
    return True, None
    
def validate_company_data_payload(payload):
    required_fields = ["uid", "ticker"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"
    
    uid = payload.get("uid", "")
    ticker = payload.get("ticker", "")
    jwt = payload.get("jwt", "")

    if len(ticker.strip()) == 0:
        return False, f"Bad Request, 'ticker' cannot be an empty string."
    
    recognised_tickers = ["NVDA", "GOOG", "AAPL", "TSLA", "AMZN", "MSFT", "META", "ORCL", "UBER", "NFLX", "SHOP", "TSM", "AMD", "AVGO", "MU"]
    if ticker not in recognised_tickers:
        return False, f"Bad Request, {ticker} is currently not recognised/supported. Support for this asset may be coming soon. Please stay tuned for future updates - AssetTrackR team."
    
    # ADD - VERIFY JWT TOKEN
    return True, None

def validate_explore_stocks_payload(payload):
    jwt = payload.get("jwt", "")

    if len(jwt.strip()) == 0:
        return False, f"Bad Request, Missing fields: JWT Token"
    
    # ADD - VERIFY JWT TOKEN

    return True, None

def validate_trade_history_payload(payload):
    required_fields = ["uid", "jwt"]
    missing_fields = [field for field in required_fields if field not in payload]
    if len(missing_fields)>0:
        return False, f"Bad Request, Missing fields: {missing_fields}"

    # ADD - VERIFY JWT TOKEN

    return True, None

