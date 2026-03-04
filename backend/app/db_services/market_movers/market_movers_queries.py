from ..supabase_client import supabase

# ---------------- GET TOP MARKET GAINERS + LOSERS  ----------------
def get_market_movers():
    try:
        gainers = (
            supabase
            .table("top_market_gainers")
            .select("*")
        ).execute()

        losers = (
            supabase
            .table("top_market_losers")
            .select("*")
        ).execute()

        return gainers.data, losers.data
    
    except Exception as e:
        raise ValueError(e)