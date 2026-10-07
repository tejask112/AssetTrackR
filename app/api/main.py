from fastapi import FastAPI
from api.routes.health import health_router

app = FastAPI()
prefix = "/api"

app.include_router(health_router, prefix=prefix)