import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    from .routes.explore_stocks import bp as exploreStocks_bp
    from .routes.detailed_stock_view import bp as detailedStockView_bp

    app.register_blueprint(exploreStocks_bp, url_prefix="/api")
    app.register_blueprint(detailedStockView_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app
