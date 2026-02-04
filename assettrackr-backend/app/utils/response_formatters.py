from collections import defaultdict

def format_explore_stocks_response(company_data, company_prices):
    prices_dict = defaultdict(list)
    for element in company_prices:
        date = element.get("date", "")
        price = element.get("price", -1)
        ticker = element.get("ticker", "")

        if date == "" or price == -1 or ticker == "":
            continue

        prices_dict[ticker].append(price)

    price_info_dict = {}
    for ticker, values in prices_dict.items():
        latest_price = values[-1]
        oldest_price = values[0]

        change = latest_price - oldest_price

        price_info_dict[ticker] = (latest_price, change)

    for company in company_data:
        ticker = company.get("ticker", "")
        
        if ticker == "":
            continue
        
        latest_price, change = price_info_dict.get(ticker, -1)

        company["prices"] = prices_dict.get(ticker, [])
        company["latest_price"] = latest_price
        company["x7d_change"] = change 

    return company_data

def format_watchlist_data(raw_data, watchlist_json):
    grouped = defaultdict(list)
    for entry in raw_data:
        grouped[entry["ticker"]].append(entry)

    res = []

    for ticker, entries in grouped.items():
        entries.sort(key=lambda x: x["date"])
        
        prices_list = [e["price"] for e in entries]
        
        if not prices_list:
            continue

        latest_price = prices_list[-1]
        oldest_price = prices_list[0]
        change = round(latest_price - oldest_price, 2)

        if oldest_price != 0:
            change_percent = round((change / oldest_price) * 100, 2)
        else:
            change_percent = 0.0
        
        formatted_prices = [e["price"] for e in entries]
        
        company_name = watchlist_json.get("watchlist", {}).get(ticker, "")

        res.append({
            "ticker": ticker,
            "company_name": company_name,
            "latest_price": latest_price,
            "x7d_change": change,
            "x7d_change_pct": change_percent,
            "prices": formatted_prices
        })

    return res