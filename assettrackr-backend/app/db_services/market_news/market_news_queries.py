from ..supabase_client import supabase

def get_market_news():
    try:
        response = (
            supabase
            .table("market_news")
            .select("*")
            .order("datetime", desc=True)
            .limit(10)
        ).execute()

        return response.data

    except Exception as e:
        raise ValueError(e)