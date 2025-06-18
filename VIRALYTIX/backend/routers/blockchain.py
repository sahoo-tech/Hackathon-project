from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
from .auth import get_current_active_user, User

router = APIRouter()

# Models
class BlockchainRecord(BaseModel):
    id: str
    record_type: str  # "mutation", "outbreak", "verification", "dao_vote"
    data_hash: str
    timestamp: datetime
    transaction_hash: str
    block_number: int
    verified: bool
    metadata: Optional[Dict[str, Any]] = None

class BlockchainRecordCreate(BaseModel):
    record_type: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class DAOProposal(BaseModel):
    id: str
    title: str
    description: str
    proposer: str
    created_at: datetime
    expires_at: datetime
    status: str  # "active", "passed", "rejected", "executed"
    votes_for: int
    votes_against: int
    votes_abstain: int
    transaction_hash: Optional[str] = None
    execution_hash: Optional[str] = None

class DAOProposalCreate(BaseModel):
    title: str
    description: str
    expires_in_days: int = 7

class DAOVote(BaseModel):
    proposal_id: str
    vote: str  # "for", "against", "abstain"

# Mock database
mock_blockchain_records = [
    {
        "id": "record-001",
        "record_type": "mutation",
        "data_hash": "0x7b5d8c8d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
        "timestamp": datetime.now() - timedelta(days=5),
        "transaction_hash": "0x3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        "block_number": 12345678,
        "verified": True,
        "metadata": {
            "mutation_id": "mut-001",
            "virus_name": "SARS-CoV-2",
            "verified_by": "govuser"
        }
    },
    {
        "id": "record-002",
        "record_type": "outbreak",
        "data_hash": "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        "timestamp": datetime.now() - timedelta(days=3),
        "transaction_hash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        "block_number": 12345982,
        "verified": True,
        "metadata": {
            "outbreak_id": "ob-001",
            "virus_name": "SARS-CoV-2",
            "location": "New York, USA"
        }
    }
]

mock_dao_proposals = [
    {
        "id": "prop-001",
        "title": "Add H1N1 to priority monitoring list",
        "description": "This proposal suggests adding H1N1 to the priority monitoring list due to recent mutations and increased spread.",
        "proposer": "labuser",
        "created_at": datetime.now() - timedelta(days=5),
        "expires_at": datetime.now() + timedelta(days=2),
        "status": "active",
        "votes_for": 12,
        "votes_against": 3,
        "votes_abstain": 1,
        "transaction_hash": "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b",
        "execution_hash": None
    },
    {
        "id": "prop-002",
        "title": "Increase sensor deployment in Southeast Asia",
        "description": "This proposal recommends increasing environmental sensor deployment in Southeast Asia to improve early detection capabilities.",
        "proposer": "govuser",
        "created_at": datetime.now() - timedelta(days=10),
        "expires_at": datetime.now() - timedelta(days=3),
        "status": "passed",
        "votes_for": 18,
        "votes_against": 2,
        "votes_abstain": 0,
        "transaction_hash": "0x2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e",
        "execution_hash": "0x0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a"
    }
]

# Helper functions
def generate_record_id():
    return f"record-{random.randint(100, 999)}"

def generate_proposal_id():
    return f"prop-{random.randint(100, 999)}"

def generate_hash():
    """Generate a mock blockchain hash"""
    return f"0x{''.join(random.choices('0123456789abcdef', k=64))}"

def compute_data_hash(data):
    """
    In a real implementation, this would compute a cryptographic hash of the data
    For now, return a mock hash
    """
    return generate_hash()

# Routes
@router.post("/record", response_model=BlockchainRecord, status_code=status.HTTP_201_CREATED)
async def create_blockchain_record(record: BlockchainRecordCreate, current_user: User = Depends(get_current_active_user)):
    """Create a new blockchain record"""
    # Check if user has permission
    if current_user.role not in ["lab", "government"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lab or government users can create blockchain records"
        )
    
    # Compute data hash
    data_hash = compute_data_hash(record.data)
    
    # Create new record
    new_record = {
        "id": generate_record_id(),
        "record_type": record.record_type,
        "data_hash": data_hash,
        "timestamp": datetime.now(),
        "transaction_hash": generate_hash(),
        "block_number": random.randint(12000000, 13000000),
        "verified": current_user.role == "government",
        "metadata": record.metadata
    }
    
    # Add to database
    mock_blockchain_records.append(new_record)
    
    return new_record

@router.get("/records", response_model=List[BlockchainRecord])
async def get_blockchain_records(
    record_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get blockchain records, optionally filtered by type"""
    filtered_records = mock_blockchain_records
    
    if record_type:
        filtered_records = [r for r in filtered_records if r["record_type"] == record_type]
    
    return filtered_records

@router.get("/records/{record_id}", response_model=BlockchainRecord)
async def get_blockchain_record(record_id: str, current_user: User = Depends(get_current_active_user)):
    """Get a specific blockchain record by ID"""
    for record in mock_blockchain_records:
        if record["id"] == record_id:
            return record
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Blockchain record with ID {record_id} not found"
    )

@router.post("/dao/proposals", response_model=DAOProposal, status_code=status.HTTP_201_CREATED)
async def create_dao_proposal(proposal: DAOProposalCreate, current_user: User = Depends(get_current_active_user)):
    """Create a new DAO proposal"""
    # Create new proposal
    new_proposal = {
        "id": generate_proposal_id(),
        "title": proposal.title,
        "description": proposal.description,
        "proposer": current_user.username,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=proposal.expires_in_days),
        "status": "active",
        "votes_for": 0,
        "votes_against": 0,
        "votes_abstain": 0,
        "transaction_hash": generate_hash(),
        "execution_hash": None
    }
    
    # Add to database
    mock_dao_proposals.append(new_proposal)
    
    return new_proposal

# Public endpoint for demo purposes
@router.post("/dao/proposals/public", response_model=DAOProposal, status_code=status.HTTP_201_CREATED)
async def create_dao_proposal_public(proposal: DAOProposalCreate):
    """Create a new DAO proposal without authentication (for demo purposes)"""
    # Create new proposal
    new_proposal = {
        "id": generate_proposal_id(),
        "title": proposal.title,
        "description": proposal.description,
        "proposer": "demo_user",  # Default user for demo
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=proposal.expires_in_days),
        "status": "active",
        "votes_for": 0,
        "votes_against": 0,
        "votes_abstain": 0,
        "transaction_hash": generate_hash(),
        "execution_hash": None
    }
    
    # Add to database
    mock_dao_proposals.append(new_proposal)
    
    return new_proposal

@router.get("/dao/proposals", response_model=List[DAOProposal])
async def get_dao_proposals(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get DAO proposals, optionally filtered by status"""
    filtered_proposals = mock_dao_proposals
    
    if status:
        filtered_proposals = [p for p in filtered_proposals if p["status"] == status]
    
    return filtered_proposals

# Public endpoint for demo purposes
@router.get("/dao/proposals/public", response_model=List[DAOProposal])
async def get_dao_proposals_public(status: Optional[str] = None):
    """Get DAO proposals without authentication (for demo purposes)"""
    filtered_proposals = mock_dao_proposals
    
    if status:
        filtered_proposals = [p for p in filtered_proposals if p["status"] == status]
    
    return filtered_proposals

@router.post("/dao/vote", response_model=DAOProposal)
async def vote_on_proposal(vote: DAOVote, current_user: User = Depends(get_current_active_user)):
    """Vote on a DAO proposal"""
    # Find the proposal
    for proposal in mock_dao_proposals:
        if proposal["id"] == vote.proposal_id:
            # Check if proposal is active
            if proposal["status"] != "active":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Proposal is not active (current status: {proposal['status']})"
                )
            
            # Check if proposal has expired
            if proposal["expires_at"] < datetime.now():
                proposal["status"] = "rejected" if proposal["votes_for"] <= proposal["votes_against"] else "passed"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Proposal has expired and is now {proposal['status']}"
                )
            
            # Record the vote
            if vote.vote == "for":
                proposal["votes_for"] += 1
            elif vote.vote == "against":
                proposal["votes_against"] += 1
            elif vote.vote == "abstain":
                proposal["votes_abstain"] += 1
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid vote type: {vote.vote}. Must be 'for', 'against', or 'abstain'."
                )
            
            return proposal
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Proposal with ID {vote.proposal_id} not found"
    )

# Public endpoint for demo purposes
@router.post("/dao/vote/public", response_model=DAOProposal)
async def vote_on_proposal_public(vote: DAOVote):
    """Vote on a DAO proposal without authentication (for demo purposes)"""
    # Find the proposal
    for proposal in mock_dao_proposals:
        if proposal["id"] == vote.proposal_id:
            # Check if proposal is active
            if proposal["status"] != "active":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Proposal is not active (current status: {proposal['status']})"
                )
            
            # Check if proposal has expired
            if proposal["expires_at"] < datetime.now():
                proposal["status"] = "rejected" if proposal["votes_for"] <= proposal["votes_against"] else "passed"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Proposal has expired and is now {proposal['status']}"
                )
            
            # Record the vote
            if vote.vote == "for":
                proposal["votes_for"] += 1
            elif vote.vote == "against":
                proposal["votes_against"] += 1
            elif vote.vote == "abstain":
                proposal["votes_abstain"] += 1
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid vote type: {vote.vote}. Must be 'for', 'against', or 'abstain'."
                )
            
            return proposal
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Proposal with ID {vote.proposal_id} not found"
    )