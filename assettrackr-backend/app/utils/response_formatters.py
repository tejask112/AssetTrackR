from collections import defaultdict

from .price_calculations import calculate_current_price

def format_explore_stocks_response(company_data, company_prices):

    prices_dict = defaultdict(list)
    for element in company_prices:
        date = element.get("date", "")
        price = element.get("price", -1)
        ticker = element.get("ticker", "")

        if date == "" or price == -1 or ticker == "":
            continue

        prices_dict[ticker].append({"date": date, "price": price})

    for ticker in prices_dict:
        prices_dict[ticker].sort(key=lambda x: x["date"], reverse=True)

    latest_price_dict = {}
    for ticker, values in dict(prices_dict).items():
        latest_price = calculate_current_price(values)
        latest_price_dict[ticker] = latest_price

    for company in company_data:
        ticker = company.get("ticker", "")
        
        if ticker == "":
            continue

        company["prices"] = prices_dict.get(ticker, [])
        company["latest_price"] = latest_price_dict.get(ticker, -1)

    return company_data


