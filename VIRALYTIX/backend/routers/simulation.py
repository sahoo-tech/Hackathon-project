from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import json
import logging
from .auth import get_current_active_user, User
from ai_models.simulation import BioDigitalTwin, GovernmentDecisionSimulator

logger = logging.getLogger(__name__)

router = APIRouter()

# Models
class SimulationRequest(BaseModel):
    city_name: str
    population: int
    virus_name: str
    mutation_id: Optional[str] = None
    initial_cases: int
    r_value: float
    intervention_measures: List[Dict[str, Any]]
    simulation_days: int = 90
    healthcare_capacity: Optional[Dict[str, Any]] = None

class SimulationResult(BaseModel):
    id: str
    request: SimulationRequest
    created_at: datetime
    results: List[Dict[str, Any]]
    summary: Dict[str, Any]
    model_version: str
    
    model_config = {
        'protected_namespaces': ()
    }

class PolicySimulationRequest(BaseModel):
    region: str
    population: int
    current_cases: int
    virus_properties: Dict[str, Any]
    available_policies: List[str]
    economic_factors: Optional[Dict[str, Any]] = None
    social_factors: Optional[Dict[str, Any]] = None
    simulation_days: int = 180

class PolicySimulationResult(BaseModel):
    id: str
    request: PolicySimulationRequest
    created_at: datetime
    policy_outcomes: List[Dict[str, Any]]
    optimal_strategy: Dict[str, Any]
    model_version: str
    
    model_config = {
        'protected_namespaces': ()
    }

# Mock database
mock_simulations = []
mock_policy_simulations = []

# Helper functions
def generate_simulation_id():
    return f"sim-{random.randint(1000, 9999)}"

def generate_policy_simulation_id():
    return f"pol-{random.randint(1000, 9999)}"

def run_city_simulation(request_data):
    """
    In a real implementation, this would run a complex epidemiological model
    For now, generate mock simulation data
    """
    population = request_data["population"]
    initial_cases = request_data["initial_cases"]
    r_value = request_data["r_value"]
    simulation_days = request_data["simulation_days"]
    intervention_measures = request_data["intervention_measures"]
    
    # Set up healthcare capacity
    healthcare_capacity = request_data.get("healthcare_capacity", {})
    hospital_beds = healthcare_capacity.get("hospital_beds", int(population * 0.002))  # 0.2% of population
    icu_beds = healthcare_capacity.get("icu_beds", int(hospital_beds * 0.15))  # 15% of hospital beds
    ventilators = healthcare_capacity.get("ventilators", int(icu_beds * 0.8))  # 80% of ICU beds
    
    # Initialize results
    results = []
    current_cases = initial_cases
    current_active = initial_cases
    total_recovered = 0
    total_deaths = 0
    
    # Apply interventions to modify R value
    effective_r = r_value
    for intervention in intervention_measures:
        if "start_day" in intervention and intervention["start_day"] == 0:
            effective_r *= (1 - intervention.get("effectiveness", 0))
    
    # Run simulation for each day
    for day in range(1, simulation_days + 1):
        # Check if any interventions start or end on this day
        for intervention in intervention_measures:
            if "start_day" in intervention and intervention["start_day"] == day:
                effective_r *= (1 - intervention.get("effectiveness", 0))
            elif "end_day" in intervention and intervention["end_day"] == day:
                # Remove the intervention effect
                effective_r /= (1 - intervention.get("effectiveness", 0))
        
        # Calculate new cases
        new_cases = int(current_active * effective_r * random.uniform(0.9, 1.1))
        
        # Limit new cases by remaining susceptible population
        susceptible = population - (current_active + total_recovered + total_deaths)
        new_cases = min(new_cases, int(susceptible * 0.05))  # Max 5% of susceptible per day
        
        # Calculate recoveries and deaths
        new_recoveries = int(current_active * 0.1)  # 10% recover each day
        
        # Death rate increases if healthcare capacity is exceeded
        hospitalization_rate = 0.15  # 15% of active cases need hospitalization
        icu_rate = 0.05  # 5% of active cases need ICU
        ventilator_rate = 0.02  # 2% of active cases need ventilators
        
        hospitalized = current_active * hospitalization_rate
        icu_needed = current_active * icu_rate
        ventilators_needed = current_active * ventilator_rate
        
        base_death_rate = 0.02  # 2% base death rate
        hospital_overflow = max(0, hospitalized - hospital_beds) / max(1, hospitalized)
        icu_overflow = max(0, icu_needed - icu_beds) / max(1, icu_needed)
        ventilator_overflow = max(0, ventilators_needed - ventilators) / max(1, ventilators_needed)
        
        # Increase death rate based on healthcare system strain
        adjusted_death_rate = base_death_rate * (1 + hospital_overflow + 2*icu_overflow + 3*ventilator_overflow)
        adjusted_death_rate = min(adjusted_death_rate, 0.15)  # Cap at 15%
        
        new_deaths = int(current_active * adjusted_death_rate)
        
        # Update counters
        current_active = current_active + new_cases - new_recoveries - new_deaths
        total_recovered += new_recoveries
        total_deaths += new_deaths
        
        # Record results for this day
        results.append({
            "day": day,
            "new_cases": new_cases,
            "active_cases": current_active,
            "recovered": total_recovered,
            "deaths": total_deaths,
            "effective_r": effective_r,
            "hospital_occupancy": min(1.0, hospitalized / hospital_beds) if hospital_beds > 0 else 1.0,
            "icu_occupancy": min(1.0, icu_needed / icu_beds) if icu_beds > 0 else 1.0,
            "ventilator_occupancy": min(1.0, ventilators_needed / ventilators) if ventilators > 0 else 1.0
        })
    
    # Generate summary
    peak_active = max([day["active_cases"] for day in results])
    peak_day = next(i for i, day in enumerate(results) if day["active_cases"] == peak_active) + 1
    
    summary = {
        "total_cases": initial_cases + sum([day["new_cases"] for day in results]),
        "total_recovered": total_recovered,
        "total_deaths": total_deaths,
        "peak_active_cases": peak_active,
        "peak_day": peak_day,
        "final_active_cases": results[-1]["active_cases"],
        "healthcare_overwhelmed": any([
            day["hospital_occupancy"] > 1.0 or 
            day["icu_occupancy"] > 1.0 or 
            day["ventilator_occupancy"] > 1.0 
            for day in results
        ]),
        "outbreak_contained": results[-1]["new_cases"] < results[0]["new_cases"] * 0.1
    }
    
    return {
        "results": results,
        "summary": summary,
        "model_version": "city-twin-v1.3"
    }

def run_policy_simulation(request_data):
    """
    In a real implementation, this would run a complex policy impact model
    For now, generate mock policy simulation data
    """
    region = request_data["region"]
    population = request_data["population"]
    current_cases = request_data["current_cases"]
    virus_properties = request_data["virus_properties"]
    available_policies = request_data["available_policies"]
    simulation_days = request_data["simulation_days"]
    
    # Get virus properties
    r_value = virus_properties.get("r_value", 2.5)
    severity = virus_properties.get("severity", 0.7)
    
    # Define policy effects
    policy_effects = {
        "lockdown": {
            "r_reduction": 0.7,
            "economic_impact": -0.3,
            "social_impact": -0.4,
            "compliance_decay": 0.003  # compliance reduces by 0.3% per day
        },
        "mask_mandate": {
            "r_reduction": 0.2,
            "economic_impact": -0.05,
            "social_impact": -0.1,
            "compliance_decay": 0.001
        },
        "social_distancing": {
            "r_reduction": 0.4,
            "economic_impact": -0.15,
            "social_impact": -0.2,
            "compliance_decay": 0.002
        },
        "business_restrictions": {
            "r_reduction": 0.3,
            "economic_impact": -0.25,
            "social_impact": -0.15,
            "compliance_decay": 0.002
        },
        "school_closures": {
            "r_reduction": 0.25,
            "economic_impact": -0.2,
            "social_impact": -0.3,
            "compliance_decay": 0.0015
        },
        "travel_restrictions": {
            "r_reduction": 0.15,
            "economic_impact": -0.2,
            "social_impact": -0.1,
            "compliance_decay": 0.001
        },
        "vaccination_campaign": {
            "r_reduction": 0.01,  # increases over time
            "economic_impact": 0.05,
            "social_impact": 0.1,
            "compliance_decay": -0.001  # improves over time
        },
        "testing_and_tracing": {
            "r_reduction": 0.2,
            "economic_impact": -0.05,
            "social_impact": 0.0,
            "compliance_decay": 0.0005
        },
        "public_education": {
            "r_reduction": 0.1,
            "economic_impact": 0.0,
            "social_impact": 0.05,
            "compliance_decay": -0.0005  # improves over time
        }
    }
    
    # Filter to only include available policies
    available_policy_effects = {
        policy: effects for policy, effects in policy_effects.items() 
        if policy in available_policies
    }
    
    # Generate outcomes for each policy combination
    policy_outcomes = []
    
    # Start with individual policies
    for policy, effects in available_policy_effects.items():
        # Simulate this policy
        outcome = simulate_policy_outcome(
            policy=[policy],
            effects=[effects],
            population=population,
            current_cases=current_cases,
            r_value=r_value,
            severity=severity,
            days=simulation_days
        )
        policy_outcomes.append(outcome)
    
    # Add some combinations (up to 3 policies)
    if len(available_policy_effects) >= 2:
        # Try some random combinations
        for _ in range(min(5, len(available_policy_effects))):
            num_policies = random.randint(2, min(3, len(available_policy_effects)))
            selected_policies = random.sample(list(available_policy_effects.keys()), num_policies)
            selected_effects = [available_policy_effects[p] for p in selected_policies]
            
            outcome = simulate_policy_outcome(
                policy=selected_policies,
                effects=selected_effects,
                population=population,
                current_cases=current_cases,
                r_value=r_value,
                severity=severity,
                days=simulation_days
            )
            policy_outcomes.append(outcome)
    
    # Find optimal strategy based on balanced score
    for outcome in policy_outcomes:
        # Calculate balanced score (health + economic + social)
        health_score = 1.0 - (outcome["health_impact"] / max(1, max([o["health_impact"] for o in policy_outcomes])))
        economic_score = 1.0 - (abs(outcome["economic_impact"]) / max(0.01, max([abs(o["economic_impact"]) for o in policy_outcomes])))
        social_score = 1.0 - (abs(outcome["social_impact"]) / max(0.01, max([abs(o["social_impact"]) for o in policy_outcomes])))
        
        # Weighted score (health is prioritized)
        outcome["balanced_score"] = (health_score * 0.5) + (economic_score * 0.3) + (social_score * 0.2)
    
    # Sort by balanced score
    policy_outcomes.sort(key=lambda x: x["balanced_score"], reverse=True)
    
    # Get optimal strategy
    optimal_strategy = {
        "policies": policy_outcomes[0]["policies"],
        "balanced_score": policy_outcomes[0]["balanced_score"],
        "health_impact": policy_outcomes[0]["health_impact"],
        "economic_impact": policy_outcomes[0]["economic_impact"],
        "social_impact": policy_outcomes[0]["social_impact"],
        "implementation_plan": generate_implementation_plan(policy_outcomes[0]["policies"])
    }
    
    return {
        "policy_outcomes": policy_outcomes,
        "optimal_strategy": optimal_strategy,
        "model_version": "policy-sim-v1.1"
    }

def simulate_policy_outcome(policy, effects, population, current_cases, r_value, severity, days):
    """Simulate the outcome of a specific policy or combination of policies"""
    # Calculate combined effect
    combined_r_reduction = sum([e["r_reduction"] for e in effects])
    combined_economic_impact = sum([e["economic_impact"] for e in effects])
    combined_social_impact = sum([e["social_impact"] for e in effects])
    
    # Cap r_reduction at 0.9 (can't reduce R by more than 90%)
    combined_r_reduction = min(0.9, combined_r_reduction)
    
    # Initial effective R
    effective_r = r_value * (1 - combined_r_reduction)
    
    # Simple simulation
    cases = current_cases
    total_cases = current_cases
    max_active_cases = current_cases
    
    for day in range(days):
        # Adjust for compliance decay
        compliance_decay = sum([e["compliance_decay"] for e in effects]) * day
        day_effective_r = effective_r * (1 + min(0.5, compliance_decay))
        
        # Special case for vaccination which improves over time
        if "vaccination_campaign" in policy:
            # Vaccination effect increases over time
            vaccination_effect = min(0.7, 0.01 * day)  # Max 70% reduction after 70 days
            day_effective_r *= (1 - vaccination_effect)
        
        # Calculate new cases
        new_cases = int(cases * day_effective_r)
        recoveries = int(cases * 0.1)  # 10% recover each day
        deaths = int(cases * 0.02 * severity)  # Death rate based on severity
        
        cases = cases + new_cases - recoveries - deaths
        total_cases += new_cases
        max_active_cases = max(max_active_cases, cases)
    
    # Calculate health impact (deaths + cases)
    health_impact = (total_cases / population) + ((total_cases * 0.02 * severity) / population * 10)
    
    return {
        "policies": policy,
        "total_cases": total_cases,
        "max_active_cases": max_active_cases,
        "final_active_cases": cases,
        "health_impact": health_impact,
        "economic_impact": combined_economic_impact,
        "social_impact": combined_social_impact,
        "effective_reproduction_rate": effective_r
    }

def generate_implementation_plan(policies):
    """Generate a mock implementation plan for the selected policies"""
    plan_steps = []
    
    policy_implementation = {
        "lockdown": [
            "Announce lockdown with 48-hour notice",
            "Define essential businesses and services",
            "Establish enforcement protocol",
            "Create permit system for essential workers",
            "Set up support hotline for affected businesses"
        ],
        "mask_mandate": [
            "Issue public health order requiring masks in public spaces",
            "Distribute masks to vulnerable populations",
            "Establish compliance guidelines for businesses",
            "Launch public education campaign on proper mask usage",
            "Set up reporting system for non-compliance"
        ],
        "social_distancing": [
            "Establish capacity limits for public spaces",
            "Install physical distancing markers in high-traffic areas",
            "Modify public transportation schedules and capacity",
            "Issue guidelines for workplaces and schools",
            "Create public awareness campaign"
        ],
        "business_restrictions": [
            "Define business categories and corresponding restrictions",
            "Establish application process for exemptions",
            "Create financial support program for affected businesses",
            "Implement inspection protocol",
            "Set up business compliance hotline"
        ],
        "school_closures": [
            "Coordinate with education authorities on closure timeline",
            "Establish remote learning protocols",
            "Create childcare solutions for essential workers",
            "Distribute necessary technology to students",
            "Implement meal programs for eligible students"
        ],
        "travel_restrictions": [
            "Define restriction boundaries and checkpoints",
            "Establish exemption criteria and application process",
            "Coordinate with transportation providers",
            "Implement testing requirements for travelers",
            "Create quarantine protocols for incoming travelers"
        ],
        "vaccination_campaign": [
            "Secure vaccine supply and distribution chain",
            "Establish priority groups and phased approach",
            "Set up vaccination centers and mobile units",
            "Create appointment and tracking system",
            "Launch public awareness campaign to encourage participation"
        ],
        "testing_and_tracing": [
            "Expand testing capacity and accessibility",
            "Recruit and train contact tracers",
            "Implement digital contact tracing solution",
            "Establish isolation protocols and support",
            "Create data management system for case tracking"
        ],
        "public_education": [
            "Develop multilingual educational materials",
            "Launch multi-channel information campaign",
            "Create dedicated information website and hotline",
            "Engage community leaders as information ambassadors",
            "Implement regular public briefings and updates"
        ]
    }
    
    # Add implementation steps for each policy
    for policy in policies:
        if policy in policy_implementation:
            plan_steps.append({
                "policy": policy,
                "implementation_steps": policy_implementation[policy],
                "timeline": f"{random.randint(1, 5)} days",
                "responsible_entities": ["Health Department", "Emergency Management", "Government Communications"]
            })
    
    return plan_steps

# Routes
@router.post("/city-twin/mock", response_model=SimulationResult, status_code=status.HTTP_201_CREATED)
async def run_city_twin_simulation_mock(
    request: SimulationRequest
):
    """Run a mock bio-digital twin simulation for a city without authentication"""
    try:
        # Generate a unique ID for this simulation
        simulation_id = generate_simulation_id()
        
        # Generate mock daily stats
        days = request.simulation_days or 90
        population = request.population or 1000000
        initial_cases = request.initial_cases or 100
        r_value = request.r_value or 2.5
        
        # Calculate effectiveness from interventions
        total_effectiveness = 0.0
        for intervention in request.intervention_measures:
            if isinstance(intervention, dict):
                total_effectiveness += intervention.get("effectiveness", 0.0)
            else:
                total_effectiveness += getattr(intervention, "effectiveness", 0.0)
        
        # Cap effectiveness at 0.9
        effectiveness = min(0.9, total_effectiveness)
        
        # Generate daily stats
        daily_stats = []
        current_cases = initial_cases
        total_recovered = 0
        total_deaths = 0
        
        for day in range(days):
            # Simple exponential growth model with intervention dampening
            growth_factor = r_value * (1 - effectiveness) * (1 - (current_cases / population))
            new_cases = int(current_cases * growth_factor * random.uniform(0.8, 1.2))
            
            # Limit new cases
            new_cases = max(0, min(new_cases, population - current_cases - total_recovered - total_deaths))
            
            # Some people recover or die each day
            new_recovered = int(current_cases * 0.1 * random.uniform(0.8, 1.2))
            new_deaths = int(current_cases * 0.01 * random.uniform(0.8, 1.2))
            
            # Update totals
            current_cases = current_cases + new_cases - new_recovered - new_deaths
            total_recovered += new_recovered
            total_deaths += new_deaths
            
            # Add daily stats
            daily_stats.append({
                "day": day,
                "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
                "new_cases": new_cases,
                "active_cases": current_cases,
                "recovered": total_recovered,
                "deaths": total_deaths,
                "r_effective": r_value * (1 - effectiveness) * (1 - (current_cases / population)),
                "hospital_capacity_exceeded": current_cases > (population * 0.001)  # 0.1% hospital capacity
            })
        
        # Calculate summary statistics
        total_cases = initial_cases + sum(day["new_cases"] for day in daily_stats)
        peak_active_cases = max(day["active_cases"] for day in daily_stats)
        
        # Create the response
        response = SimulationResult(
            id=simulation_id,
            request=request,
            created_at=datetime.now(),
            results=daily_stats,
            summary={
                "total_cases": total_cases,
                "peak_active_cases": peak_active_cases,
                "total_recovered": total_recovered,
                "total_deaths": total_deaths,
                "r_effective": r_value * (1 - effectiveness),
                "healthcare_impact": "severe" if peak_active_cases > (population * 0.001) else "moderate"
            },
            model_version="1.0.0"
        )
        
        return response
    except Exception as e:
        logger.error(f"Error in mock city twin simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating simulation: {str(e)}"
        )

@router.post("/city-twin", response_model=SimulationResult, status_code=status.HTTP_201_CREATED)
async def run_city_twin_simulation(
    request: SimulationRequest, 
    current_user: User = Depends(get_current_active_user)
):
    """Run a bio-digital twin simulation for a city"""
    # Create a Bio-Digital Twin of the city
    city_model = BioDigitalTwin(
        city_name=request.city_name,
        population=request.population,
        area_km2=random.randint(50, 500)  # Random area if not provided
    )
    
    # Convert intervention measures to the format expected by the model
    intervention_params = {
        "social_distancing": 0.0,
        "masking": 0.0,
        "testing_rate": 0.0,
        "contact_tracing": 0.0,
        "travel_restrictions": 0.0,
        "vaccination_campaign": 0.0
    }
    
    for intervention in request.intervention_measures:
        if intervention["type"] == "social_distancing":
            intervention_params["social_distancing"] = intervention["effectiveness"]
        elif intervention["type"] == "masking":
            intervention_params["masking"] = intervention["effectiveness"]
        elif intervention["type"] == "testing":
            intervention_params["testing_rate"] = intervention["coverage"]
        elif intervention["type"] == "contact_tracing":
            intervention_params["contact_tracing"] = intervention["effectiveness"]
        elif intervention["type"] == "travel_restrictions":
            intervention_params["travel_restrictions"] = intervention["effectiveness"]
        elif intervention["type"] == "vaccination":
            intervention_params["vaccination_campaign"] = intervention["coverage"] / 100  # Convert percentage to decimal
    
    # Set virus parameters
    virus_params = {
        "r0": request.r_value,
        "incubation_period_days": random.uniform(2, 7),
        "infectious_period_days": random.uniform(7, 14),
        "hospitalization_rate": random.uniform(0.03, 0.15),
        "fatality_rate": random.uniform(0.005, 0.03),
        "severity_by_age": True
    }
    
    # Run the simulation
    simulation_results = city_model.run_outbreak_simulation(
        virus_params=virus_params,
        intervention_params=intervention_params,
        days=request.simulation_days,
        initial_cases=request.initial_cases
    )
    
    # Convert the results to the expected format
    results = []
    for day_result in simulation_results["daily_results"]:
        results.append({
            "day": day_result["day"],
            "date": day_result["date"],
            "new_cases": day_result["total_exposed"] if day_result["day"] == 0 else 
                         max(0, day_result["total_infectious"] - simulation_results["daily_results"][day_result["day"]-1]["total_infectious"]),
            "active_cases": day_result["total_infectious"],
            "hospitalized": day_result["total_hospitalized"],
            "recovered": day_result["total_recovered"],
            "deaths": day_result["total_deceased"],
            "r_effective": virus_params["r0"] * (day_result["total_susceptible"] / request.population),
            "hospital_capacity_exceeded": any(d["healthcare_exceeded"] for d in day_result["districts"])
        })
    
    # Calculate summary statistics
    summary = {
        "duration_days": len(results),
        "peak_active_cases": simulation_results["peak_cases"],
        "peak_hospitalized": simulation_results["peak_hospitalizations"],
        "final_active_cases": results[-1]["active_cases"],
        "total_cases": simulation_results["total_cases"],
        "total_recovered": results[-1]["recovered"],
        "total_deaths": results[-1]["deaths"],
        "mortality_rate": results[-1]["deaths"] / simulation_results["total_cases"] if simulation_results["total_cases"] > 0 else 0,
        "contained": results[-1]["active_cases"] < 10
    }
    
    new_simulation = {
        "id": generate_simulation_id(),
        "request": request.dict(),
        "created_at": datetime.now(),
        "results": results,
        "summary": summary,
        "model_version": "1.0.0"
    }
    
    # Add to database
    mock_simulations.append(new_simulation)
    
    return new_simulation

@router.get("/city-twin/{simulation_id}", response_model=SimulationResult)
async def get_city_simulation(
    simulation_id: str, 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific city simulation by ID"""
    for simulation in mock_simulations:
        if simulation["id"] == simulation_id:
            return simulation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Simulation with ID {simulation_id} not found"
    )

@router.post("/policy/mock", response_model=PolicySimulationResult, status_code=status.HTTP_201_CREATED)
async def run_policy_simulation_mock(
    request: PolicySimulationRequest
):
    """Run a mock government decision simulator for policy impact without authentication"""
    try:
        # Generate a unique ID for this simulation
        simulation_id = generate_policy_simulation_id()
        
        # Generate mock policy outcomes
        policy_outcomes = []
        
        # Get virus properties
        virus_props = request.virus_properties
        r0 = 2.5
        severity = "moderate"
        
        if hasattr(virus_props, 'r0'):
            r0 = virus_props.r0
        elif isinstance(virus_props, dict) and 'r0' in virus_props:
            r0 = virus_props['r0']
            
        if hasattr(virus_props, 'severity'):
            severity = virus_props.severity
        elif isinstance(virus_props, dict) and 'severity' in virus_props:
            severity = virus_props['severity']
        
        # Generate policy combinations
        policy_combinations = []
        
        # Add individual policies
        for policy in request.available_policies:
            policy_combinations.append({policy: 0.7})  # High effectiveness
        
        # Add some combinations of 2 policies if available
        if len(request.available_policies) >= 2:
            for i in range(min(3, len(request.available_policies) - 1)):
                policy1 = request.available_policies[i]
                policy2 = request.available_policies[i+1]
                policy_combinations.append({
                    policy1: 0.5,
                    policy2: 0.5
                })
        
        # Add a combination of 3 policies if available
        if len(request.available_policies) >= 3:
            policy_combinations.append({
                request.available_policies[0]: 0.4,
                request.available_policies[1]: 0.4,
                request.available_policies[2]: 0.4
            })
        
        # Generate outcomes for each policy combination
        for i, policy_set in enumerate(policy_combinations):
            # Calculate effectiveness based on policies
            total_effectiveness = sum(policy_set.values())
            
            # Calculate health impact (lower is better)
            health_impact = 100 - (total_effectiveness * 70)
            
            # Calculate economic impact (higher is better)
            economic_impact = 100 - (total_effectiveness * 40)
            
            # Calculate social impact (higher is better)
            social_impact = 100 - (total_effectiveness * 30)
            
            # Calculate overall score (higher is better)
            overall_score = (health_impact * 0.5) + (economic_impact * 0.3) + (social_impact * 0.2)
            
            # Generate daily case data
            days = request.simulation_days or 180
            population = request.population or 1000000
            current_cases = request.current_cases or 500
            
            daily_cases = []
            for day in range(min(30, days)):  # First 30 days only for brevity
                # Simple model: cases decrease based on policy effectiveness
                reduction_factor = 1.0 - (total_effectiveness * 0.8)
                new_cases = int(current_cases * reduction_factor * (0.9 + 0.2 * random.random()))
                current_cases = max(0, new_cases)
                
                daily_cases.append({
                    "day": day,
                    "cases": current_cases
                })
            
            # Create policy name
            policy_name = " + ".join([p.replace("_", " ").title() for p in policy_set.keys()])
            
            # Generate implementation steps
            implementation_steps = []
            for policy, effectiveness in policy_set.items():
                implementation_steps.append({
                    "step": f"Implement {policy.replace('_', ' ').title()}",
                    "timeline": "Immediate",
                    "resources_required": "Medium",
                    "expected_impact": "High" if effectiveness > 0.6 else "Medium"
                })
            
            # Add to outcomes
            policy_outcomes.append({
                "policy_name": policy_name,
                "policies": policy_set,
                "health_impact": health_impact,
                "economic_impact": economic_impact,
                "social_impact": social_impact,
                "overall_score": overall_score,
                "daily_cases": daily_cases,
                "implementation_steps": implementation_steps
            })
        
        # Sort by overall score (ascending - lower is better)
        policy_outcomes.sort(key=lambda x: x["health_impact"])
        
        # Create the response with the structure expected by the frontend
        best_policy = policy_outcomes[0] if policy_outcomes else {}
        
        # Convert the policy set to a format expected by the frontend
        policy_dict = {}
        if policy_outcomes and "policies" in best_policy:
            for policy_name, effectiveness in best_policy["policies"].items():
                policy_dict[policy_name] = "High" if effectiveness > 0.6 else "Medium" if effectiveness > 0.3 else "Low"
        
        response = PolicySimulationResult(
            id=simulation_id,
            request=request,
            created_at=datetime.now(),
            policy_outcomes=policy_outcomes,
            optimal_strategy={
                "name": best_policy.get("policy_name", "No policy simulated"),
                "policy": policy_dict,
                "impact_scores": {
                    "health_score": 100 - best_policy.get("health_impact", 50),
                    "economic_score": best_policy.get("economic_impact", 50),
                    "social_score": best_policy.get("social_impact", 50),
                    "overall_score": best_policy.get("overall_score", 50)
                },
                "implementation_plan": best_policy.get("implementation_steps", [])
            },
            model_version="1.0.0"
        )
        
        return response
    except Exception as e:
        logger.error(f"Error in mock policy simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating policy simulation: {str(e)}"
        )

@router.post("/policy", response_model=PolicySimulationResult, status_code=status.HTTP_201_CREATED)
async def run_policy_simulation_endpoint(
    request: PolicySimulationRequest, 
    current_user: User = Depends(get_current_active_user)
):
    """Run a government decision simulator for policy impact"""
    # Check if user has permission (government users only)
    if current_user.role != "government" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can run policy simulations"
        )
    
    # Create a Bio-Digital Twin of the region
    city_model = BioDigitalTwin(
        city_name=request.region,
        population=request.population,
        area_km2=random.randint(50, 500)  # Random area if not provided
    )
    
    # Create a Government Decision Simulator
    policy_simulator = GovernmentDecisionSimulator()
    
    # Define policy decisions to simulate
    policy_decisions_to_simulate = []
    
    # Generate combinations of policies from available options
    if "social_distancing" in request.available_policies:
        for level in ["none", "recommended", "required", "strict_lockdown"]:
            base_policy = {
                "social_distancing": level,
                "masking": "none",
                "testing": "minimal",
                "contact_tracing": "none",
                "travel_restrictions": "none",
                "vaccination": "none",
                "economic_support": "none",
                "healthcare_capacity": "baseline"
            }
            policy_decisions_to_simulate.append(base_policy)
    
    # Add some combined policies
    if len(request.available_policies) >= 3:
        combined_policies = [
            {
                "social_distancing": "recommended",
                "masking": "required_indoors",
                "testing": "expanded",
                "contact_tracing": "app_based",
                "travel_restrictions": "advisory",
                "vaccination": "high_risk_only",
                "economic_support": "limited",
                "healthcare_capacity": "baseline"
            },
            {
                "social_distancing": "required",
                "masking": "required_everywhere",
                "testing": "mass_testing",
                "contact_tracing": "comprehensive",
                "travel_restrictions": "partial_restrictions",
                "vaccination": "expanded_eligibility",
                "economic_support": "moderate",
                "healthcare_capacity": "expanded"
            },
            {
                "social_distancing": "strict_lockdown",
                "masking": "required_everywhere",
                "testing": "mass_testing",
                "contact_tracing": "comprehensive",
                "travel_restrictions": "full_restrictions",
                "vaccination": "universal_campaign",
                "economic_support": "comprehensive",
                "healthcare_capacity": "maximum_expansion"
            }
        ]
        policy_decisions_to_simulate.extend(combined_policies)
    
    # Run simulations for each policy decision
    policy_outcomes = []
    for policy_decision in policy_decisions_to_simulate:
        # Run the simulation
        impact = policy_simulator.simulate_policy_impact(
            city_model=city_model,
            policy_decisions=policy_decision,
            days=request.simulation_days,
            initial_cases=request.current_cases
        )
        
        # Add to outcomes
        policy_outcomes.append({
            "policy": policy_decision,
            "health_impact": {
                "total_cases": impact["health_impact"]["total_cases"],
                "total_deaths": impact["health_impact"]["total_deaths"],
                "peak_hospitalizations": impact["health_impact"]["peak_hospitalizations"],
                "outbreak_duration": impact["health_impact"]["simulation_days"]
            },
            "economic_impact": impact["socioeconomic_impact"]["economic_impact"],
            "social_impact": impact["socioeconomic_impact"]["social_impact"],
            "healthcare_impact": impact["socioeconomic_impact"]["healthcare_impact"],
            "equity_impact": impact["socioeconomic_impact"]["equity_impact"],
            "impact_scores": impact["impact_scores"]
        })
    
    # Find optimal strategy (highest overall score)
    optimal_strategy = max(policy_outcomes, key=lambda x: x["impact_scores"]["overall_score"])
    
    # Create the result
    new_simulation = {
        "id": generate_policy_simulation_id(),
        "request": request.dict(),
        "created_at": datetime.now(),
        "policy_outcomes": policy_outcomes,
        "optimal_strategy": optimal_strategy,
        "model_version": "1.0.0"
    }
    
    # Add to database
    mock_policy_simulations.append(new_simulation)
    
    return new_simulation

@router.get("/policy/{simulation_id}", response_model=PolicySimulationResult)
async def get_policy_simulation(
    simulation_id: str, 
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific policy simulation by ID"""
    # Check if user has permission (government users only)
    if current_user.role != "government":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can access policy simulations"
        )
    
    for simulation in mock_policy_simulations:
        if simulation["id"] == simulation_id:
            return simulation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Policy simulation with ID {simulation_id} not found"
    )