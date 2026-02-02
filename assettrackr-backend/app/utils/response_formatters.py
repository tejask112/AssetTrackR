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


