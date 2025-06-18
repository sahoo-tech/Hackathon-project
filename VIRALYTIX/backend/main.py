from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
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
    ]
    
    # Add production frontend URL if specified
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url)
    
    # For development/testing, allow Vercel pattern
    if os.getenv("ENVIRONMENT") == "development":
        origins.extend([
            "https://*.vercel.app",
            "https://*.netlify.app"
        ])
    
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
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
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "ai_models": "operational",
            "blockchain": "connected"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)