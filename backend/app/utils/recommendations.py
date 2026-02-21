
def getRecommendation(recommendationTools):
    if len(recommendationTools)<=0:
        return "Unavailable"
    
    latestMonthJson = recommendationTools[0]
    categories = ["buy", "hold", "sell", "strongBuy", "strongSell"]
    topCategory = max(categories, key=lambda k: latestMonthJson[k])

    categoryConversion = {
        "strongBuy": "Strong Buy",
        "buy": "Buy",
        "hold": "Hold",
        "sell": "Sell",
        "strongSell": "Strong Sell"
    }

    return categoryConversion[topCategory]

