import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)



    app.register_blueprint(market_bp)
    app.register_blueprint(stream_bp)

    @app.get("/api/health")
    def health():
        return {"ok": True}
    
    return app