"""
LLM-Powered Mutation Explainer and Outbreak Planner
This module provides natural language explanations for viral mutations and outbreak planning.
"""

import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    pipeline, GPT2LMHeadModel, GPT2Tokenizer
)
from typing import List, Dict, Optional, Union
import json
import logging
from datetime import datetime
import re
import asyncio
import aiohttp
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MutationData:
    """Data structure for mutation information"""
    mutation_id: str
    sequence_change: str
    impact_score: float
    transmissibility_change: float
    severity_change: float
    affected_proteins: List[str]
    geographic_origin: str
    detection_date: str

@dataclass
class OutbreakData:
    """Data structure for outbreak information"""
    location: str
    outbreak_probability: float
    severity_score: float
    timeline_days: int
    population_at_risk: int
    risk_factors: List[Dict]
    healthcare_capacity: float

class LLMExplainer:
    """Main class for LLM-powered explanations and planning"""
    
    def __init__(self, model_name: str = "microsoft/DialoGPT-medium"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_name = model_name
        
        # Initialize models
        self._initialize_models()
        
        # Templates for different explanation types
        self.templates = {
            'mutation_explanation': self._get_mutation_template(),
            'outbreak_planning': self._get_outbreak_planning_template(),
            'risk_communication': self._get_risk_communication_template(),
            'policy_recommendation': self._get_policy_template()
        }
    
    def _initialize_models(self):
        """Initialize the LLM models"""
        try:
            # Primary model for general explanations
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            self.model.to(self.device)
            
            # Add padding token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Initialize text generation pipeline
            self.generator = pipeline(
                'text-generation',
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info(f"LLM models initialized successfully with {self.model_name}")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            # Fallback to a smaller model
            self._initialize_fallback_model()
    
    def _initialize_fallback_model(self):
        """Initialize fallback model if primary model fails"""
        try:
            self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
            self.model = GPT2LMHeadModel.from_pretrained('gpt2')
            self.model.to(self.device)
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            self.generator = pipeline(
                'text-generation',
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("Fallback model (GPT-2) initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing fallback model: {e}")
            self.model = None
            self.tokenizer = None
            self.generator = None
    
    def explain_mutation(self, mutation_data: Union[MutationData, Dict], 
                        audience: str = "general", 
                        language: str = "english") -> str:
        """
        Generate natural language explanation of viral mutation
        
        Args:
            mutation_data: Mutation information
            audience: Target audience (general, scientific, policy, healthcare)
            language: Output language
            
        Returns:
            Natural language explanation
        """
        if isinstance(mutation_data, dict):
            mutation_data = MutationData(**mutation_data)
        
        try:
            # Create context-aware prompt
            prompt = self._create_mutation_prompt(mutation_data, audience)
            
            # Generate explanation
            explanation = self._generate_text(prompt, max_length=300)
            
            # Post-process for clarity and accuracy
            explanation = self._post_process_explanation(explanation, audience)
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating mutation explanation: {e}")
            return self._generate_fallback_mutation_explanation(mutation_data, audience)
    
    def _create_mutation_prompt(self, mutation_data: MutationData, audience: str) -> str:
        """Create prompt for mutation explanation"""
        audience_context = {
            'general': "Explain in simple terms that anyone can understand",
            'scientific': "Provide detailed scientific explanation with technical terms",
            'policy': "Focus on policy implications and public health impact",
            'healthcare': "Emphasize clinical significance and treatment implications"
        }
        
        context = audience_context.get(audience, audience_context['general'])
        
        prompt = f"""
        {context}:
        
        A new viral mutation has been identified:
        - Mutation ID: {mutation_data.mutation_id}
        - Sequence Change: {mutation_data.sequence_change}
        - Impact Score: {mutation_data.impact_score:.3f} (0=minimal, 1=severe)
        - Transmissibility Change: {mutation_data.transmissibility_change:+.3f}
        - Severity Change: {mutation_data.severity_change:+.3f}
        - Affected Proteins: {', '.join(mutation_data.affected_proteins)}
        - Geographic Origin: {mutation_data.geographic_origin}
        - Detection Date: {mutation_data.detection_date}
        
        Explanation:
        """
        
        return prompt
    
    def explain_outbreak_prediction(self, outbreak_data: Union[OutbreakData, Dict], 
                                  audience: str = "general") -> str:
        """
        Generate explanation for outbreak prediction
        
        Args:
            outbreak_data: Outbreak prediction information
            audience: Target audience
            
        Returns:
            Natural language explanation
        """
        if isinstance(outbreak_data, dict):
            outbreak_data = OutbreakData(**outbreak_data)
        
        try:
            prompt = self._create_outbreak_prompt(outbreak_data, audience)
            explanation = self._generate_text(prompt, max_length=400)
            explanation = self._post_process_explanation(explanation, audience)
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating outbreak explanation: {e}")
            return self._generate_fallback_outbreak_explanation(outbreak_data, audience)
    
    def _create_outbreak_prompt(self, outbreak_data: OutbreakData, audience: str) -> str:
        """Create prompt for outbreak explanation"""
        risk_factors_text = ", ".join([f"{rf['factor']} ({rf['risk_level']})" 
                                     for rf in outbreak_data.risk_factors[:3]])
        
        prompt = f"""
        Explain the outbreak prediction for {outbreak_data.location}:
        
        - Outbreak Probability: {outbreak_data.outbreak_probability:.1%}
        - Severity Score: {outbreak_data.severity_score:.3f}
        - Estimated Timeline: {outbreak_data.timeline_days} days
        - Population at Risk: {outbreak_data.population_at_risk:,}
        - Healthcare Capacity: {outbreak_data.healthcare_capacity:.1%}
        - Key Risk Factors: {risk_factors_text}
        
        Provide a clear explanation of what this means and what actions should be taken:
        """
        
        return prompt
    
    def generate_outbreak_plan(self, outbreak_data: Union[OutbreakData, Dict], 
                             plan_type: str = "comprehensive") -> Dict:
        """
        Generate outbreak response plan using LLM
        
        Args:
            outbreak_data: Outbreak information
            plan_type: Type of plan (comprehensive, emergency, prevention)
            
        Returns:
            Structured outbreak response plan
        """
        if isinstance(outbreak_data, dict):
            outbreak_data = OutbreakData(**outbreak_data)
        
        try:
            # Generate different sections of the plan
            plan_sections = {
                'executive_summary': self._generate_executive_summary(outbreak_data),
                'immediate_actions': self._generate_immediate_actions(outbreak_data),
                'resource_allocation': self._generate_resource_allocation(outbreak_data),
                'communication_strategy': self._generate_communication_strategy(outbreak_data),
                'monitoring_plan': self._generate_monitoring_plan(outbreak_data),
                'contingency_measures': self._generate_contingency_measures(outbreak_data)
            }
            
            # Compile comprehensive plan
            outbreak_plan = {
                'plan_id': f"PLAN_{outbreak_data.location.replace(' ', '_').upper()}_{datetime.now().strftime('%Y%m%d')}",
                'location': outbreak_data.location,
                'generated_date': datetime.now().isoformat(),
                'plan_type': plan_type,
                'outbreak_probability': outbreak_data.outbreak_probability,
                'severity_level': self._categorize_severity(outbreak_data.severity_score),
                'sections': plan_sections,
                'key_metrics': {
                    'population_at_risk': outbreak_data.population_at_risk,
                    'healthcare_capacity': outbreak_data.healthcare_capacity,
                    'estimated_timeline': outbreak_data.timeline_days,
                    'priority_level': self._calculate_priority_level(outbreak_data)
                }
            }
            
            return outbreak_plan
            
        except Exception as e:
            logger.error(f"Error generating outbreak plan: {e}")
            return self._generate_fallback_plan(outbreak_data)
    
    def _generate_executive_summary(self, outbreak_data: OutbreakData) -> str:
        """Generate executive summary for outbreak plan"""
        prompt = f"""
        Write an executive summary for an outbreak response plan:
        
        Location: {outbreak_data.location}
        Outbreak Probability: {outbreak_data.outbreak_probability:.1%}
        Severity: {outbreak_data.severity_score:.3f}
        Timeline: {outbreak_data.timeline_days} days
        Population at Risk: {outbreak_data.population_at_risk:,}
        
        Executive Summary:
        """
        
        return self._generate_text(prompt, max_length=200)
    
    def _generate_immediate_actions(self, outbreak_data: OutbreakData) -> List[str]:
        """Generate list of immediate actions"""
        prompt = f"""
        List immediate actions for outbreak response in {outbreak_data.location}:
        
        Probability: {outbreak_data.outbreak_probability:.1%}
        Timeline: {outbreak_data.timeline_days} days
        Healthcare Capacity: {outbreak_data.healthcare_capacity:.1%}
        
        Immediate Actions (numbered list):
        1.
        """
        
        response = self._generate_text(prompt, max_length=300)
        
        # Extract numbered actions
        actions = []
        lines = response.split('\n')
        for line in lines:
            if re.match(r'^\d+\.', line.strip()):
                actions.append(line.strip())
        
        return actions[:10]  # Return top 10 actions
    
    def _generate_resource_allocation(self, outbreak_data: OutbreakData) -> Dict:
        """Generate resource allocation recommendations"""
        prompt = f"""
        Recommend resource allocation for outbreak in {outbreak_data.location}:
        
        Population at Risk: {outbreak_data.population_at_risk:,}
        Healthcare Capacity: {outbreak_data.healthcare_capacity:.1%}
        Severity Score: {outbreak_data.severity_score:.3f}
        
        Resource Allocation:
        - Medical Personnel:
        - Hospital Beds:
        - Testing Capacity:
        - Vaccines/Treatments:
        - Emergency Supplies:
        """
        
        response = self._generate_text(prompt, max_length=250)
        
        # Parse response into structured format
        resources = {
            'medical_personnel': self._extract_resource_number(response, 'Medical Personnel'),
            'hospital_beds': self._extract_resource_number(response, 'Hospital Beds'),
            'testing_capacity': self._extract_resource_number(response, 'Testing Capacity'),
            'vaccines_treatments': self._extract_resource_text(response, 'Vaccines/Treatments'),
            'emergency_supplies': self._extract_resource_text(response, 'Emergency Supplies')
        }
        
        return resources
    
    def _generate_communication_strategy(self, outbreak_data: OutbreakData) -> Dict:
        """Generate communication strategy"""
        prompt = f"""
        Create communication strategy for outbreak in {outbreak_data.location}:
        
        Outbreak Probability: {outbreak_data.outbreak_probability:.1%}
        Population: {outbreak_data.population_at_risk:,}
        
        Communication Strategy:
        - Target Audiences:
        - Key Messages:
        - Communication Channels:
        - Frequency:
        """
        
        response = self._generate_text(prompt, max_length=300)
        
        return {
            'strategy_text': response,
            'priority_level': 'high' if outbreak_data.outbreak_probability > 0.7 else 'medium',
            'update_frequency': 'daily' if outbreak_data.outbreak_probability > 0.5 else 'weekly'
        }
    
    def _generate_monitoring_plan(self, outbreak_data: OutbreakData) -> Dict:
        """Generate monitoring and surveillance plan"""
        monitoring_intensity = 'high' if outbreak_data.outbreak_probability > 0.6 else 'medium'
        
        return {
            'surveillance_level': monitoring_intensity,
            'testing_frequency': 'daily' if monitoring_intensity == 'high' else 'weekly',
            'reporting_schedule': 'real-time' if monitoring_intensity == 'high' else 'daily',
            'key_indicators': [
                'case_numbers',
                'hospitalization_rates',
                'testing_positivity',
                'healthcare_capacity_utilization'
            ]
        }
    
    def _generate_contingency_measures(self, outbreak_data: OutbreakData) -> List[str]:
        """Generate contingency measures"""
        measures = [
            f"Activate emergency response if cases exceed {int(outbreak_data.population_at_risk * 0.01)} per day",
            f"Implement lockdown measures if healthcare capacity exceeds {outbreak_data.healthcare_capacity * 100 + 20:.0f}%",
            "Establish alternative care sites if hospital capacity reaches 90%",
            "Deploy mobile testing units to high-risk areas",
            "Coordinate with neighboring regions for resource sharing"
        ]
        
        return measures
    
    def generate_risk_communication(self, risk_data: Dict, 
                                  target_audience: str = "general_public") -> str:
        """
        Generate risk communication messages
        
        Args:
            risk_data: Risk information
            target_audience: Target audience for communication
            
        Returns:
            Risk communication message
        """
        prompt = f"""
        Create a risk communication message for {target_audience}:
        
        Risk Level: {risk_data.get('risk_level', 'medium')}
        Key Concerns: {', '.join(risk_data.get('concerns', []))}
        Recommended Actions: {', '.join(risk_data.get('actions', []))}
        
        Message (clear, actionable, and reassuring):
        """
        
        return self._generate_text(prompt, max_length=200)
    
    def _generate_text(self, prompt: str, max_length: int = 200) -> str:
        """Generate text using the LLM"""
        if not self.generator:
            return "LLM not available for text generation"
        
        try:
            # Generate text
            result = self.generator(
                prompt,
                max_length=len(prompt.split()) + max_length,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            # Extract generated text
            generated_text = result[0]['generated_text']
            
            # Remove the prompt from the result
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            
            return generated_text
            
        except Exception as e:
            logger.error(f"Error in text generation: {e}")
            return "Error generating text response"
    
    def _post_process_explanation(self, text: str, audience: str) -> str:
        """Post-process generated text for clarity"""
        # Remove incomplete sentences
        sentences = text.split('.')
        complete_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        # Rejoin sentences
        processed_text = '. '.join(complete_sentences)
        
        # Add period if missing
        if processed_text and not processed_text.endswith('.'):
            processed_text += '.'
        
        return processed_text
    
    def _categorize_severity(self, severity_score: float) -> str:
        """Categorize severity score"""
        if severity_score >= 0.8:
            return "Critical"
        elif severity_score >= 0.6:
            return "High"
        elif severity_score >= 0.4:
            return "Moderate"
        else:
            return "Low"
    
    def _calculate_priority_level(self, outbreak_data: OutbreakData) -> str:
        """Calculate priority level for outbreak response"""
        priority_score = (
            outbreak_data.outbreak_probability * 0.4 +
            outbreak_data.severity_score * 0.3 +
            (1 - outbreak_data.healthcare_capacity) * 0.3
        )
        
        if priority_score >= 0.7:
            return "Critical"
        elif priority_score >= 0.5:
            return "High"
        else:
            return "Medium"
    
    def _extract_resource_number(self, text: str, resource_type: str) -> int:
        """Extract resource numbers from text"""
        pattern = rf"{resource_type}:?\s*(\d+(?:,\d+)*)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(',', ''))
        return 0
    
    def _extract_resource_text(self, text: str, resource_type: str) -> str:
        """Extract resource text descriptions"""
        lines = text.split('\n')
        for line in lines:
            if resource_type.lower() in line.lower():
                return line.split(':', 1)[-1].strip()
        return "Not specified"
    
    # Fallback methods for when LLM is not available
    def _generate_fallback_mutation_explanation(self, mutation_data: MutationData, 
                                              audience: str) -> str:
        """Generate simple rule-based explanation"""
        impact_desc = "significant" if mutation_data.impact_score > 0.7 else "moderate" if mutation_data.impact_score > 0.4 else "minor"
        
        explanation = f"Mutation {mutation_data.mutation_id} represents a {impact_desc} change to the virus. "
        
        if mutation_data.transmissibility_change > 0.1:
            explanation += "This mutation may increase how easily the virus spreads. "
        elif mutation_data.transmissibility_change < -0.1:
            explanation += "This mutation may decrease how easily the virus spreads. "
        
        if mutation_data.severity_change > 0.1:
            explanation += "The mutation might make the disease more severe."
        elif mutation_data.severity_change < -0.1:
            explanation += "The mutation might make the disease less severe."
        
        return explanation
    
    def _generate_fallback_outbreak_explanation(self, outbreak_data: OutbreakData, 
                                              audience: str) -> str:
        """Generate simple outbreak explanation"""
        prob_desc = "high" if outbreak_data.outbreak_probability > 0.7 else "moderate" if outbreak_data.outbreak_probability > 0.4 else "low"
        
        explanation = f"The outbreak risk for {outbreak_data.location} is {prob_desc} ({outbreak_data.outbreak_probability:.1%}). "
        explanation += f"If an outbreak occurs, it could affect up to {outbreak_data.population_at_risk:,} people "
        explanation += f"within approximately {outbreak_data.timeline_days} days. "
        
        if outbreak_data.healthcare_capacity < 0.5:
            explanation += "Healthcare capacity may be strained, requiring additional resources and planning."
        
        return explanation
    
    def _generate_fallback_plan(self, outbreak_data: OutbreakData) -> Dict:
        """Generate basic outbreak plan"""
        return {
            'plan_id': f"BASIC_PLAN_{outbreak_data.location.replace(' ', '_').upper()}",
            'location': outbreak_data.location,
            'generated_date': datetime.now().isoformat(),
            'plan_type': 'basic',
            'sections': {
                'executive_summary': f"Basic outbreak response plan for {outbreak_data.location}",
                'immediate_actions': [
                    "Activate surveillance systems",
                    "Prepare healthcare facilities",
                    "Communicate with public health authorities",
                    "Monitor situation closely"
                ],
                'resource_allocation': {
                    'priority': 'Ensure adequate healthcare capacity'
                }
            }
        }
    
    def _get_mutation_template(self) -> str:
        """Get template for mutation explanations"""
        return """
        Mutation Analysis Template:
        1. What changed in the virus
        2. Why this change matters
        3. Impact on transmission
        4. Impact on severity
        5. Implications for prevention/treatment
        """
    
    def _get_outbreak_planning_template(self) -> str:
        """Get template for outbreak planning"""
        return """
        Outbreak Plan Template:
        1. Executive Summary
        2. Risk Assessment
        3. Immediate Actions
        4. Resource Requirements
        5. Communication Strategy
        6. Monitoring Plan
        7. Contingency Measures
        """
    
    def _get_risk_communication_template(self) -> str:
        """Get template for risk communication"""
        return """
        Risk Communication Template:
        1. Current situation
        2. What we know/don't know
        3. What actions are being taken
        4. What individuals should do
        5. Where to get more information
        """
    
    def _get_policy_template(self) -> str:
        """Get template for policy recommendations"""
        return """
        Policy Recommendation Template:
        1. Problem statement
        2. Evidence base
        3. Recommended actions
        4. Implementation timeline
        5. Expected outcomes
        6. Monitoring metrics
        """

# Example usage and testing
if __name__ == "__main__":
    # Initialize explainer
    explainer = LLMExplainer()
    
    # Example mutation data
    mutation_data = MutationData(
        mutation_id="MUT_001",
        sequence_change="A23403G (D614G)",
        impact_score=0.7,
        transmissibility_change=0.3,
        severity_change=-0.1,
        affected_proteins=["Spike protein"],
        geographic_origin="Europe",
        detection_date="2024-01-15"
    )
    
    # Example outbreak data
    outbreak_data = OutbreakData(
        location="San Francisco",
        outbreak_probability=0.65,
        severity_score=0.4,
        timeline_days=21,
        population_at_risk=50000,
        risk_factors=[
            {'factor': 'population_density', 'risk_level': 'high'},
            {'factor': 'mobility_index', 'risk_level': 'medium'}
        ],
        healthcare_capacity=0.7
    )
    
    # Test mutation explanation
    print("=== Mutation Explanation ===")
    explanation = explainer.explain_mutation(mutation_data, audience="general")
    print(explanation)
    
    # Test outbreak explanation
    print("\n=== Outbreak Explanation ===")
    outbreak_explanation = explainer.explain_outbreak_prediction(outbreak_data)
    print(outbreak_explanation)
    
    # Test outbreak plan generation
    print("\n=== Outbreak Plan ===")
    plan = explainer.generate_outbreak_plan(outbreak_data)
    print(f"Plan ID: {plan['plan_id']}")
    print(f"Priority Level: {plan['key_metrics']['priority_level']}")
    print(f"Executive Summary: {plan['sections']['executive_summary']}")