from ..supabase_client import supabase

def get_user_timeline_2w(uid):
    try:
        response = (
            supabase
            .table("timeline")
            .select("date", "value")
            .eq("uid", uid)
            .order("date", desc=True)
        ).execute()

        return response.data

    except Exception as e:
        raise ValueError(e)