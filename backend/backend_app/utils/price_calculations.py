from datetime import timedelta, timezone
import dateutil.parser


from ..db_services.portfolio.portfolio_queries import get_portfolio

def calculate_current_price(company_market_data):
    if not company_market_data:
        return None

    latest_price = company_market_data[0]
    if not isinstance(latest_price, dict):
        return None
    
    return latest_price.get("price", None), latest_price.get("date", None)

def find_historical_price(target_date, sorted_data, max_gap_days=5):
    if target_date.tzinfo is None:
        target_date = target_date.replace(tzinfo=timezone.utc)

    best = None
    best_diff = None
    for entry in sorted_data:
        entry_date = entry['date']
        if entry_date.tzinfo is None:
            entry_date = entry_date.replace(tzinfo=timezone.utc)

        diff = abs((entry_date - target_date).total_seconds())
        if best_diff is None or diff < best_diff:
            best_diff = diff
            best = entry

    if best is None or best_diff > max_gap_days * 86400:
        return None

    return best['price']

def calculate_returns(timeline):
    parsed_data = []
    for entry in timeline:
        try:
            dt = dateutil.parser.isoparse(entry['date'])
            price = float(entry['price'])
            if price > 0:
                parsed_data.append({'date': dt, 'price': price})
        except (ValueError, KeyError):
            continue

    if not parsed_data:
        return {}

    parsed_data.sort(key=lambda x: x['date'], reverse=True)

    current_price = parsed_data[0]['price']
    current_date = parsed_data[0]['date']

    timeframes = {
        'x1d': timedelta(days=1),
        'x5d': timedelta(days=5),
        'x1m': timedelta(days=30),
        'x3m': timedelta(days=90),
        'x6m': timedelta(days=180),
    }

    results = {}
    for label, delta in timeframes.items():
        target_date = current_date - delta
        old_price = find_historical_price(target_date, parsed_data)

        if old_price is None:
            results[f"{label}_return"] = None
            results[f"{label}_return_pct"] = None
        else:
            change = current_price - old_price
            pct_change = (change / old_price) * 100
            results[f"{label}_return"] = round(change, 2)
            results[f"{label}_return_pct"] = round(pct_change, 2)

    return results