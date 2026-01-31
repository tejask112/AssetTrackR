from ..supabase_client import supabase

# ---------------- FETCH ALL TRADES FOR SPECIFIC USER ----------------
def get_user_trades(uid):
    try:
        response = (
            supabase
            .table("trades")
            .select("*")
            .eq("uid", uid)
            .order("date", desc=True)
        )

        return response.data
    except Exception as e:
        raise ValueError(e)

# ---------------- LOG A TRADE  ----------------
def log_trade(uid, ticker, status, status_tooltip, action, quantity, execution_price, trading_type=None):
    if status=="REJECTED":
        execution_price = 0
        execution_total_price = 0
    else:
        execution_total_price = execution_price*quantity
        status_tooltip = "Success"
    
    ticker = ticker.upper()

    try:
        supabase.table("trades").insert({
            "uid": uid,
            "ticker": ticker,
            "status": status,
            "status_tooltip": status_tooltip,
            "quantity": quantity,
            "action": action,
            "execution_price": execution_price,
            "execution_total_price": execution_total_price,
            "trading_type": trading_type
        }).execute()
    except Exception as e:
        raise ValueError(e)
