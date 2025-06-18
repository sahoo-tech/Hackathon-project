import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import logging
import json

logger = logging.getLogger(__name__)

class BioDigitalTwin:
    """
    A class that simulates a bio-digital twin of a city or region,
    allowing for outbreak simulations in population models.
    """
    def __init__(self, city_name=None, population=None, area_km2=None):
        logger.info(f"Initialized BioDigitalTwin for {city_name if city_name else 'unnamed city'}")
        
        # If city details not provided, use defaults
        self.city_name = city_name or "Sample City"
        self.population = population or random.randint(100000, 2000000)
        self.area_km2 = area_km2 or random.randint(50, 500)
        
        # Calculate population density
        self.population_density = self.population / self.area_km2
        
        # Generate city districts
        self.districts = self._generate_districts()
        
        # Set baseline parameters
        self.baseline_params = {
            "r0": 2.5,  # Basic reproduction number
            "incubation_period_days": 5,
            "infectious_period_days": 10,
            "hospitalization_rate": 0.05,
            "fatality_rate": 0.01,
            "recovery_rate": 0.95,
            "vaccination_rate": 0.4,
            "mobility_factor": 0.7  # How much people move between districts
        }
        
    def _generate_districts(self, num_districts=None):
        """Generate simulated city districts with varying characteristics"""
        if num_districts is None:
            # Scale number of districts with population
            num_districts = max(3, min(20, int(self.population / 100000)))
            
        districts = []
        total_population = 0
        
        for i in range(num_districts):
            # Generate district with random characteristics
            district = {
                "id": f"district-{i+1}",
                "name": f"District {i+1}",
                "population": int(self.population * random.uniform(0.02, 0.2)),
                "area_km2": self.area_km2 * random.uniform(0.02, 0.2),
                "healthcare_capacity": random.uniform(0.3, 1.0),
                "avg_age": random.uniform(25, 45),
                "population_density_factor": random.uniform(0.5, 2.0),
                "socioeconomic_index": random.uniform(0.2, 0.9),
                "vaccination_rate": random.uniform(0.2, 0.7)
            }
            
            # Calculate derived metrics
            district["population_density"] = district["population"] / district["area_km2"]
            district["vulnerability_index"] = (
                (1 - district["healthcare_capacity"]) * 0.3 +
                (district["population_density_factor"]) * 0.3 +
                (1 - district["socioeconomic_index"]) * 0.2 +
                (1 - district["vaccination_rate"]) * 0.2
            )
            
            districts.append(district)
            total_population += district["population"]
        
        # Normalize populations to match city total
        population_scale = self.population / total_population
        for district in districts:
            district["population"] = int(district["population"] * population_scale)
            
        # Sort by vulnerability (highest first)
        districts.sort(key=lambda x: x["vulnerability_index"], reverse=True)
        
        return districts
    
    def run_outbreak_simulation(self, virus_params=None, intervention_params=None, days=60, initial_cases=10):
        """
        Run an outbreak simulation in the city model.
        
        Args:
            virus_params: Parameters defining the virus characteristics
            intervention_params: Parameters defining intervention strategies
            days: Number of days to simulate
            initial_cases: Number of initial cases
            
        Returns:
            Simulation results
        """
        # Use default virus parameters if none provided
        if virus_params is None:
            virus_params = {
                "r0": random.uniform(1.5, 4.0),
                "incubation_period_days": random.uniform(2, 7),
                "infectious_period_days": random.uniform(7, 14),
                "hospitalization_rate": random.uniform(0.03, 0.15),
                "fatality_rate": random.uniform(0.005, 0.03),
                "severity_by_age": True
            }
            
        # Use default intervention parameters if none provided
        if intervention_params is None:
            intervention_params = {
                "social_distancing": 0.3,  # 0-1 scale
                "masking": 0.4,  # 0-1 scale
                "testing_rate": 0.1,  # Proportion of population tested daily
                "contact_tracing": 0.5,  # 0-1 scale
                "travel_restrictions": 0.2,  # 0-1 scale
                "vaccination_campaign": 0.0  # Additional vaccination per day
            }
            
        # Calculate effective reproduction number based on interventions
        effective_r0 = virus_params["r0"] * (
            1 - intervention_params["social_distancing"] * 0.4 -
            intervention_params["masking"] * 0.2 -
            intervention_params["testing_rate"] * intervention_params["contact_tracing"] * 0.3 -
            intervention_params["travel_restrictions"] * 0.1
        )
        
        # Initialize simulation state
        simulation_state = {
            "day": 0,
            "total_susceptible": self.population - initial_cases,
            "total_exposed": initial_cases,
            "total_infectious": 0,
            "total_hospitalized": 0,
            "total_recovered": 0,
            "total_deceased": 0,
            "districts": []
        }
        
        # Distribute initial cases across districts (weighted by vulnerability)
        total_vulnerability = sum(d["vulnerability_index"] for d in self.districts)
        remaining_cases = initial_cases
        
        for district in self.districts:
            # Calculate cases for this district
            district_cases = int(initial_cases * district["vulnerability_index"] / total_vulnerability)
            if district_cases > remaining_cases:
                district_cases = remaining_cases
                
            remaining_cases -= district_cases
            
            # Initialize district state
            district_state = {
                "id": district["id"],
                "name": district["name"],
                "susceptible": district["population"] - district_cases,
                "exposed": district_cases,
                "infectious": 0,
                "hospitalized": 0,
                "recovered": 0,
                "deceased": 0,
                "healthcare_capacity": district["healthcare_capacity"],
                "healthcare_exceeded": False
            }
            
            simulation_state["districts"].append(district_state)
            
        # If there are remaining cases, distribute them to the first district
        if remaining_cases > 0:
            simulation_state["districts"][0]["exposed"] += remaining_cases
            simulation_state["districts"][0]["susceptible"] -= remaining_cases
            
        # Run simulation for specified number of days
        daily_results = [self._get_simulation_summary(simulation_state)]
        
        for day in range(1, days + 1):
            # Update simulation day
            simulation_state["day"] = day
            
            # Process disease progression for each district
            for district_idx, district_state in enumerate(simulation_state["districts"]):
                district = self.districts[district_idx]
                
                # Calculate new exposures based on effective R0 and district characteristics
                district_effective_r0 = effective_r0 * (
                    1 + (district["population_density_factor"] - 1) * 0.3 +
                    (1 - district["vaccination_rate"]) * 0.2
                )
                
                # New exposures from within district
                new_exposures_internal = int(
                    district_state["infectious"] * 
                    district_effective_r0 / virus_params["infectious_period_days"] *
                    district_state["susceptible"] / district["population"] *
                    (1 - intervention_params["travel_restrictions"])
                )
                
                # New exposures from other districts (mobility between districts)
                new_exposures_external = 0
                for other_idx, other_district_state in enumerate(simulation_state["districts"]):
                    if other_idx != district_idx:
                        other_district = self.districts[other_idx]
                        mobility_factor = self.baseline_params["mobility_factor"] * (1 - intervention_params["travel_restrictions"])
                        
                        # Calculate cross-district infections
                        cross_infections = int(
                            other_district_state["infectious"] *
                            district_effective_r0 / virus_params["infectious_period_days"] *
                            district_state["susceptible"] / district["population"] *
                            mobility_factor * 0.1  # Scale factor for cross-district transmission
                        )
                        
                        new_exposures_external += cross_infections
                
                total_new_exposures = min(new_exposures_internal + new_exposures_external, district_state["susceptible"])
                
                # Calculate transitions between disease states
                new_infectious = int(district_state["exposed"] / virus_params["incubation_period_days"])
                new_outcomes = int(district_state["infectious"] / virus_params["infectious_period_days"])
                
                # Calculate hospitalizations, recoveries, and deaths
                hospitalization_modifier = 1.0
                fatality_modifier = 1.0
                
                # If healthcare capacity exceeded, increase fatality rate
                if district_state["hospitalized"] > district["healthcare_capacity"] * 100:  # Assuming 100 beds per unit of capacity
                    district_state["healthcare_exceeded"] = True
                    hospitalization_modifier = 1.2
                    fatality_modifier = 1.5
                else:
                    district_state["healthcare_exceeded"] = False
                
                new_hospitalized = int(new_outcomes * virus_params["hospitalization_rate"] * hospitalization_modifier)
                new_recovered_direct = int(new_outcomes * (1 - virus_params["hospitalization_rate"]))
                
                # Outcomes for hospitalized patients
                hospital_outcomes = int(district_state["hospitalized"] * 0.1)  # 10% of hospitalized cases resolve each day
                hospital_deaths = int(hospital_outcomes * virus_params["fatality_rate"] * fatality_modifier)
                hospital_recoveries = hospital_outcomes - hospital_deaths
                
                # Update district state
                district_state["susceptible"] -= total_new_exposures
                district_state["exposed"] = district_state["exposed"] + total_new_exposures - new_infectious
                district_state["infectious"] = district_state["infectious"] + new_infectious - new_outcomes
                district_state["hospitalized"] = district_state["hospitalized"] + new_hospitalized - hospital_outcomes
                district_state["recovered"] = district_state["recovered"] + new_recovered_direct + hospital_recoveries
                district_state["deceased"] = district_state["deceased"] + hospital_deaths
                
                # Add vaccination effect
                new_vaccinations = int(district_state["susceptible"] * intervention_params["vaccination_campaign"])
                district_state["susceptible"] -= new_vaccinations
                district_state["recovered"] += new_vaccinations
            
            # Update totals
            simulation_state["total_susceptible"] = sum(d["susceptible"] for d in simulation_state["districts"])
            simulation_state["total_exposed"] = sum(d["exposed"] for d in simulation_state["districts"])
            simulation_state["total_infectious"] = sum(d["infectious"] for d in simulation_state["districts"])
            simulation_state["total_hospitalized"] = sum(d["hospitalized"] for d in simulation_state["districts"])
            simulation_state["total_recovered"] = sum(d["recovered"] for d in simulation_state["districts"])
            simulation_state["total_deceased"] = sum(d["deceased"] for d in simulation_state["districts"])
            
            # Save daily results
            daily_results.append(self._get_simulation_summary(simulation_state))
            
            # Check if outbreak has ended
            if simulation_state["total_exposed"] == 0 and simulation_state["total_infectious"] == 0:
                break
                
        # Prepare final results
        results = {
            "city": {
                "name": self.city_name,
                "population": self.population,
                "area_km2": self.area_km2
            },
            "virus_params": virus_params,
            "intervention_params": intervention_params,
            "effective_r0": effective_r0,
            "simulation_days": len(daily_results),
            "peak_cases": max(day["total_infectious"] for day in daily_results),
            "peak_hospitalizations": max(day["total_hospitalized"] for day in daily_results),
            "total_cases": daily_results[-1]["total_infectious"] + daily_results[-1]["total_recovered"] + daily_results[-1]["total_deceased"],
            "total_deaths": daily_results[-1]["total_deceased"],
            "daily_results": daily_results
        }
        
        return results
    
    def _get_simulation_summary(self, state):
        """Create a summary of the current simulation state"""
        return {
            "day": state["day"],
            "date": (datetime.now() + timedelta(days=state["day"])).strftime("%Y-%m-%d"),
            "total_susceptible": state["total_susceptible"],
            "total_exposed": state["total_exposed"],
            "total_infectious": state["total_infectious"],
            "total_hospitalized": state["total_hospitalized"],
            "total_recovered": state["total_recovered"],
            "total_deceased": state["total_deceased"],
            "districts": [
                {
                    "id": d["id"],
                    "name": d["name"],
                    "susceptible": d["susceptible"],
                    "exposed": d["exposed"],
                    "infectious": d["infectious"],
                    "hospitalized": d["hospitalized"],
                    "recovered": d["recovered"],
                    "deceased": d["deceased"],
                    "healthcare_exceeded": d["healthcare_exceeded"]
                }
                for d in state["districts"]
            ]
        }

class GovernmentDecisionSimulator:
    """
    A class that simulates the effects of government policy decisions
    on outbreak progression and socioeconomic factors.
    """
    def __init__(self):
        logger.info("Initialized GovernmentDecisionSimulator")
        
        # Define policy options
        self.policy_options = {
            "social_distancing": {
                "none": 0.0,
                "recommended": 0.2,
                "required": 0.5,
                "strict_lockdown": 0.8
            },
            "masking": {
                "none": 0.0,
                "recommended": 0.3,
                "required_indoors": 0.6,
                "required_everywhere": 0.8
            },
            "testing": {
                "minimal": 0.01,
                "symptomatic_only": 0.05,
                "expanded": 0.15,
                "mass_testing": 0.3
            },
            "contact_tracing": {
                "none": 0.0,
                "manual": 0.3,
                "app_based": 0.5,
                "comprehensive": 0.8
            },
            "travel_restrictions": {
                "none": 0.0,
                "advisory": 0.2,
                "partial_restrictions": 0.5,
                "full_restrictions": 0.9
            },
            "vaccination": {
                "none": 0.0,
                "high_risk_only": 0.001,
                "expanded_eligibility": 0.003,
                "universal_campaign": 0.007
            },
            "economic_support": {
                "none": 0.0,
                "limited": 0.3,
                "moderate": 0.6,
                "comprehensive": 0.9
            },
            "healthcare_capacity": {
                "baseline": 0.0,
                "expanded": 0.3,
                "field_hospitals": 0.6,
                "maximum_expansion": 0.9
            }
        }
        
    def simulate_policy_impact(self, city_model, policy_decisions, days=60, initial_cases=10):
        """
        Simulate the impact of policy decisions on outbreak progression and socioeconomic factors.
        
        Args:
            city_model: BioDigitalTwin instance
            policy_decisions: Dictionary of policy decisions
            days: Number of days to simulate
            initial_cases: Number of initial cases
            
        Returns:
            Simulation results including health and socioeconomic impacts
        """
        # Convert policy decisions to intervention parameters
        intervention_params = {
            "social_distancing": self.policy_options["social_distancing"].get(
                policy_decisions.get("social_distancing", "none"), 0.0
            ),
            "masking": self.policy_options["masking"].get(
                policy_decisions.get("masking", "none"), 0.0
            ),
            "testing_rate": self.policy_options["testing"].get(
                policy_decisions.get("testing", "minimal"), 0.01
            ),
            "contact_tracing": self.policy_options["contact_tracing"].get(
                policy_decisions.get("contact_tracing", "none"), 0.0
            ),
            "travel_restrictions": self.policy_options["travel_restrictions"].get(
                policy_decisions.get("travel_restrictions", "none"), 0.0
            ),
            "vaccination_campaign": self.policy_options["vaccination"].get(
                policy_decisions.get("vaccination", "none"), 0.0
            )
        }
        
        # Run health impact simulation
        health_impact = city_model.run_outbreak_simulation(
            intervention_params=intervention_params,
            days=days,
            initial_cases=initial_cases
        )
        
        # Calculate socioeconomic impacts
        socioeconomic_impact = self._calculate_socioeconomic_impact(
            policy_decisions,
            health_impact,
            city_model
        )
        
        # Calculate overall impact scores
        impact_scores = self._calculate_impact_scores(health_impact, socioeconomic_impact)
        
        # Prepare final results
        results = {
            "policy_decisions": policy_decisions,
            "health_impact": health_impact,
            "socioeconomic_impact": socioeconomic_impact,
            "impact_scores": impact_scores
        }
        
        return results
    
    def _calculate_socioeconomic_impact(self, policy_decisions, health_impact, city_model):
        """Calculate socioeconomic impacts of policy decisions"""
        # Base economic impact (GDP reduction)
        economic_impact = (
            self.policy_options["social_distancing"].get(policy_decisions.get("social_distancing", "none"), 0.0) * 0.5 +
            self.policy_options["travel_restrictions"].get(policy_decisions.get("travel_restrictions", "none"), 0.0) * 0.3
        )
        
        # Mitigated by economic support
        economic_support = self.policy_options["economic_support"].get(policy_decisions.get("economic_support", "none"), 0.0)
        economic_impact *= (1 - economic_support * 0.7)
        
        # Calculate unemployment impact
        unemployment_impact = economic_impact * 1.5  # Unemployment rises faster than GDP falls
        
        # Calculate mental health impact
        mental_health_impact = (
            self.policy_options["social_distancing"].get(policy_decisions.get("social_distancing", "none"), 0.0) * 0.4 +
            economic_impact * 0.3 +
            (health_impact["total_deaths"] / city_model.population) * 100  # Deaths per 100k
        )
        
        # Calculate education impact
        education_impact = self.policy_options["social_distancing"].get(policy_decisions.get("social_distancing", "none"), 0.0) * 0.8
        
        # Calculate healthcare system strain
        healthcare_capacity_expansion = self.policy_options["healthcare_capacity"].get(
            policy_decisions.get("healthcare_capacity", "baseline"), 0.0
        )
        
        peak_hospitalization_rate = health_impact["peak_hospitalizations"] / city_model.population
        healthcare_strain = peak_hospitalization_rate * 100 * (1 - healthcare_capacity_expansion)
        
        # Calculate equity impact (how policies affect vulnerable populations)
        equity_impact = 0
        for district in city_model.districts:
            if district["vulnerability_index"] > 0.6:  # Focus on vulnerable districts
                district_equity_impact = (
                    economic_impact * (1 - district["socioeconomic_index"]) * 2 +  # Economic impact hits poor areas harder
                    healthcare_strain * (1 - district["healthcare_capacity"]) * 0.5  # Healthcare strain hits areas with less capacity harder
                )
                equity_impact += district_equity_impact
                
        equity_impact /= len([d for d in city_model.districts if d["vulnerability_index"] > 0.6]) or 1
        
        return {
            "economic_impact": {
                "gdp_reduction_percent": economic_impact * 100,
                "unemployment_increase_percent": unemployment_impact * 100,
                "business_closures_percent": economic_impact * 80
            },
            "social_impact": {
                "mental_health_index": mental_health_impact * 10,  # 0-10 scale
                "education_disruption_index": education_impact * 10,  # 0-10 scale
                "social_cohesion_impact": economic_impact * 5  # 0-10 scale
            },
            "healthcare_impact": {
                "system_strain_index": healthcare_strain * 10,  # 0-10 scale
                "non_covid_care_reduction_percent": healthcare_strain * 100
            },
            "equity_impact": {
                "vulnerable_populations_index": equity_impact * 10,  # 0-10 scale
                "inequality_increase_percent": equity_impact * 50
            }
        }
    
    def _calculate_impact_scores(self, health_impact, socioeconomic_impact):
        """Calculate overall impact scores for the policy decisions"""
        # Health score (0-100, higher is better)
        health_score = 100 - (
            (health_impact["total_deaths"] / health_impact["city"]["population"]) * 50000 +  # Deaths per 100k
            (health_impact["peak_cases"] / health_impact["city"]["population"]) * 5000  # Peak cases per 100k
        )
        health_score = max(0, min(100, health_score))
        
        # Economic score (0-100, higher is better)
        economic_score = 100 - (
            socioeconomic_impact["economic_impact"]["gdp_reduction_percent"] * 2 +
            socioeconomic_impact["economic_impact"]["unemployment_increase_percent"]
        )
        economic_score = max(0, min(100, economic_score))
        
        # Social welfare score (0-100, higher is better)
        social_score = 100 - (
            socioeconomic_impact["social_impact"]["mental_health_index"] * 3 +
            socioeconomic_impact["social_impact"]["education_disruption_index"] * 2 +
            socioeconomic_impact["social_impact"]["social_cohesion_impact"] * 2
        )
        social_score = max(0, min(100, social_score))
        
        # Equity score (0-100, higher is better)
        equity_score = 100 - (
            socioeconomic_impact["equity_impact"]["vulnerable_populations_index"] * 5 +
            socioeconomic_impact["equity_impact"]["inequality_increase_percent"] * 0.5
        )
        equity_score = max(0, min(100, equity_score))
        
        # Overall score (weighted average)
        overall_score = (
            health_score * 0.4 +
            economic_score * 0.25 +
            social_score * 0.2 +
            equity_score * 0.15
        )
        
        return {
            "health_score": health_score,
            "economic_score": economic_score,
            "social_score": social_score,
            "equity_score": equity_score,
            "overall_score": overall_score
        }