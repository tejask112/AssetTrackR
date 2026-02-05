import os, json
from flask import Flask, g
from flask_cors import CORS
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

from .db.db_services.database_manager import SessionLocal, init_db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    init_db()

    # creates a new database session per HTTP request
    @app.before_request 
    def create_session():
        g.db = SessionLocal()

    @app.teardown_request
    def remove_session(exc):
        db = getattr(g, "db", None)
        if db is None:
            return
        try: 
            if exc:
                db.rollback() # in case of error, rollback to previous version.
        finally:
            db.close()
            SessionLocal.remove()


    from .routes.portfolio_data import bp as portfolioData_bp
    from .routes.login_handler import bp as loginHandler_bp
    from .db.db_routes.watchlist.watchlist import bp as watchlist_bp
    from .db.db_routes.balance.balance import bp as balance_bp

    app.register_blueprint(portfolioData_bp, url_prefix="/api")
    app.register_blueprint(loginHandler_bp, url_prefix="/api")
    app.register_blueprint(watchlist_bp, url_prefix="/api")
    app.register_blueprint(balance_bp, url_prefix="/api")


    from .routes.operations.order_management import bp as order_management_bp
    from .routes.pages.detailed_stock_view_page import bp as detailed_stock_view_page_bp
    from .routes.pages.explore_stocks_page import bp as explore_stocks_page_bp
    from .routes.pages.trade_history_page import bp as trade_history_page_bp
    from .routes.pages.home_page import bp as home_page_bp
    from .routes.pages.portfolio_analytics_page import bp as portfolio_analytics_bp
    app.register_blueprint(order_management_bp, url_prefix="/api")
    app.register_blueprint(detailed_stock_view_page_bp, url_prefix="/api")
    app.register_blueprint(explore_stocks_page_bp, url_prefix="/api")
    app.register_blueprint(trade_history_page_bp, url_prefix="/api")
    app.register_blueprint(home_page_bp, url_prefix="/api")
    app.register_blueprint(portfolio_analytics_bp, url_prefix="/api")

    # firebase admin
    cred = credentials.Certificate("firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app

