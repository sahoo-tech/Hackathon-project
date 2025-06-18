from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from .auth import get_current_active_user, User

router = APIRouter()

class ExplanationItem(BaseModel):
    feature: str
    importance: float
    effect: str

@router.get("/risk-justification", response_model=List[ExplanationItem])
async def get_risk_justification(current_user: User = Depends(get_current_active_user)):
    """
    Return mock SHAP/LIME explanations for risk justification.
    In real implementation, this would call the explainability model.
    """
    try:
        explanations = [
            {"feature": "Temperature", "importance": 0.35, "effect": "Positive"},
            {"feature": "Humidity", "importance": 0.25, "effect": "Negative"},
            {"feature": "Population Density", "importance": 0.20, "effect": "Positive"},
            {"feature": "Vaccination Rate", "importance": 0.15, "effect": "Negative"},
            {"feature": "Mobility Index", "importance": 0.05, "effect": "Positive"},
        ]
        return explanations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
