from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import your routers
from VIRALYTIX.backend.routers.auth import router as auth
from VIRALYTIX.backend.routers.mutations import router as mutations
# ... import other routers

app = FastAPI(
    title="VIRALYTIX API",
    description="Backend API for the VIRALYTIX platform",
    version="0.1.0"
)

# Configure CORS for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be more specific in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth, prefix="/api/auth", tags=["Authentication"])
app.include_router(mutations, prefix="/api/mutations", tags=["Mutations"])
# ... include other routers

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "platform": "vercel"}

# Export for Vercel
handler = app