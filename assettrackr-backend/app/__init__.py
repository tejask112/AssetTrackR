import os, json
from flask import Flask, g
from flask_cors import CORS
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

from .services.database_manager import SessionLocal, init_db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    init_db()

    @app.before_request
    def create_session():
        g.db = SessionLocal()

    @app.teardown_request
    def remove_session(exc):
        if (exc):
            g.db.rollback()
        g.db.remove()
        SessionLocal.remove()

    from .routes.explore_stocks import bp as exploreStocks_bp
    from .routes.detailed_stock_view import bp as detailedStockView_bp
    from .routes.login_handler import bp as loginHandler_bp
    from .routes.database_access import bp as databaseAccess_bp

    app.register_blueprint(exploreStocks_bp, url_prefix="/api")
    app.register_blueprint(detailedStockView_bp, url_prefix="/api")
    app.register_blueprint(loginHandler_bp, url_prefix="/api")
    app.register_blueprint(databaseAccess_bp, url_prefix="/api")

    # firebase admin
    cred = credentials.Certificate("firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app

