import os, json
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    from .routes.explore_stocks import bp as exploreStocks_bp
    from .routes.detailed_stock_view import bp as detailedStockView_bp
    from .routes.login_handler import bp as loginHandler_bp

    app.register_blueprint(exploreStocks_bp, url_prefix="/api")
    app.register_blueprint(detailedStockView_bp, url_prefix="/api")
    app.register_blueprint(loginHandler_bp, url_prefix="/api")

    # firebase admin
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "firebase.json")
    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
    else:
        saJson = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if not saJson:
            raise RuntimeError("Unable to find Firebase credentials")
        cred = credentials.Certificate(json.loads(saJson))
    firebase_admin.initialize_app(cred)

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app
