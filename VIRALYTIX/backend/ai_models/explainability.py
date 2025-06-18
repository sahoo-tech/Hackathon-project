import numpy as np
import pandas as pd
from datetime import datetime
import logging
import json
import random

logger = logging.getLogger(__name__)

class SHAPExplainer:
    """
    A class that provides SHAP (SHapley Additive exPlanations) values
    for model predictions to explain why certain alerts or predictions were made.
    """
    def __init__(self):
        logger.info("Initialized SHAPExplainer")
        
    def explain_prediction(self, features, prediction, feature_names=None):
        """
        Generate SHAP values to explain a prediction.
        
        Args:
            features: The input features used for the prediction
            prediction: The model's prediction
            feature_names: Names of the features (optional)
            
        Returns:
            A dictionary containing SHAP values and explanation
        """
        # In a real implementation, we would use the SHAP library
        # For now, we'll simulate SHAP values
        
        # If feature_names not provided, generate generic names
        if feature_names is None:
            feature_names = [f"feature_{i}" for i in range(len(features))]
            
        # Generate random SHAP values (in a real implementation, these would be calculated)
        shap_values = np.random.normal(0, 0.1, len(features))
        
        # Make sure the sum is close to the prediction value (simplified)
        base_value = prediction * 0.2  # Base value (average prediction)
        scaling_factor = (prediction - base_value) / np.sum(shap_values)
        shap_values = shap_values * scaling_factor
        
        # Create a dictionary of feature names and their SHAP values
        feature_contributions = {
            name: float(value) for name, value in zip(feature_names, shap_values)
        }
        
        # Sort by absolute contribution
        sorted_contributions = sorted(
            feature_contributions.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        # Generate explanation
        explanation = {
            "base_value": float(base_value),
            "prediction": float(prediction),
            "feature_contributions": feature_contributions,
            "top_contributors": sorted_contributions[:5],
            "timestamp": datetime.now().isoformat()
        }
        
        return explanation
    
    def explain_alert(self, alert_data):
        """
        Generate an explanation for why an alert was triggered.
        
        Args:
            alert_data: Data related to the alert
            
        Returns:
            A dictionary containing the explanation
        """
        # Extract relevant information from alert data
        alert_type = alert_data.get("alert_type", "unknown")
        risk_score = alert_data.get("risk_score", 0.5)
        
        # Generate explanation based on alert type
        if alert_type == "mutation":
            return self._explain_mutation_alert(alert_data, risk_score)
        elif alert_type == "outbreak":
            return self._explain_outbreak_alert(alert_data, risk_score)
        elif alert_type == "sensor":
            return self._explain_sensor_alert(alert_data, risk_score)
        else:
            return self._explain_generic_alert(alert_data, risk_score)
    
    def _explain_mutation_alert(self, alert_data, risk_score):
        """Generate explanation for mutation alerts"""
        mutation_type = alert_data.get("mutation_type", "unknown")
        location = alert_data.get("location", {})
        
        # Factors that contributed to the alert (simulated)
        factors = [
            {"name": "Mutation novelty", "contribution": random.uniform(0.1, 0.3)},
            {"name": "Similarity to known dangerous mutations", "contribution": random.uniform(0.1, 0.4)},
            {"name": "Affected protein region", "contribution": random.uniform(0.05, 0.2)},
            {"name": "Geographical spread potential", "contribution": random.uniform(0.05, 0.15)},
            {"name": "Population density in affected area", "contribution": random.uniform(0.05, 0.1)}
        ]
        
        # Normalize contributions to sum to risk_score
        total_contribution = sum(f["contribution"] for f in factors)
        for factor in factors:
            factor["contribution"] = factor["contribution"] / total_contribution * risk_score
            
        return {
            "alert_type": "mutation",
            "risk_score": risk_score,
            "mutation_type": mutation_type,
            "location": location,
            "contributing_factors": factors,
            "explanation": f"This mutation alert was triggered primarily due to its novelty and similarity to known dangerous mutations. The mutation affects a critical region of the {mutation_type} which has been associated with increased transmissibility.",
            "timestamp": datetime.now().isoformat()
        }
    
    def _explain_outbreak_alert(self, alert_data, risk_score):
        """Generate explanation for outbreak alerts"""
        outbreak_type = alert_data.get("outbreak_type", "unknown")
        location = alert_data.get("location", {})
        
        # Factors that contributed to the alert (simulated)
        factors = [
            {"name": "Case growth rate", "contribution": random.uniform(0.2, 0.4)},
            {"name": "Geographic spread", "contribution": random.uniform(0.1, 0.3)},
            {"name": "Healthcare capacity in region", "contribution": random.uniform(0.05, 0.15)},
            {"name": "Population mobility", "contribution": random.uniform(0.05, 0.2)},
            {"name": "Vaccination rate in area", "contribution": random.uniform(0.05, 0.1)}
        ]
        
        # Normalize contributions to sum to risk_score
        total_contribution = sum(f["contribution"] for f in factors)
        for factor in factors:
            factor["contribution"] = factor["contribution"] / total_contribution * risk_score
            
        return {
            "alert_type": "outbreak",
            "risk_score": risk_score,
            "outbreak_type": outbreak_type,
            "location": location,
            "contributing_factors": factors,
            "explanation": f"This outbreak alert was triggered due to the rapid case growth rate and concerning geographic spread pattern. The {outbreak_type} outbreak is occurring in an area with limited healthcare capacity and high population mobility.",
            "timestamp": datetime.now().isoformat()
        }
    
    def _explain_sensor_alert(self, alert_data, risk_score):
        """Generate explanation for sensor alerts"""
        sensor_type = alert_data.get("sensor_type", "unknown")
        location = alert_data.get("location", {})
        
        # Factors that contributed to the alert (simulated)
        factors = [
            {"name": "Anomaly detection score", "contribution": random.uniform(0.2, 0.4)},
            {"name": "Deviation from baseline", "contribution": random.uniform(0.1, 0.3)},
            {"name": "Correlation with other sensors", "contribution": random.uniform(0.1, 0.2)},
            {"name": "Historical pattern matching", "contribution": random.uniform(0.05, 0.15)},
            {"name": "Environmental factors", "contribution": random.uniform(0.05, 0.1)}
        ]
        
        # Normalize contributions to sum to risk_score
        total_contribution = sum(f["contribution"] for f in factors)
        for factor in factors:
            factor["contribution"] = factor["contribution"] / total_contribution * risk_score
            
        return {
            "alert_type": "sensor",
            "risk_score": risk_score,
            "sensor_type": sensor_type,
            "location": location,
            "contributing_factors": factors,
            "explanation": f"This sensor alert was triggered by a significant anomaly detected by the {sensor_type} sensor network. The readings show a substantial deviation from the baseline and correlate with patterns from other nearby sensors.",
            "timestamp": datetime.now().isoformat()
        }
    
    def _explain_generic_alert(self, alert_data, risk_score):
        """Generate explanation for generic alerts"""
        # Factors that contributed to the alert (simulated)
        factors = [
            {"name": "Risk assessment algorithm", "contribution": random.uniform(0.2, 0.4)},
            {"name": "Data reliability", "contribution": random.uniform(0.1, 0.2)},
            {"name": "Pattern recognition", "contribution": random.uniform(0.1, 0.3)},
            {"name": "Historical comparison", "contribution": random.uniform(0.05, 0.15)},
            {"name": "Expert system rules", "contribution": random.uniform(0.05, 0.1)}
        ]
        
        # Normalize contributions to sum to risk_score
        total_contribution = sum(f["contribution"] for f in factors)
        for factor in factors:
            factor["contribution"] = factor["contribution"] / total_contribution * risk_score
            
        return {
            "alert_type": "generic",
            "risk_score": risk_score,
            "contributing_factors": factors,
            "explanation": "This alert was triggered based on a combination of risk factors identified by our monitoring systems. The pattern recognition algorithms detected an unusual combination of signals that warrant attention.",
            "timestamp": datetime.now().isoformat()
        }

class LIMEExplainer:
    """
    A class that provides LIME (Local Interpretable Model-agnostic Explanations)
    for model predictions.
    """
    def __init__(self):
        logger.info("Initialized LIMEExplainer")
        
    def explain_prediction(self, text_input, prediction, num_features=5):
        """
        Generate LIME explanation for text-based predictions.
        
        Args:
            text_input: The input text used for the prediction
            prediction: The model's prediction
            num_features: Number of features to include in explanation
            
        Returns:
            A dictionary containing LIME explanation
        """
        # In a real implementation, we would use the LIME library
        # For now, we'll simulate LIME explanations for text
        
        # Split text into words
        words = text_input.split()
        
        # Generate random importance scores for each word
        word_scores = {word: random.uniform(-1, 1) for word in set(words)}
        
        # Sort words by absolute importance
        sorted_words = sorted(
            word_scores.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        # Get top contributing words
        top_words = sorted_words[:num_features]
        
        # Generate explanation
        explanation = {
            "prediction": float(prediction),
            "text_input": text_input,
            "word_contributions": word_scores,
            "top_contributors": top_words,
            "explanation_text": "The highlighted words were most important for this prediction.",
            "timestamp": datetime.now().isoformat()
        }
        
        return explanation