from ..supabase_client import supabase

# ---------------- GET COMPANY PROFILE FOR ONE COMPANY  ----------------
def get_company_profile(ticker):
    try:
        response = ( 
            supabase
            .table("company_profile")
            .select("*")
            .eq("ticker", ticker)
            .single()
        ).execute()

        return response.data
    
    except Exception as e:
        raise ValueError(e)
    
# ---------------- GET BRIEF COMPANY PROFILE FOR ALL COMPANIES  ----------------
def get_brief_company_profiles():
    try:
        response = (
            supabase
            .table("company_profile")
            .select(
                "ticker", 
                "company_name", 
                "exchange", 
                "range_low", 
                "range_high", 
                "x5_day_price_return_daily", 
                "month_to_date_price_return_daily", 
                "current_recommendation"
            ) 
        ).execute()

        return response.data
    
    except Exception as e:
        raise ValueError(e)