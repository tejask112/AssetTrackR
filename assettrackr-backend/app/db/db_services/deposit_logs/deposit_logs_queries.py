from ..supabase_client import supabase
from ...db_utils.deposit_logs_formatter import deposit_logs_formatter

# ---------------- ADD USER DEPOSIT TO TABLE  ----------------
def add_deposit_log_entry(uid, deposit_value):
    if not all ([uid, deposit_value]):
        raise ValueError("Missing Params: UID, Deposit Value")
    
    try:
        supabase.table("deposit_logs").insert( {
            "uid": uid,
            "amount": deposit_value,
        }).execute()

    except Exception as e:
        raise ValueError(e)
    
# ---------------- GET ALL USER DEPOSITS  ----------------
def get_deposit_logs(uid):
    if not uid:
        raise ValueError("Missing Params: UID")
    
    try:
        response = (
            supabase
            .table("deposit_logs")
            .select("*")
            .eq("uid", uid)
            .order("date", desc=True)
            .execute()
        )
        return deposit_logs_formatter(response.data, uid)
    except Exception as e:
        raise ValueError(e)