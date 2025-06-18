from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
from .auth import get_current_active_user, User
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from ai_models.sensor_fusion import SensorFusionEngine

router = APIRouter()

# Models
class SensorData(BaseModel):
    sensor_id: str
    sensor_type: str
    location: dict
    timestamp: datetime
    readings: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class SensorDataCreate(BaseModel):
    sensor_type: str
    location: dict
    readings: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class SensorResponse(BaseModel):
    id: str
    sensor_id: str
    sensor_type: str
    location: dict
    timestamp: datetime
    readings: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    anomaly_score: Optional[float] = None
    processed: bool

class SensorSummary(BaseModel):
    sensor_id: str
    sensor_type: str
    location: dict
    last_reading_time: datetime
    status: str
    anomaly_detected: bool

# Mock database
mock_sensors = [
    {
        "id": "reading-001",
        "sensor_id": "env-001",
        "sensor_type": "environmental",
        "location": {"lat": 40.7128, "lng": -74.0060, "country": "USA", "city": "New York"},
        "timestamp": datetime.now() - timedelta(hours=2),
        "readings": {
            "temperature": 22.5,
            "humidity": 65.3,
            "air_quality": 42,
            "pathogen_indicators": {
                "virus_a": 0.02,
                "virus_b": 0.01
            }
        },
        "metadata": {
            "device_model": "EnvSense Pro",
            "firmware_version": "2.1.3",
            "battery": 87
        },
        "anomaly_score": 0.12,
        "processed": True
    },
    {
        "id": "reading-002",
        "sensor_id": "hospital-001",
        "sensor_type": "hospital",
        "location": {"lat": 40.7305, "lng": -73.9925, "country": "USA", "city": "New York"},
        "timestamp": datetime.now() - timedelta(hours=3),
        "readings": {
            "respiratory_cases": 42,
            "fever_cases": 28,
            "confirmed_viral": 15,
            "icu_occupancy": 0.68
        },
        "metadata": {
            "hospital_id": "NYP-001",
            "department": "Emergency"
        },
        "anomaly_score": 0.35,
        "processed": True
    },
    {
        "id": "reading-003",
        "sensor_id": "wastewater-001",
        "sensor_type": "wastewater",
        "location": {"lat": 40.7089, "lng": -74.0012, "country": "USA", "city": "New York"},
        "timestamp": datetime.now() - timedelta(hours=6),
        "readings": {
            "viral_load": 0.15,
            "pathogen_types": ["SARS-CoV-2", "Influenza A"],
            "chemical_indicators": {
                "ph": 7.2,
                "nitrogen": 12.5
            }
        },
        "metadata": {
            "facility_id": "WW-NYC-05",
            "sample_method": "automated"
        },
        "anomaly_score": 0.28,
        "processed": True
    }
]

# Helper functions
def generate_reading_id():
    return f"reading-{random.randint(100, 999)}"

def detect_anomalies(sensor_data):
    """
    In a real implementation, this would use an anomaly detection model
    For now, return a random score
    """
    return round(random.uniform(0, 1), 2)

def get_sensor_id(sensor_type, location):
    """Generate or retrieve a sensor ID based on type and location"""
    # In a real implementation, this would check if a sensor already exists at this location
    # For now, generate a new ID
    sensor_prefix = sensor_type[:3]
    return f"{sensor_prefix}-{random.randint(100, 999)}"

# Initialize sensor fusion engine with default weights
fusion_engine = SensorFusionEngine()

# Routes
@router.post("/data", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def submit_sensor_data(data: SensorDataCreate, current_user: User = Depends(get_current_active_user)):
    """Submit new sensor data"""
    # Generate sensor ID if not provided
    sensor_id = get_sensor_id(data.sensor_type, data.location)
    
    # Create new sensor reading
    new_reading = {
        "id": generate_reading_id(),
        "sensor_id": sensor_id,
        "sensor_type": data.sensor_type,
        "location": data.location,
        "timestamp": datetime.now(),
        "readings": data.readings,
        "metadata": data.metadata,
        "anomaly_score": detect_anomalies(data.dict()),
        "processed": False  # Would be processed by background task in real implementation
    }
    
    # Add to database
    mock_sensors.append(new_reading)
    
    # In a real implementation, this would trigger a background task to process the data
    # For now, just mark it as processed
    new_reading["processed"] = True
    
    return new_reading

@router.get("/data", response_model=List[SensorResponse])
async def get_sensor_data(
    sensor_type: Optional[str] = None,
    location_country: Optional[str] = None,
    hours: int = Query(24, ge=1, le=168),  # Default to last 24 hours, max 7 days
    current_user: User = Depends(get_current_active_user)
):
    """Get sensor data, optionally filtered by type, location, and time range"""
    time_threshold = datetime.now() - timedelta(hours=hours)
    
    filtered_data = [s for s in mock_sensors if s["timestamp"] >= time_threshold]
    
    if sensor_type:
        filtered_data = [s for s in filtered_data if s["sensor_type"] == sensor_type]
    
    if location_country:
        filtered_data = [
            s for s in filtered_data 
            if "country" in s["location"] and s["location"]["country"] == location_country
        ]
    
    return filtered_data

@router.get("/summary", response_model=List[SensorSummary])
async def get_sensor_summary(current_user: User = Depends(get_current_active_user)):
    """Get a summary of all sensors and their status"""
    # Group by sensor_id and get the latest reading for each
    sensor_ids = set(s["sensor_id"] for s in mock_sensors)
    
    summaries = []
    for sensor_id in sensor_ids:
        # Get all readings for this sensor
        sensor_readings = [s for s in mock_sensors if s["sensor_id"] == sensor_id]
        
        # Sort by timestamp (newest first)
        sensor_readings.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Get the latest reading
        latest = sensor_readings[0]
        
        # Determine status
        time_diff = datetime.now() - latest["timestamp"]
        if time_diff < timedelta(hours=6):
            status = "active"
        elif time_diff < timedelta(hours=24):
            status = "idle"
        else:
            status = "offline"
        
        # Check if anomaly was detected
        anomaly_detected = latest.get("anomaly_score", 0) > 0.3
        
        summaries.append({
            "sensor_id": latest["sensor_id"],
            "sensor_type": latest["sensor_type"],
            "location": latest["location"],
            "last_reading_time": latest["timestamp"],
            "status": status,
            "anomaly_detected": anomaly_detected
        })
    
    return summaries

@router.get("/anomalies", response_model=List[SensorResponse])
async def get_anomalies(
    threshold: float = Query(0.3, ge=0, le=1),
    hours: int = Query(72, ge=1, le=168),  # Default to last 72 hours, max 7 days
    current_user: User = Depends(get_current_active_user)
):
    """Get sensor readings with anomaly scores above the threshold"""
    time_threshold = datetime.now() - timedelta(hours=hours)
    
    anomalies = [
        s for s in mock_sensors 
        if s["timestamp"] >= time_threshold and 
        s.get("anomaly_score", 0) >= threshold
    ]
    
    return anomalies

@router.get("/fusion", response_model=Dict[str, Any])
async def get_fused_sensor_data(
    sensor_type: Optional[str] = None,
    location_country: Optional[str] = None,
    hours: int = Query(24, ge=1, le=168),  # Default to last 24 hours, max 7 days
    current_user: User = Depends(get_current_active_user)
):
    """
    Get fused sensor data by applying sensor fusion on filtered sensor data.
    """
    time_threshold = datetime.now() - timedelta(hours=hours)
    
    filtered_data = [s for s in mock_sensors if s["timestamp"] >= time_threshold]
    
    if sensor_type:
        filtered_data = [s for s in filtered_data if s["sensor_type"] == sensor_type]
    
    if location_country:
        filtered_data = [
            s for s in filtered_data 
            if "country" in s["location"] and s["location"]["country"] == location_country
        ]
    
    fused_result = fusion_engine.fuse(filtered_data)
    
    return fused_result
