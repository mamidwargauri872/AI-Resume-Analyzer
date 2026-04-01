import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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

# --- Monolithic Deployment Support: Serve React Frontend ---
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_path):
    print(f"DEBUG: Serving compiled frontend from {frontend_path}")
    
    # Ensure assets map correctly
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        
    @app.get("/{catchall:path}")
    async def serve_react_app(request: Request, catchall: str):
        # Let API endpoints pass through / 404 naturally
        if catchall.startswith("api/"):
            return None # Fast API will handle 404
            
        # Try serving a specific file first
        target_path = os.path.join(frontend_path, catchall)
        if os.path.isfile(target_path):
            return FileResponse(target_path)
            
        # Fallback to index.html for React Router
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
            
        return {"message": "Frontend not built yet. Run npm run build in /frontend"}
