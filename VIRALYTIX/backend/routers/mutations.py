from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
from .auth import get_current_active_user, User

router = APIRouter()

# Models
class Mutation(BaseModel):
    id: Optional[str] = None
    virus_name: str
    genome_sequence: str
    mutation_type: str
    location: dict
    date_detected: datetime
    risk_score: float
    reported_by: str
    verified: bool = False
    blockchain_hash: Optional[str] = None

class MutationCreate(BaseModel):
    virus_name: str
    genome_sequence: str
    mutation_type: str
    location: dict
    date_detected: Optional[datetime] = None
    reported_by: Optional[str] = None

class MutationResponse(BaseModel):
    id: str
    virus_name: str
    mutation_type: str
    location: dict
    date_detected: datetime
    risk_score: float
    verified: bool
    blockchain_hash: Optional[str] = None
    human_readable_explanation: Optional[str] = None

# Mock database
mock_mutations = [
    {
        "id": "mut-001",
        "virus_name": "SARS-CoV-2",
        "genome_sequence": "ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT",
        "mutation_type": "Spike protein",
        "location": {"lat": 40.7128, "lng": -74.0060, "country": "USA", "city": "New York"},
        "date_detected": datetime(2023, 1, 15),
        "risk_score": 0.75,
        "reported_by": "labuser",
        "verified": True,
        "blockchain_hash": "0x7b5d8c8d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
        "human_readable_explanation": "This mutation affects the spike protein binding domain, potentially increasing transmissibility by 30%."
    },
    {
        "id": "mut-002",
        "virus_name": "H1N1",
        "genome_sequence": "GGAAACAAATCGTGCAATCAAATAATAACTCGACAGAGCAGGTTGACACAATAATGGAAAAGAACGTT",
        "mutation_type": "Hemagglutinin",
        "location": {"lat": 35.6762, "lng": 139.6503, "country": "Japan", "city": "Tokyo"},
        "date_detected": datetime(2023, 2, 20),
        "risk_score": 0.62,
        "reported_by": "labuser",
        "verified": True,
        "blockchain_hash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
        "human_readable_explanation": "This H1N1 mutation shows changes in the hemagglutinin protein that may affect vaccine efficacy."
    }
]

# Helper functions
def generate_mutation_id():
    return f"mut-{random.randint(100, 999)}"

def calculate_risk_score(mutation_data):
    # In a real implementation, this would use the AI model
    # For now, return a random score between 0.1 and 0.9
    return round(random.uniform(0.1, 0.9), 2)

def get_human_readable_explanation(mutation_data):
    # In a real implementation, this would call the LLM service
    mutation_types = {
        "Spike protein": "This mutation affects the spike protein, which could impact how the virus binds to human cells.",
        "Hemagglutinin": "This mutation in the hemagglutinin protein may affect the virus's ability to attach to respiratory cells.",
        "Nucleocapsid": "This mutation in the nucleocapsid protein may affect viral replication efficiency.",
        "Envelope": "This mutation in the envelope protein could impact virus stability and infectivity."
    }
    
    base_explanation = mutation_types.get(
        mutation_data["mutation_type"], 
        "This mutation requires further analysis to determine its effects."
    )
    
    risk_level = "high" if mutation_data["risk_score"] > 0.7 else "moderate" if mutation_data["risk_score"] > 0.4 else "low"
    
    return f"{base_explanation} Initial risk assessment indicates {risk_level} concern level."

# Routes
@router.get("/", response_model=List[MutationResponse])
async def get_all_mutations(current_user: User = Depends(get_current_active_user)):
    """Get all mutations with basic information"""
    return [
        {
            "id": m["id"],
            "virus_name": m["virus_name"],
            "mutation_type": m["mutation_type"],
            "location": m["location"],
            "date_detected": m["date_detected"],
            "risk_score": m["risk_score"],
            "verified": m["verified"],
            "blockchain_hash": m["blockchain_hash"],
            "human_readable_explanation": m["human_readable_explanation"] if "human_readable_explanation" in m else None
        } 
        for m in mock_mutations
    ]

@router.get("/{mutation_id}", response_model=Mutation)
async def get_mutation(mutation_id: str, current_user: User = Depends(get_current_active_user)):
    """Get detailed information about a specific mutation"""
    for mutation in mock_mutations:
        if mutation["id"] == mutation_id:
            return mutation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Mutation with ID {mutation_id} not found"
    )

@router.post("/", response_model=MutationResponse, status_code=status.HTTP_201_CREATED)
async def create_mutation(mutation: MutationCreate, current_user: User = Depends(get_current_active_user)):
    """Create a new mutation record"""
    # Check if user has permission (lab or government)
    if current_user.role not in ["lab", "government"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lab or government users can create mutation records"
        )
    
    # Create new mutation
    new_mutation = {
        "id": generate_mutation_id(),
        "virus_name": mutation.virus_name,
        "genome_sequence": mutation.genome_sequence,
        "mutation_type": mutation.mutation_type,
        "location": mutation.location,
        "date_detected": mutation.date_detected or datetime.now(),
        "risk_score": calculate_risk_score(mutation.dict()),
        "reported_by": current_user.username,
        "verified": current_user.role == "government",  # Auto-verify if government user
        "blockchain_hash": None  # Would be set by blockchain service in real implementation
    }
    
    # Generate human-readable explanation
    new_mutation["human_readable_explanation"] = get_human_readable_explanation(new_mutation)
    
    # Add to database
    mock_mutations.append(new_mutation)
    
    # Return response
    return {
        "id": new_mutation["id"],
        "virus_name": new_mutation["virus_name"],
        "mutation_type": new_mutation["mutation_type"],
        "location": new_mutation["location"],
        "date_detected": new_mutation["date_detected"],
        "risk_score": new_mutation["risk_score"],
        "verified": new_mutation["verified"],
        "blockchain_hash": new_mutation["blockchain_hash"],
        "human_readable_explanation": new_mutation["human_readable_explanation"]
    }

@router.put("/{mutation_id}/verify", response_model=MutationResponse)
async def verify_mutation(mutation_id: str, current_user: User = Depends(get_current_active_user)):
    """Verify a mutation (government users only)"""
    # Check if user has permission
    if current_user.role != "government":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can verify mutations"
        )
    
    # Find and update mutation
    for mutation in mock_mutations:
        if mutation["id"] == mutation_id:
            mutation["verified"] = True
            # In a real implementation, this would also trigger blockchain logging
            mutation["blockchain_hash"] = f"0x{random.randint(10**30, 10**31):x}"
            
            return {
                "id": mutation["id"],
                "virus_name": mutation["virus_name"],
                "mutation_type": mutation["mutation_type"],
                "location": mutation["location"],
                "date_detected": mutation["date_detected"],
                "risk_score": mutation["risk_score"],
                "verified": mutation["verified"],
                "blockchain_hash": mutation["blockchain_hash"],
                "human_readable_explanation": mutation["human_readable_explanation"] if "human_readable_explanation" in mutation else None
            }
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Mutation with ID {mutation_id} not found"
    )