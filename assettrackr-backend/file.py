from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": "PKSBHQZ8SKVL9FA4OE75",
        "APCA-API-SECRET-KEY": "bLa4uLT72RV2GAJjUf7hQBQfShk1a0jfioav79kF"
        }

@app.route('/api/todats_top_movers')
def todays_top_movers():
    url = "https://data.alpaca.markets/v1beta1/screener/stocks/movers?top=10"
    response = requests.get(url, headers=headers)
    responseJson = response.json()
    









@app.route('/api/market_data')
def market_data():
    symbolInput = request.args.get('symbol').upper()
    url = f"https://data.alpaca.markets/v2/stocks/{symbolInput}/trades/latest"

    response = requests.get(url, headers=headers)
    responseJson = response.json()
    res_symbol = responseJson['symbol']
    res_price = responseJson['trade']['p']
    res_area = responseJson['trade']['z']
    res_areaUpdate = ''

    match res_area:
        case 'A':
            res_areaUpdate = 'New York Stock Exchange'
        case 'B':
            res_areaUpdate = 'NYSE Arca, Bats, IEX and other regional exchanges'
        case 'C':
            res_areaUpdate = 'NYSE Arca, Bats, IEX and other regional exchanges'
        case 'N':
            res_areaUpdate = 'Overnight'
        case 'O':
            res_areaUpdate = 'OTC'

    print(response.text)

    data = {
        'symbol': res_symbol,
        'price': res_price,
        'area': res_areaUpdate,
    }   

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)