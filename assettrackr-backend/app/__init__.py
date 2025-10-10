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

    from .routes.explore_stocks import bp as exploreStocks_bp
    from .routes.detailed_stock_view import bp as detailedStockView_bp
    from .routes.portfolio_data import bp as portfolioData_bp
    from .routes.login_handler import bp as loginHandler_bp
    from .db.db_routes.database_routes import bp as databaseAccess_bp
    from .db.db_routes.trades.trades import bp as trades_bp
    from .db.db_routes.watchlist import bp as watchlist_bp

    app.register_blueprint(exploreStocks_bp, url_prefix="/api")
    app.register_blueprint(detailedStockView_bp, url_prefix="/api")
    app.register_blueprint(portfolioData_bp, url_prefix="/api")
    app.register_blueprint(loginHandler_bp, url_prefix="/api")
    app.register_blueprint(databaseAccess_bp, url_prefix="/api")
    app.register_blueprint(trades_bp, url_prefix="/api")
    app.register_blueprint(watchlist_bp, url_prefix="/api")

    # firebase admin
    cred = credentials.Certificate("firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app

