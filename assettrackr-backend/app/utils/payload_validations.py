from decimal import Decimal

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
        return False, f"Bad Request, {ticker} currently not recognised/supported. Support for this asset is coming soon. Please stay tuned for updates."
        
    return True, None