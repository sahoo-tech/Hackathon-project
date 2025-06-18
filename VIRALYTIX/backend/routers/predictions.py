from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import json
from .auth import get_current_active_user, User

router = APIRouter()

# Models
class PredictionRequest(BaseModel):
    virus_name: str
    mutation_id: Optional[str] = None
    location: dict
    population_density: Optional[float] = None
    environmental_factors: Optional[dict] = None
    timeframe_days: int = 30

class PredictionResult(BaseModel):
    id: str
    request: Dict[str, Any]  # Changed from PredictionRequest to Dict to avoid validation issues
    created_at: datetime
    results: List[dict]
    risk_score: float
    confidence: float
    model_version: str
    explanation: Optional[str] = None
    
    model_config = {
        'protected_namespaces': ()
    }

class GlobalHotspot(BaseModel):
    location: dict
    risk_score: float
    virus_names: List[str]
    population_at_risk: int
    environmental_factors: Optional[dict] = None
    prediction_confidence: float

# Mock database
mock_predictions = [
    {
        "id": "pred-001",
        "request": {
            "virus_name": "SARS-CoV-2",
            "mutation_id": "mut-001",
            "location": {"lat": 40.7128, "lng": -74.0060, "country": "USA", "city": "New York"},
            "timeframe_days": 30
        },
        "created_at": datetime.now() - timedelta(days=2),
        "results": [
            {
                "timepoint": 7,  # days from now
                "estimated_cases": 2500,
                "spread_radius_km": 15,
                "risk_score": 0.78
            },
            {
                "timepoint": 14,
                "estimated_cases": 5000,
                "spread_radius_km": 25,
                "risk_score": 0.82
            },
            {
                "timepoint": 30,
                "estimated_cases": 12000,
                "spread_radius_km": 50,
                "risk_score": 0.85
            }
        ],
        "risk_score": 0.82,
        "confidence": 0.75,
        "model_version": "outbreak-pred-v1.2",
        "explanation": "This prediction indicates high risk due to population density and the R0 value of the mutation."
    }
]

mock_global_hotspots = [
    {
        "location": {"lat": 40.7128, "lng": -74.0060, "country": "USA", "city": "New York"},
        "risk_score": 0.85,
        "virus_names": ["SARS-CoV-2", "H1N1"],
        "population_at_risk": 8500000,
        "environmental_factors": {"temperature": 15, "humidity": 65, "population_density": 10716},
        "prediction_confidence": 0.78
    },
    {
        "location": {"lat": 35.6762, "lng": 139.6503, "country": "Japan", "city": "Tokyo"},
        "risk_score": 0.72,
        "virus_names": ["H1N1"],
        "population_at_risk": 13960000,
        "environmental_factors": {"temperature": 18, "humidity": 70, "population_density": 6158},
        "prediction_confidence": 0.81
    },
    {
        "location": {"lat": 19.4326, "lng": -99.1332, "country": "Mexico", "city": "Mexico City"},
        "risk_score": 0.68,
        "virus_names": ["SARS-CoV-2", "Dengue"],
        "population_at_risk": 9209944,
        "environmental_factors": {"temperature": 25, "humidity": 45, "population_density": 5966},
        "prediction_confidence": 0.73
    },
    {
        "location": {"lat": 28.6139, "lng": 77.2090, "country": "India", "city": "New Delhi"},
        "risk_score": 0.79,
        "virus_names": ["SARS-CoV-2", "H1N1", "Dengue"],
        "population_at_risk": 16787941,
        "environmental_factors": {"temperature": 32, "humidity": 60, "population_density": 11320},
        "prediction_confidence": 0.69
    },
    {
        "location": {"lat": -23.5505, "lng": -46.6333, "country": "Brazil", "city": "São Paulo"},
        "risk_score": 0.76,
        "virus_names": ["SARS-CoV-2", "Dengue", "Zika"],
        "population_at_risk": 12325232,
        "environmental_factors": {"temperature": 27, "humidity": 80, "population_density": 7216},
        "prediction_confidence": 0.75
    }
]

# Helper functions
def generate_prediction_id():
    return f"pred-{random.randint(100, 999)}"

def run_prediction_model(request_data):
    """
    In a real implementation, this would call the AI prediction model
    For now, return mock prediction data
    """
    virus_name = request_data["virus_name"]
    location = request_data["location"]
    timeframe_days = request_data["timeframe_days"]
    
    # Generate prediction results for different timepoints
    timepoints = [7, 14, 30] if timeframe_days >= 30 else [7, 14] if timeframe_days >= 14 else [7]
    results = []
    
    base_risk = random.uniform(0.6, 0.9)
    
    for timepoint in timepoints:
        if timepoint <= timeframe_days:
            # Increase risk and cases over time
            time_factor = timepoint / 7  # Scale based on weeks
            risk_adjustment = random.uniform(-0.05, 0.1)
            
            results.append({
                "timepoint": timepoint,
                "estimated_cases": int(1000 * time_factor * random.uniform(0.8, 1.5)),
                "spread_radius_km": int(10 * time_factor * random.uniform(0.9, 1.3)),
                "risk_score": round(min(0.95, base_risk + (0.02 * time_factor) + risk_adjustment), 2)
            })
    
    # Overall risk is the maximum risk from any timepoint
    overall_risk = max([r["risk_score"] for r in results])
    
    return {
        "results": results,
        "risk_score": overall_risk,
        "confidence": round(random.uniform(0.65, 0.85), 2),
        "model_version": "outbreak-pred-v1.2",
        "explanation": generate_explanation(virus_name, overall_risk, location)
    }

def generate_explanation(virus_name, risk_score, location):
    """Generate a human-readable explanation of the prediction"""
    risk_level = "high" if risk_score > 0.75 else "moderate" if risk_score > 0.5 else "low"
    
    explanations = [
        f"This prediction indicates {risk_level} risk due to population density and the transmissibility of {virus_name}.",
        f"The {risk_level} risk score is influenced by local environmental conditions and population mobility patterns.",
        f"Based on historical data and current conditions, {virus_name} shows {risk_level} potential for spread in this region.",
        f"The model predicts {risk_level} risk based on mutation characteristics and local healthcare capacity."
    ]
    
    return random.choice(explanations)

# Routes
@router.post("/run", response_model=PredictionResult, status_code=status.HTTP_201_CREATED)
async def run_prediction(request: PredictionRequest, current_user: User = None):  # Removed Depends(get_current_active_user)
    """Run a prediction model for virus spread"""
    try:
        # Debug print
        print(f"Received prediction request: {request}")
        
        # Create prediction
        request_dict = request.model_dump()  # Updated from dict() to model_dump() for Pydantic v2
        print(f"Request dict: {request_dict}")
        
        prediction_results = run_prediction_model(request_dict)
        print(f"Prediction results: {prediction_results}")
        
        new_prediction = {
            "id": generate_prediction_id(),
            "request": request_dict,
            "created_at": datetime.now(),
            **prediction_results
        }
        
        # Add to database
        mock_predictions.append(new_prediction)
        
        return new_prediction
    except Exception as e:
        print(f"Error in run_prediction: {str(e)}")
        # Re-raise the exception to let FastAPI handle it
        raise

@router.get("/", response_model=List[PredictionResult])
async def get_predictions(
    virus_name: Optional[str] = None,
    location_country: Optional[str] = None,
    # For development, make authentication optional
    current_user: User = None  # Removed Depends(get_current_active_user)
):
    """Get all predictions, optionally filtered by virus name or country"""
    filtered_predictions = mock_predictions
    
    if virus_name:
        filtered_predictions = [p for p in filtered_predictions if p["request"]["virus_name"] == virus_name]
    
    if location_country:
        filtered_predictions = [
            p for p in filtered_predictions 
            if "country" in p["request"]["location"] and p["request"]["location"]["country"] == location_country
        ]
    
    return filtered_predictions

@router.get("/{prediction_id}", response_model=PredictionResult)
async def get_prediction(prediction_id: str, current_user: User = None):  # Removed Depends(get_current_active_user)
    """Get a specific prediction by ID"""
    for prediction in mock_predictions:
        if prediction["id"] == prediction_id:
            return prediction
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Prediction with ID {prediction_id} not found"
    )

@router.get("/global/hotspots", response_model=List[GlobalHotspot])
async def get_global_hotspots(
    min_risk: float = Query(0.5, ge=0, le=1),
    virus_name: Optional[str] = None,
    current_user: User = None  # Removed Depends(get_current_active_user)
):
    """Get global hotspots with high risk of outbreaks"""
    filtered_hotspots = [h for h in mock_global_hotspots if h["risk_score"] >= min_risk]
    
    if virus_name:
        filtered_hotspots = [h for h in filtered_hotspots if virus_name in h["virus_names"]]
    
    return filtered_hotspots