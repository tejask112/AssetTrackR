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
    
# ---------------- GET MARKET PRICES FOR LIST OF COMPANIES  ----------------
def get_selected_seven_days_prices(tickers):
    try:
        date_now = datetime.now()
        date_seven_days_ago = date_now - timedelta(days=7)

        response = (
            supabase
            .table("market_data")
            .select("ticker, date, price")
            .in_("ticker", tickers) 
            .order("date", desc=True)
            .gt("date", date_seven_days_ago)
            .execute()
        )
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
