from ..supabase_client import supabase
from datetime import datetime, timedelta

def get_user_timeline_2w(uid):
    try:
        two_weeks_ago = (datetime.now() - timedelta(days=14)).isoformat()

        response = (
            supabase
            .table("timeline")
            .select("date", "price")
            .eq("uid", uid)
            .gte("date", two_weeks_ago) 
            .order("date", desc=True)
            .execute()
        )

        return response.data

    except Exception as e:
        raise ValueError(e)
    
def get_user_timeline(uid):
    try:
        response = (
            supabase
            .table("timeline")
            .select("date", "price")
            .eq("uid", uid)
            .order("date", desc=True)
        ).execute()

        return response.data

    except Exception as e:
        raise ValueError(e)