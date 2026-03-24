from fastapi import FastAPI
from routes import api, auth
from middleware.cors import add_cors_middleware
from services.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="AI-Powered Resume Analyzer",
    description="API for evaluating resumes against job descriptions",
    version="1.0.0"
)

add_cors_middleware(app)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(api.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
