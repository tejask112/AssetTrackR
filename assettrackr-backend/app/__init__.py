import os, json
from flask import Flask, g
from flask_cors import CORS
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    init_firebase()

    # from .routes.login_handler import bp as loginHandler_bp
    # from .routes.operations.order_management import bp as order_management_bp
    # from .routes.operations.balance_management import bp as balance_management_bp
    # from .routes.operations.watchlist_management import bp as watchlist_management_bp
    # from .routes.pages.detailed_stock_view_page import bp as detailed_stock_view_page_bp
    # from .routes.pages.explore_stocks_page import bp as explore_stocks_page_bp
    # from .routes.pages.trade_history_page import bp as trade_history_page_bp
    # from .routes.pages.home_page import bp as home_page_bp
    # from .routes.pages.portfolio_analytics_page import bp as portfolio_analytics_bp
    # app.register_blueprint(loginHandler_bp, url_prefix="/api")
    # app.register_blueprint(order_management_bp, url_prefix="/api")
    # app.register_blueprint(balance_management_bp, url_prefix="/api")
    # app.register_blueprint(watchlist_management_bp, url_prefix="/api")
    # app.register_blueprint(detailed_stock_view_page_bp, url_prefix="/api")
    # app.register_blueprint(explore_stocks_page_bp, url_prefix="/api")
    # app.register_blueprint(trade_history_page_bp, url_prefix="/api")
    # app.register_blueprint(home_page_bp, url_prefix="/api")
    # app.register_blueprint(portfolio_analytics_bp, url_prefix="/api")

    from .api.index import api as index_api
    app.register_blueprint(index_api, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app

def init_firebase():
    if not firebase_admin._apps:
        sa_json = os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)