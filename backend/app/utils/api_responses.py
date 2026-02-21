

def compute_submit_order_response(res):
    response_text = str(res).lower()

    match response_text:
        case "success":
            return True, "success", 200
        
        case "queued":
            return True, "queued", 200
        
        case "error: user not found":
            return False, "Bad Request. UID not a valid user.", 400

        case "error: quantity must be greater than zero":
            return False, "Invalid quantity. The value must be greater than zero.", 400

        case "error: insufficient funds":
            return False, "You have insufficient funds to complete this transaction.", 400

        case "error: insufficient quantity":
            return False, "Invalid quantity. Sell quantity exceeds your current holdings.", 400

        case _:
            return False, f"Internal Server Error {response_text}", 500
        
def compute_cancel_order_response(res):
    response_text = str(res).lower()

    match response_text:
        case "cancelled":
            return True, "success", 200
        
        case "error: trade_id does not exist":
            return False, "trade_id not found.", 400
        
        case "error: trade cannot be cancelled":
            return False, "trade cannot be cancelled, please try again later.", 400
        
        case _:
            return False, f"Internal Server Error {response_text}", 500