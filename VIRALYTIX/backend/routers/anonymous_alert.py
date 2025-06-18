from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from .auth import get_current_active_user, User
import uuid

router = APIRouter()

class Location(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    use_current_location: bool = False

class AlertSubmission(BaseModel):
    alert_text: str
    alert_type: str
    location: Location
    symptoms: Optional[str] = None
    anonymous: bool = True
    contact_info: Optional[str] = None
    alert_language: str = "en-US"
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class TokenReward(BaseModel):
    token_amount: int
    token_symbol: str
    wallet_address: Optional[str] = None
    transaction_hash: Optional[str] = None

class AlertResponse(BaseModel):
    alert_id: str
    message: str
    token_reward: TokenReward

# Mock database for alerts
mock_alerts = []

@router.post("/submit", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def submit_alert(alert_submission: AlertSubmission):
    try:
        # Generate a unique ID for the alert
        alert_id = str(uuid.uuid4())
        
        # Create alert data
        alert_data = alert_submission.dict()
        alert_data["id"] = alert_id
        alert_data["status"] = "pending_review"
        alert_data["created_at"] = datetime.utcnow()
        
        # Add to database
        mock_alerts.append(alert_data)
        
        # Generate token reward
        token_reward = TokenReward(
            token_amount=5,  # Fixed reward amount
            token_symbol="VTX",  # Viralytix token symbol
            wallet_address=None,  # Would be set in a real implementation
            transaction_hash=None  # Would be set in a real implementation
        )
        
        # Return success response
        return AlertResponse(
            alert_id=alert_id,
            message="Alert submitted successfully. Thank you for your contribution!",
            token_reward=token_reward
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=List[Dict[str, Any]])
async def get_alerts(current_user: User = Depends(get_current_active_user)):
    """Get all alerts (only for authorized users)"""
    # In a real implementation, we would filter based on user role and permissions
    return mock_alerts

@router.get("/alerts/{alert_id}", response_model=Dict[str, Any])
async def get_alert(alert_id: str, current_user: User = Depends(get_current_active_user)):
    """Get a specific alert by ID (only for authorized users)"""
    for alert in mock_alerts:
        if alert["id"] == alert_id:
            return alert
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Alert with ID {alert_id} not found"
    )
