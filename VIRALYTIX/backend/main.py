from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import traceback
from datetime import datetime
from dotenv import load_dotenv

# Import routers
from routers.auth import router as auth
from routers.mutations import router as mutations
from routers.outbreaks import router as outbreaks
from routers.predictions import router as predictions
from routers.sensors import router as sensors
from routers.blockchain import router as blockchain
from routers.llm import router as llm
from routers.simulation import router as simulation
from routers.mutation_vaccine import router as mutation_vaccine
from routers.explainability import router as explainability
from routers.anonymous_alert import router as anonymous_alert

# Load environment variables
load_dotenv()

app = FastAPI(
    title="VIRALYTIX API",
    description="Backend API for the VIRALYTIX platform",
    version="0.1.0"
)

# Configure CORS
def get_cors_origins():
    origins = [
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000",  # Local development alternative
    ]
    
    # Add production frontend URL if specified
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url.rstrip('/'))
    
    # Add specific deployment URLs
    origins.extend([
        "https://hackathon-project-egq7.vercel.app",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.render.com"  # Allow other Render services
    ])
    
    return origins

# More permissive CORS for production deployment
cors_origins = get_cors_origins()
if os.getenv("ENVIRONMENT") == "production":
    cors_origins = ["*"]  # Allow all origins in production for now

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False if os.getenv("ENVIRONMENT") == "production" else True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if os.getenv("ENVIRONMENT") == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(exc),
                "traceback": traceback.format_exc()
            }
        )

# Include routers
app.include_router(auth, prefix="/api/auth", tags=["Authentication"])
app.include_router(mutations, prefix="/api/mutations", tags=["Mutations"])
app.include_router(outbreaks, prefix="/api/outbreaks", tags=["Outbreaks"])
app.include_router(predictions, prefix="/api/predictions", tags=["Predictions"])
app.include_router(sensors, prefix="/api/sensors", tags=["Sensors"])
app.include_router(blockchain, prefix="/api/blockchain", tags=["Blockchain"])
app.include_router(llm, prefix="/api/llm", tags=["LLM"])
app.include_router(simulation, prefix="/api/simulation", tags=["Simulation"])
app.include_router(mutation_vaccine, prefix="/api/mutation-vaccine", tags=["Mutation Vaccine"])
app.include_router(explainability, prefix="/api/explainability", tags=["Explainability"])
app.include_router(anonymous_alert, prefix="/api/anonymous-alert", tags=["Anonymous Alert"])

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint to verify API is running"""
    return {
        "message": "Welcome to VIRALYTIX API",
        "status": "operational",
        "version": "0.1.0"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "services": {
            "api": "operational",
            "auth": "operational"
        }
    }
    
    # Check database connection if configured
    database_url = os.getenv("DATABASE_URL") or os.getenv("MONGODB_URL")
    if database_url:
        try:
            # Add actual database check here
            health_status["services"]["database"] = "connected"
        except Exception:
            health_status["services"]["database"] = "disconnected"
            health_status["status"] = "degraded"
    else:
        health_status["services"]["database"] = "not_configured"
    
    # Check Redis connection if configured
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            # Add actual Redis check here
            health_status["services"]["redis"] = "connected"
        except Exception:
            health_status["services"]["redis"] = "disconnected"
            health_status["status"] = "degraded"
    else:
        health_status["services"]["redis"] = "not_configured"
    
    return health_status

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("ENVIRONMENT") != "production"
    uvicorn.run("main:app", host=host, port=port, reload=reload)