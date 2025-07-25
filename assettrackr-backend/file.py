from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": "PKSBHQZ8SKVL9FA4OE75",
        "APCA-API-SECRET-KEY": "bLa4uLT72RV2GAJjUf7hQBQfShk1a0jfioav79kF"
        }

# ---------------- RETRIEVES TODAYS TOP GAINERS (STOCKS) ----------------
@app.route('/api/biggest_stock_gainers')
def biggest_stock_gainers():
    url = "https://financialmodelingprep.com/stable/biggest-gainers?apikey=JbWRPbI6VGapru3LipUIte6b8TML23lg"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
    except requests.RequestException as err:
        app.logger.error("Error fetching top gainers: %s", err)
        return jsonify({"error": "Upstream service unavailable"}), 502

    listOfTodaysTopGainers = sorted(response.json(), key=lambda s: s["changesPercentage"], reverse=True)[:10]
    
    output = [
        {
          "symbol": s["symbol"],
          "current_price": s["price"],
          "change": s["change"],
          "exchange": s["exchange"],
          "logo": f'https://img.logo.dev/ticker/{s["symbol"]}?token=pk_OFx05JtoRi2yAQ4wnd9Ezw&retina=true',
          "name": s["name"],
          "percentage_change": s["changesPercentage"],
        }
        for s in listOfTodaysTopGainers
    ]
  

    return jsonify(output)


















if __name__ == '__main__':
    app.run(debug=True, port=5000)