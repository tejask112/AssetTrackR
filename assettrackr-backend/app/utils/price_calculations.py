

def calculate_current_price(company_market_data):
    if not company_market_data:
        return None

    latest_price = company_market_data[0]
    if not isinstance(latest_price, dict):
        return None
    
    return latest_price.get("price", None)
