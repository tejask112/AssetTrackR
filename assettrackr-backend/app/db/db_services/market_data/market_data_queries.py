from ..supabase_client import supabase
from datetime import datetime, timedelta

# ---------------- GET MARKET PRICES FOR ONE COMPANY  ----------------
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

# ---------------- RETRIEVE 7 DAYS OF PRICES FOR ALL COMPANIES  ----------------
def get_seven_days_prices():
    try:
        date_now = datetime.now()
        date_seven_days_ago = date_now - timedelta(days=7)

        response = (
            supabase.
            table("market_data")
            .select("*")
            .gt("date", date_seven_days_ago)
        ).execute()

        return response.data

    except Exception as e:
        raise ValueError(e)
