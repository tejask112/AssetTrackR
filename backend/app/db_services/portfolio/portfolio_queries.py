from ..supabase_client import supabase

# ---------------- GET A USER'S PORTFOLIO ----------------
def get_portfolio(uid):
    try:
        response = (
            supabase
            .table("portfolio")
            .select('ticker', 'quantity')
            .eq('uid', uid)
        ).execute()

        return response.data
    
    except Exception as e:
        raise ValueError(e)
    
# ---------------- GET A USER'S PORTFOLIO VALUE ----------------
def get_portfolio_balance(uid):
    try:
        response = supabase.rpc("get_portfolio_balance", {
            "uid_input": uid
        }).execute()
        return response.data

    except Exception as e:
        raise ValueError(e) 

# ---------------- GET A USER'S PORTFOLIO VALUE WITH EACH TICKER'S LATESTB PRICE ----------------
def get_portfolio_with_prices(uid):
    try:
        response = supabase.rpc("get_portfolio_with_prices", {
            "uid_input": uid
        }).execute()
        return response.data
    
    except Exception as e:
        raise ValueError(e)