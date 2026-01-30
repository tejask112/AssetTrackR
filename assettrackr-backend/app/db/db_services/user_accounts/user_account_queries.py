from ..supabase_client import supabase
from postgrest.exceptions import APIError
from decimal import Decimal

# ---------------- RETRIEVE ALL USERS  ----------------
def list_users():
    response = (
        supabase
        .table("users")
        .select("*")
        .execute()
    )

    users = response.data or []

    json_data = {
        "users": [{
            "id": u["uid"], 
            "email": u["email"],
            "cash": u["cash"]
        } for u in users ]
    }

    print(f"user_account_queries.py: All registered users: {json_data}")
    return json_data
    
# ---------------- CREATE NEW USER  ----------------
def create_user(uid, email):
    if not uid or not email:
        return ValueError("Missing Params: UID and Email are required")
    
    try:
        supabase.table("users").insert({
            "uid": uid,
            "email": email,
        }).execute()
    except APIError as e:
        if e.code == '23505':
            raise ValueError("User with thie email already exists.")
        raise ValueError("Could not register. Please try again.")

# ---------------- GET USER'S CASH BALANCE  ----------------
def get_liquid_cash(uid):
    if not uid:
        raise ValueError("Missing Params: UID is required")
    
    response = (
        supabase
        .table("users")
        .select("cash")
        .eq("uid", uid)
        .single()
        .execute()
    )

    if response.data is None:
        raise ValueError("User not found")

    return response.data["cash"]

# ---------------- CHECK IF USER HAS ENOUGH CASH FOR TRANSACTION  ---------------- not a query! remove from here
def check_liquid_cash(uid, total_price):
    if not uid or not total_price:
        raise ValueError("Missing Params: UID and Total Price are required")
    
    if total_price < 0:
        raise ValueError("Price cannot be negative")
    
    try:
        current_cash_balance = Decimal(get_liquid_cash(uid))
    except Exception as e:
        raise ValueError(e)
    
    if (current_cash_balance <= total_price):
        return False

    return True, current_cash_balance

# ---------------- UPDATE USER'S CASH BALANCE  ----------------
def update_liquid_cash(uid, amount, action):
    if not all([uid, amount, action]):
        raise ValueError("Missing Params: UID, Amount and Action are required")
    
    try:
        if action == "BUY":
            response = supabase.rpc("remove_funds", {
                "uid_input": uid,
                "amount_input": str(Decimal(amount))
            }).execute()

        elif action == "SELL" or action == "DEPOSIT":
            response = supabase.rpc("add_funds", {
                "uid_input": uid,
                "amount_input": str(Decimal(amount))
            }).execute()

        else:
            raise ValueError("Unrecognised operation")
        
        new_cash_balance = Decimal(str(response.data))
        return new_cash_balance
    except Exception as e:
        raise ValueError(e)

# ---------------- GET USER'S WATCHLIST ----------------
def get_watchlist(uid):
    if not uid:
        raise ValueError("Missing Params: UID")
    
    response = (
        supabase
        .table("users")
        .select("watchlist")
        .eq("uid", uid)
        .single()
        .execute()
    )

    if response.data is None:
        raise ValueError("User not found")
    
    return response.data

# ---------------- CHECK COMPANY IN WATCHLIST ---------------- not a query! remove from here
def check_in_watchlist(uid, ticker):
    if not all([uid, ticker]):
        raise ValueError("Missing Params: UID, Ticker")
    
    try:
        watchlist = get_watchlist(uid)
        return ticker in watchlist
    except Exception as e:
        raise ValueError(e)

# ---------------- ADD COMPANY TO WATCHLIST  ----------------
def add_to_watchlist(uid, ticker):
    if not all([uid, ticker]):
        raise ValueError("Missing Params: UID, Ticker")

    try:
        response = supabase.rpc("add_to_watchlist", {
        "uid_input": uid,
        "ticker_input": ticker, 
        }).execute()

        if response.data:
            print(f"{ticker} successfully ADDED TO watchlist. Proof: {response.data}")
    except Exception as e:
        raise ValueError(e)


    
# ---------------- REMOVE COMPANY FROM WATCHLIST  ----------------
def remove_from_watchlist(uid, ticker):
    if not all([uid, ticker]):
        raise ValueError("Missing Params: UID, Ticker")
    
    try:
        response = supabase.rpc("remove_from_watchlist", {
            "uid_input": uid,
            "ticker_input": ticker,
        }).execute()

        if response.data:
            print(f"{ticker} successfully REMOVED FROM watchlist. Proof: {response.data}")
    except Exception as e:
        raise ValueError(e)
    