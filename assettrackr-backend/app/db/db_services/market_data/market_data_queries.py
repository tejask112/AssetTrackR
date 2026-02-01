from ..supabase_client import supabase

def get_market_data(ticker):
    try:
        response = (
            supabase
            .table("market_data")
            .select("date", "price")
            .eq("ticker", ticker)
            .order("date", desc=True)
        ).execute()

        return response.data
    
    except Exception as e:
        raise ValueError(e)