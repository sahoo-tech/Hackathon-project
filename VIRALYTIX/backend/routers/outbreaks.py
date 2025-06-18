from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
from .auth import get_current_active_user, User

router = APIRouter()

# Models
class Location(BaseModel):
    lat: float
    lng: float
    country: str
    city: Optional[str] = None
    region: Optional[str] = None

class OutbreakBase(BaseModel):
    virus_name: str
    mutation_id: Optional[str] = None
    location: Location
    severity: float  # 0-1 scale
    affected_population: int
    start_date: datetime
    status: str  # "active", "contained", "resolved"

class Outbreak(OutbreakBase):
    id: str
    reported_by: str
    last_updated: datetime
    predicted_spread: Optional[List[dict]] = None
    containment_score: Optional[float] = None
    blockchain_hash: Optional[str] = None

class OutbreakCreate(OutbreakBase):
    pass

class OutbreakResponse(Outbreak):
    pass

class OutbreakUpdate(BaseModel):
    severity: Optional[float] = None
    affected_population: Optional[int] = None
    status: Optional[str] = None
    containment_score: Optional[float] = None

# Mock database
mock_outbreaks = [
    {
        "id": "ob-001",
        "virus_name": "SARS-CoV-2",
        "mutation_id": "mut-001",
        "location": {
            "lat": 40.7128, 
            "lng": -74.0060, 
            "country": "USA", 
            "city": "New York"
        },
        "severity": 0.8,
        "affected_population": 5000,
        "start_date": datetime.now() - timedelta(days=30),
        "status": "active",
        "reported_by": "govuser",
        "last_updated": datetime.now() - timedelta(days=2),
        "predicted_spread": [
            {
                "location": {"lat": 40.6, "lng": -73.9, "country": "USA", "city": "Brooklyn"},
                "probability": 0.85,
                "estimated_cases": 2000,
                "timeframe_days": 7
            },
            {
                "location": {"lat": 40.8, "lng": -73.9, "country": "USA", "city": "Bronx"},
                "probability": 0.75,
                "estimated_cases": 1500,
                "timeframe_days": 7
            }
        ],
        "containment_score": 0.65,
        "blockchain_hash": "0x3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
    },
    {
        "id": "ob-002",
        "virus_name": "H1N1",
        "mutation_id": "mut-002",
        "location": {
            "lat": 35.6762, 
            "lng": 139.6503, 
            "country": "Japan", 
            "city": "Tokyo"
        },
        "severity": 0.6,
        "affected_population": 3000,
        "start_date": datetime.now() - timedelta(days=45),
        "status": "contained",
        "reported_by": "govuser",
        "last_updated": datetime.now() - timedelta(days=5),
        "predicted_spread": [
            {
                "location": {"lat": 35.4, "lng": 139.5, "country": "Japan", "city": "Yokohama"},
                "probability": 0.55,
                "estimated_cases": 800,
                "timeframe_days": 14
            }
        ],
        "containment_score": 0.82,
        "blockchain_hash": "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b"
    }
]

# Helper functions
def generate_outbreak_id():
    return f"ob-{random.randint(100, 999)}"

def predict_spread(outbreak_data):
    # In a real implementation, this would use the AI prediction model
    # For now, return mock data
    virus_name = outbreak_data["virus_name"]
    location = outbreak_data["location"]
    
    # Generate 1-3 spread predictions
    num_predictions = random.randint(1, 3)
    predictions = []
    
    for _ in range(num_predictions):
        # Generate a nearby location (simple offset for demo)
        lat_offset = random.uniform(-0.3, 0.3)
        lng_offset = random.uniform(-0.3, 0.3)
        
        predictions.append({
            "location": {
                "lat": location["lat"] + lat_offset,
                "lng": location["lng"] + lng_offset,
                "country": location["country"],
                "city": f"Nearby City {_+1}"  # Placeholder
            },
            "probability": round(random.uniform(0.4, 0.9), 2),
            "estimated_cases": random.randint(500, 3000),
            "timeframe_days": random.choice([7, 14, 30])
        })
    
    return predictions

# Routes
@router.get("/", response_model=List[OutbreakResponse])
async def get_all_outbreaks(current_user: User = Depends(get_current_active_user)):
    """Get all outbreaks"""
    return mock_outbreaks

@router.get("/{outbreak_id}", response_model=OutbreakResponse)
async def get_outbreak(outbreak_id: str, current_user: User = Depends(get_current_active_user)):
    """Get detailed information about a specific outbreak"""
    for outbreak in mock_outbreaks:
        if outbreak["id"] == outbreak_id:
            return outbreak
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Outbreak with ID {outbreak_id} not found"
    )

@router.post("/", response_model=OutbreakResponse, status_code=status.HTTP_201_CREATED)
async def create_outbreak(outbreak: OutbreakCreate, current_user: User = Depends(get_current_active_user)):
    """Create a new outbreak record (government users only)"""
    # Check if user has permission
    if current_user.role != "government":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can create outbreak records"
        )
    
    # Create new outbreak
    outbreak_dict = outbreak.dict()
    new_outbreak = {
        "id": generate_outbreak_id(),
        **outbreak_dict,
        "reported_by": current_user.username,
        "last_updated": datetime.now(),
        "blockchain_hash": None  # Would be set by blockchain service in real implementation
    }
    
    # Generate predicted spread
    new_outbreak["predicted_spread"] = predict_spread(new_outbreak)
    
    # Calculate containment score
    new_outbreak["containment_score"] = round(random.uniform(0.3, 0.9), 2)
    
    # Add to database
    mock_outbreaks.append(new_outbreak)
    
    return new_outbreak

@router.put("/{outbreak_id}", response_model=OutbreakResponse)
async def update_outbreak(
    outbreak_id: str, 
    update_data: OutbreakUpdate, 
    current_user: User = Depends(get_current_active_user)
):
    """Update an outbreak record (government users only)"""
    # Check if user has permission
    if current_user.role != "government":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can update outbreak records"
        )
    
    # Find and update outbreak
    for outbreak in mock_outbreaks:
        if outbreak["id"] == outbreak_id:
            # Update fields if provided
            update_dict = update_data.dict(exclude_unset=True)
            for key, value in update_dict.items():
                outbreak[key] = value
            
            # Update last_updated timestamp
            outbreak["last_updated"] = datetime.now()
            
            # In a real implementation, this would also trigger blockchain logging
            outbreak["blockchain_hash"] = f"0x{random.randint(10**30, 10**31):x}"
            
            # If status changed to "contained" or "resolved", update containment score
            if "status" in update_dict and update_dict["status"] in ["contained", "resolved"]:
                outbreak["containment_score"] = round(random.uniform(0.7, 0.95), 2)
            
            return outbreak
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Outbreak with ID {outbreak_id} not found"
    )

@router.get("/{outbreak_id}/predictions", response_model=List[dict])
async def get_outbreak_predictions(outbreak_id: str, current_user: User = Depends(get_current_active_user)):
    """Get predicted spread for a specific outbreak"""
    for outbreak in mock_outbreaks:
        if outbreak["id"] == outbreak_id:
            return outbreak.get("predicted_spread", [])
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Outbreak with ID {outbreak_id} not found"
    )