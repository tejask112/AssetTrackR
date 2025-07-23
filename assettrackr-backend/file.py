from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def hello():
    return jsonify({'message': 'hello world (from flask!)'})

def market_data():
    data = {
        'symbol' : 'AAPL',
        'price': 123.45,
        'timestamp': '2025-07-22T14:00:00Z'
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)