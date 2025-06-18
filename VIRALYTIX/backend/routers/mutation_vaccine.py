from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .auth import get_current_active_user, User
import torch
from ai_models.mutation_to_vaccine import MutationToVaccineBlueprint

router = APIRouter()

class MutationFeaturesRequest(BaseModel):
    features: List[float]

class MRNAConfigResponse(BaseModel):
    config: List[float]
    generated_at: datetime

model = MutationToVaccineBlueprint()

@router.post("/predict", response_model=MRNAConfigResponse)
async def predict_mrna_config(request: MutationFeaturesRequest, current_user: User = Depends(get_current_active_user)):
    try:
        features_tensor = torch.tensor([request.features], dtype=torch.float32)
        output = model.predict_mrna_config(features_tensor)
        config = output.squeeze().tolist()
        return MRNAConfigResponse(config=config, generated_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
