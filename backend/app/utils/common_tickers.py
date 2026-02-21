
def getAllTickers(allTrades):
    tickers: set[str] = set()

    for trade in allTrades:
        ticker = trade["ticker"]
        tickers.add(ticker)
    
    return tickers