from ..supabase_client import supabase
from decimal import Decimal

# ---------------- FETCH ALL TRADES FOR SPECIFIC USER ----------------
def get_user_trades(uid):
    try:
        response = (
            supabase
            .table("trades")
            .select("*")
            .eq("uid", uid)
            .order("date", desc=True)
        ).execute()

        return response.data
    except Exception as e:
        raise ValueError(e)

# ---------------- LOG A TRADE  ----------------
def execute_trade(uid, action, quantity, ticker):
    ticker = ticker.upper()

    try:
        if action=="BUY":
            rpc_name = "execute_buy"
        else:
            rpc_name = "execute_sell"
        
        response = supabase.rpc(rpc_name, {
            "uid_input": uid,
            "quantity_input": str(Decimal(quantity)),
            "ticker_input": ticker
        }).execute()
        return response.data
    
    except Exception as e:
        raise ValueError(e)
    
# ---------------- QUEUE A TRADE  ----------------
def queue_trade(uid, action, quantity, ticker):
    ticker = ticker.upper()

    try:
        if action=="BUY":
            rpc_name = "queue_buy"
        else:
            rpc_name = "queue_sell"
        
        response = supabase.rpc(rpc_name, {
            "uid_input": uid,
            "quantity_input": str(Decimal(quantity)),
            "ticker_input": ticker
        }).execute()
        return response.data
    
    except Exception as e:
        raise ValueError(e)
    
# ---------------- CANCEL A TRADE  ----------------
def cancel_trade(trade_id):
    try:
        response = supabase.rpc("cancel_trade", {
            "trade_id_input": trade_id
        }).execute()
        return response.data
    
    except Exception as e:
        raise ValueError(e)