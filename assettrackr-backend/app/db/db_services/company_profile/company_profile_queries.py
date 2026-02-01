from ..supabase_client import supabase

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