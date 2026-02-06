from datetime import datetime, timedelta
import dateutil.parser

from ..db_services.portfolio.portfolio_queries import get_portfolio

def calculate_current_price(company_market_data):
    if not company_market_data:
        return None

    latest_price = company_market_data[0]
    if not isinstance(latest_price, dict):
        return None
    
    return latest_price.get("price", None), latest_price.get("date", None)

def calculate_returns(timeline):
    parsed_data = []
    for entry in timeline:
        try:
            dt = dateutil.parser.isoparse(entry['date'])
            parsed_data.append({'date': dt, 'price': float(entry['price'])})
        except (ValueError, KeyError):
            continue
            
    if not parsed_data:
        return {}

    parsed_data.sort(key=lambda x: x['date'], reverse=True)
    
    current_entry = parsed_data[0]
    current_price = current_entry['price']
    current_date = current_entry['date']

    timeframes = {
        'x1d': timedelta(days=1),
        'x5d': timedelta(days=5),
        'x1m': timedelta(days=30),
        'x3m': timedelta(days=90),
        'x6m': timedelta(days=180)
    }

    results = {}

    for label, delta in timeframes.items():
        target_date = current_date - delta
        old_price = find_historical_price(target_date, parsed_data)
        
        key_ret = f"{label}_return"
        key_pct = f"{label}_return_pct"

        if old_price is None:
            results[key_ret] = None
            results[key_pct] = None
        else:
            change = current_price - old_price
            
            if old_price == 0:
                pct_change = 0 if current_price == 0 else float('inf')
            else:
                pct_change = (change / old_price) * 100

            results[key_ret] = round(change, 2)
            results[key_pct] = f"{round(pct_change, 2)}%"

    return results

def find_historical_price(target_date, data):
    closest_entry = None
    min_diff = float('inf')
    
    for entry in data:
        if entry['date'] > target_date + timedelta(hours=12): 
            continue
            
        diff = abs((entry['date'] - target_date).total_seconds())
        
        if diff < min_diff:
            min_diff = diff
            closest_entry = entry
        else:
            pass
    
        return None
        
    return closest_entry['price'] if closest_entry else None