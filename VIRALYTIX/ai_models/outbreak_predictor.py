"""
Outbreak Prediction Engine using Geo+Environmental data with Transformer models
This module provides functionality to predict viral outbreaks based on multiple data sources.
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from transformers import AutoModel, AutoTokenizer
from typing import List, Dict, Tuple, Optional, Union
import json
import logging
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import requests
import asyncio
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnvironmentalDataProcessor:
    """Processes environmental data for outbreak prediction"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_columns = [
            'temperature', 'humidity', 'precipitation', 'air_quality_index',
            'population_density', 'mobility_index', 'healthcare_capacity',
            'vaccination_rate', 'previous_outbreaks', 'seasonal_factor'
        ]
        
    def process_weather_data(self, weather_data: Dict) -> Dict:
        """Process weather data into features"""
        processed = {
            'temperature': weather_data.get('temperature', 20.0),
            'humidity': weather_data.get('humidity', 50.0),
            'precipitation': weather_data.get('precipitation', 0.0),
            'air_quality_index': weather_data.get('aqi', 100.0)
        }
        return processed
    
    def process_demographic_data(self, demo_data: Dict) -> Dict:
        """Process demographic data into features"""
        processed = {
            'population_density': demo_data.get('population_density', 1000.0),
            'mobility_index': demo_data.get('mobility_index', 0.5),
            'healthcare_capacity': demo_data.get('healthcare_capacity', 0.7),
            'vaccination_rate': demo_data.get('vaccination_rate', 0.6)
        }
        return processed
    
    def process_historical_data(self, historical_data: List[Dict]) -> Dict:
        """Process historical outbreak data"""
        if not historical_data:
            return {
                'previous_outbreaks': 0,
                'seasonal_factor': 0.5
            }
        
        # Count previous outbreaks in the last year
        current_time = datetime.now()
        recent_outbreaks = 0
        
        for outbreak in historical_data:
            outbreak_date = datetime.fromisoformat(outbreak.get('date', current_time.isoformat()))
            if (current_time - outbreak_date).days <= 365:
                recent_outbreaks += 1
        
        # Calculate seasonal factor based on current month
        month = current_time.month
        seasonal_factors = {
            12: 0.8, 1: 0.9, 2: 0.7,  # Winter - higher risk
            3: 0.6, 4: 0.5, 5: 0.4,   # Spring - moderate risk
            6: 0.3, 7: 0.3, 8: 0.4,   # Summer - lower risk
            9: 0.5, 10: 0.6, 11: 0.7  # Fall - increasing risk
        }
        
        processed = {
            'previous_outbreaks': recent_outbreaks,
            'seasonal_factor': seasonal_factors.get(month, 0.5)
        }
        
        return processed
    
    def create_feature_vector(self, location_data: Dict) -> np.ndarray:
        """Create feature vector from all data sources"""
        features = {}
        
        # Process different data types
        weather_features = self.process_weather_data(location_data.get('weather', {}))
        demo_features = self.process_demographic_data(location_data.get('demographics', {}))
        historical_features = self.process_historical_data(location_data.get('historical', []))
        
        # Combine all features
        features.update(weather_features)
        features.update(demo_features)
        features.update(historical_features)
        
        # Create feature vector in consistent order
        feature_vector = np.array([features.get(col, 0.0) for col in self.feature_columns])
        
        return feature_vector

class TransformerOutbreakModel(nn.Module):
    """Transformer-based model for outbreak prediction"""
    
    def __init__(self, input_dim=10, d_model=128, nhead=8, num_layers=4, dropout=0.1):
        super(TransformerOutbreakModel, self).__init__()
        
        self.input_projection = nn.Linear(input_dim, d_model)
        self.positional_encoding = nn.Parameter(torch.randn(1000, d_model))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dropout=dropout,
            batch_first=True
        )
        
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers
        )
        
        self.output_layers = nn.Sequential(
            nn.Linear(d_model, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 3)  # [outbreak_probability, severity_score, timeline_days]
        )
        
    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_dim)
        batch_size, seq_len, _ = x.shape
        
        # Project input to model dimension
        x = self.input_projection(x)
        
        # Add positional encoding
        x = x + self.positional_encoding[:seq_len, :].unsqueeze(0)
        
        # Apply transformer
        transformer_output = self.transformer_encoder(x)
        
        # Use the last token for prediction
        last_output = transformer_output[:, -1, :]
        
        # Generate predictions
        predictions = self.output_layers(last_output)
        
        return predictions

class OutbreakPredictor:
    """Main class for outbreak prediction"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.data_processor = EnvironmentalDataProcessor()
        self.transformer_model = TransformerOutbreakModel()
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Move model to device
        self.transformer_model.to(self.device)
        
        # Load pre-trained models if available
        if model_path:
            self.load_model(model_path)
        
        # Initialize with some basic training data
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize models with synthetic training data"""
        # Generate synthetic training data
        synthetic_data = self._generate_synthetic_training_data(1000)
        
        # Train Random Forest model
        X = np.array([data['features'] for data in synthetic_data])
        y_outbreak = np.array([data['outbreak_probability'] for data in synthetic_data])
        y_severity = np.array([data['severity_score'] for data in synthetic_data])
        y_timeline = np.array([data['timeline_days'] for data in synthetic_data])
        
        # Train separate models for each prediction target
        self.rf_outbreak = RandomForestRegressor(n_estimators=100, random_state=42)
        self.rf_severity = RandomForestRegressor(n_estimators=100, random_state=43)
        self.rf_timeline = RandomForestRegressor(n_estimators=100, random_state=44)
        
        self.rf_outbreak.fit(X, y_outbreak)
        self.rf_severity.fit(X, y_severity)
        self.rf_timeline.fit(X, y_timeline)
        
        logger.info("Models initialized with synthetic training data")
    
    def _generate_synthetic_training_data(self, num_samples: int) -> List[Dict]:
        """Generate synthetic training data for model initialization"""
        synthetic_data = []
        
        for _ in range(num_samples):
            # Generate random features
            features = np.random.rand(len(self.data_processor.feature_columns))
            
            # Create realistic relationships
            temp_factor = (features[0] - 0.5) * 0.3  # Temperature effect
            humidity_factor = (features[1] - 0.5) * 0.2  # Humidity effect
            density_factor = features[4] * 0.4  # Population density effect
            mobility_factor = features[5] * 0.3  # Mobility effect
            healthcare_factor = (1 - features[6]) * 0.2  # Healthcare capacity (inverse)
            vaccination_factor = (1 - features[7]) * 0.5  # Vaccination rate (inverse)
            historical_factor = features[8] * 0.3  # Previous outbreaks
            seasonal_factor = features[9] * 0.2  # Seasonal effect
            
            # Calculate outbreak probability
            outbreak_prob = np.clip(
                0.1 + temp_factor + humidity_factor + density_factor + 
                mobility_factor + healthcare_factor + vaccination_factor + 
                historical_factor + seasonal_factor + np.random.normal(0, 0.1),
                0, 1
            )
            
            # Calculate severity (correlated with outbreak probability)
            severity = np.clip(
                outbreak_prob * 0.8 + np.random.normal(0, 0.1),
                0, 1
            )
            
            # Calculate timeline (inversely correlated with outbreak probability)
            timeline = np.clip(
                30 + (1 - outbreak_prob) * 60 + np.random.normal(0, 10),
                7, 180
            )
            
            synthetic_data.append({
                'features': features,
                'outbreak_probability': outbreak_prob,
                'severity_score': severity,
                'timeline_days': timeline
            })
        
        return synthetic_data
    
    async def predict_outbreak(self, location_data: Dict, 
                             prediction_horizon: int = 30) -> Dict:
        """
        Predict outbreak probability for a given location
        
        Args:
            location_data: Dictionary containing location and environmental data
            prediction_horizon: Number of days to predict ahead
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Process input data
            feature_vector = self.data_processor.create_feature_vector(location_data)
            
            # Get predictions from Random Forest models
            rf_outbreak_prob = self.rf_outbreak.predict([feature_vector])[0]
            rf_severity = self.rf_severity.predict([feature_vector])[0]
            rf_timeline = self.rf_timeline.predict([feature_vector])[0]
            
            # Get predictions from Transformer model
            transformer_input = torch.tensor(
                feature_vector.reshape(1, 1, -1), 
                dtype=torch.float32
            ).to(self.device)
            
            with torch.no_grad():
                transformer_predictions = self.transformer_model(transformer_input)
                transformer_predictions = transformer_predictions.cpu().numpy()[0]
            
            # Ensemble predictions
            outbreak_probability = np.clip(
                (rf_outbreak_prob + torch.sigmoid(torch.tensor(transformer_predictions[0])).item()) / 2,
                0, 1
            )
            
            severity_score = np.clip(
                (rf_severity + torch.sigmoid(torch.tensor(transformer_predictions[1])).item()) / 2,
                0, 1
            )
            
            timeline_days = max(
                7, 
                int((rf_timeline + max(7, transformer_predictions[2])) / 2)
            )
            
            # Calculate confidence intervals
            confidence_intervals = self._calculate_confidence_intervals(
                feature_vector, outbreak_probability, severity_score, timeline_days
            )
            
            # Generate risk factors
            risk_factors = self._analyze_risk_factors(feature_vector, location_data)
            
            # Create prediction result
            prediction_result = {
                'location': location_data.get('location', 'Unknown'),
                'prediction_date': datetime.now().isoformat(),
                'prediction_horizon_days': prediction_horizon,
                'outbreak_probability': float(outbreak_probability),
                'severity_score': float(severity_score),
                'estimated_timeline_days': int(timeline_days),
                'confidence_intervals': confidence_intervals,
                'risk_factors': risk_factors,
                'model_ensemble': {
                    'random_forest': {
                        'outbreak_prob': float(rf_outbreak_prob),
                        'severity': float(rf_severity),
                        'timeline': float(rf_timeline)
                    },
                    'transformer': {
                        'outbreak_prob': float(torch.sigmoid(torch.tensor(transformer_predictions[0])).item()),
                        'severity': float(torch.sigmoid(torch.tensor(transformer_predictions[1])).item()),
                        'timeline': float(transformer_predictions[2])
                    }
                }
            }
            
            return prediction_result
            
        except Exception as e:
            logger.error(f"Error in outbreak prediction: {e}")
            return {
                'error': str(e),
                'location': location_data.get('location', 'Unknown'),
                'prediction_date': datetime.now().isoformat()
            }
    
    def _calculate_confidence_intervals(self, features: np.ndarray, 
                                      outbreak_prob: float, 
                                      severity: float, 
                                      timeline: int) -> Dict:
        """Calculate confidence intervals for predictions"""
        # Simple confidence interval calculation based on feature uncertainty
        feature_std = np.std(features)
        uncertainty_factor = min(0.3, feature_std * 2)
        
        return {
            'outbreak_probability': {
                'lower': max(0, outbreak_prob - uncertainty_factor),
                'upper': min(1, outbreak_prob + uncertainty_factor)
            },
            'severity_score': {
                'lower': max(0, severity - uncertainty_factor),
                'upper': min(1, severity + uncertainty_factor)
            },
            'timeline_days': {
                'lower': max(7, int(timeline - timeline * uncertainty_factor)),
                'upper': int(timeline + timeline * uncertainty_factor)
            }
        }
    
    def _analyze_risk_factors(self, features: np.ndarray, location_data: Dict) -> List[Dict]:
        """Analyze and rank risk factors"""
        risk_factors = []
        feature_names = self.data_processor.feature_columns
        
        for i, (feature_name, feature_value) in enumerate(zip(feature_names, features)):
            # Determine risk level based on feature value and type
            if feature_name in ['temperature', 'humidity', 'population_density', 
                              'mobility_index', 'previous_outbreaks', 'seasonal_factor']:
                # Higher values increase risk
                risk_level = 'high' if feature_value > 0.7 else 'medium' if feature_value > 0.4 else 'low'
                impact = feature_value
            else:
                # Lower values increase risk (healthcare_capacity, vaccination_rate)
                risk_level = 'high' if feature_value < 0.3 else 'medium' if feature_value < 0.6 else 'low'
                impact = 1 - feature_value
            
            risk_factors.append({
                'factor': feature_name,
                'value': float(feature_value),
                'risk_level': risk_level,
                'impact_score': float(impact),
                'description': self._get_risk_factor_description(feature_name, feature_value)
            })
        
        # Sort by impact score
        risk_factors.sort(key=lambda x: x['impact_score'], reverse=True)
        
        return risk_factors[:5]  # Return top 5 risk factors
    
    def _get_risk_factor_description(self, factor_name: str, value: float) -> str:
        """Get human-readable description of risk factors"""
        descriptions = {
            'temperature': f"Temperature conditions ({'favorable for transmission' if value > 0.6 else 'less favorable'})",
            'humidity': f"Humidity levels ({'high' if value > 0.7 else 'moderate' if value > 0.4 else 'low'})",
            'precipitation': f"Precipitation ({'high' if value > 0.7 else 'moderate' if value > 0.4 else 'low'})",
            'air_quality_index': f"Air quality ({'poor' if value > 0.7 else 'moderate' if value > 0.4 else 'good'})",
            'population_density': f"Population density ({'very high' if value > 0.8 else 'high' if value > 0.6 else 'moderate'})",
            'mobility_index': f"Population mobility ({'high' if value > 0.7 else 'moderate' if value > 0.4 else 'low'})",
            'healthcare_capacity': f"Healthcare capacity ({'limited' if value < 0.3 else 'adequate' if value < 0.7 else 'good'})",
            'vaccination_rate': f"Vaccination coverage ({'low' if value < 0.4 else 'moderate' if value < 0.7 else 'high'})",
            'previous_outbreaks': f"Historical outbreaks ({'frequent' if value > 0.7 else 'occasional' if value > 0.3 else 'rare'})",
            'seasonal_factor': f"Seasonal risk ({'high season' if value > 0.7 else 'moderate season' if value > 0.4 else 'low season'})"
        }
        
        return descriptions.get(factor_name, f"{factor_name}: {value:.2f}")
    
    async def predict_multiple_locations(self, locations_data: List[Dict]) -> List[Dict]:
        """Predict outbreaks for multiple locations"""
        predictions = []
        
        for location_data in locations_data:
            prediction = await self.predict_outbreak(location_data)
            predictions.append(prediction)
        
        return predictions
    
    def generate_outbreak_scenarios(self, location_data: Dict, 
                                  num_scenarios: int = 3) -> List[Dict]:
        """Generate multiple outbreak scenarios with different assumptions"""
        scenarios = []
        base_features = self.data_processor.create_feature_vector(location_data)
        
        scenario_modifications = [
            {'name': 'Best Case', 'mobility_factor': 0.7, 'vaccination_factor': 1.2},
            {'name': 'Most Likely', 'mobility_factor': 1.0, 'vaccination_factor': 1.0},
            {'name': 'Worst Case', 'mobility_factor': 1.3, 'vaccination_factor': 0.8}
        ]
        
        for i, modification in enumerate(scenario_modifications[:num_scenarios]):
            modified_features = base_features.copy()
            
            # Apply modifications
            if 'mobility_factor' in modification:
                modified_features[5] *= modification['mobility_factor']  # mobility_index
            if 'vaccination_factor' in modification:
                modified_features[7] *= modification['vaccination_factor']  # vaccination_rate
            
            # Clip values to valid range
            modified_features = np.clip(modified_features, 0, 1)
            
            # Create modified location data
            modified_location_data = location_data.copy()
            
            # Get prediction for modified scenario
            # We'll use synchronous prediction for scenarios
            feature_vector = modified_features
            
            rf_outbreak_prob = self.rf_outbreak.predict([feature_vector])[0]
            rf_severity = self.rf_severity.predict([feature_vector])[0]
            rf_timeline = self.rf_timeline.predict([feature_vector])[0]
            
            scenario = {
                'scenario_name': modification['name'],
                'scenario_id': f"SCENARIO_{i+1:02d}",
                'outbreak_probability': float(np.clip(rf_outbreak_prob, 0, 1)),
                'severity_score': float(np.clip(rf_severity, 0, 1)),
                'estimated_timeline_days': int(max(7, rf_timeline)),
                'modifications': modification,
                'description': self._generate_scenario_description(modification, rf_outbreak_prob)
            }
            
            scenarios.append(scenario)
        
        return scenarios
    
    def _generate_scenario_description(self, modification: Dict, outbreak_prob: float) -> str:
        """Generate description for outbreak scenario"""
        descriptions = {
            'Best Case': f"Assuming improved public health measures and high compliance. Outbreak probability: {outbreak_prob:.1%}",
            'Most Likely': f"Based on current trends and typical response patterns. Outbreak probability: {outbreak_prob:.1%}",
            'Worst Case': f"Assuming limited intervention and high transmission conditions. Outbreak probability: {outbreak_prob:.1%}"
        }
        
        return descriptions.get(modification['name'], f"Custom scenario with outbreak probability: {outbreak_prob:.1%}")
    
    def save_model(self, path: str):
        """Save the trained models"""
        torch.save({
            'transformer_state_dict': self.transformer_model.state_dict(),
            'data_processor': self.data_processor
        }, path)
        logger.info(f"Models saved to {path}")
    
    def load_model(self, path: str):
        """Load trained models"""
        try:
            checkpoint = torch.load(path, map_location=self.device)
            self.transformer_model.load_state_dict(checkpoint['transformer_state_dict'])
            self.data_processor = checkpoint['data_processor']
            logger.info(f"Models loaded from {path}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")

# Example usage and testing
if __name__ == "__main__":
    # Initialize predictor
    predictor = OutbreakPredictor()
    
    # Example location data
    location_data = {
        'location': 'New York City',
        'coordinates': {'lat': 40.7128, 'lon': -74.0060},
        'weather': {
            'temperature': 22.0,
            'humidity': 65.0,
            'precipitation': 2.5,
            'aqi': 85.0
        },
        'demographics': {
            'population_density': 0.8,
            'mobility_index': 0.7,
            'healthcare_capacity': 0.6,
            'vaccination_rate': 0.75
        },
        'historical': [
            {'date': '2023-01-15', 'outbreak_type': 'flu'},
            {'date': '2023-06-20', 'outbreak_type': 'covid'}
        ]
    }
    
    # Run prediction
    async def test_prediction():
        print("Predicting outbreak for New York City...")
        prediction = await predictor.predict_outbreak(location_data)
        
        print(f"\n--- Outbreak Prediction Results ---")
        print(f"Location: {prediction['location']}")
        print(f"Outbreak Probability: {prediction['outbreak_probability']:.1%}")
        print(f"Severity Score: {prediction['severity_score']:.3f}")
        print(f"Estimated Timeline: {prediction['estimated_timeline_days']} days")
        
        print(f"\n--- Top Risk Factors ---")
        for factor in prediction['risk_factors']:
            print(f"- {factor['factor']}: {factor['description']} (Impact: {factor['impact_score']:.3f})")
        
        # Generate scenarios
        print(f"\n--- Outbreak Scenarios ---")
        scenarios = predictor.generate_outbreak_scenarios(location_data)
        for scenario in scenarios:
            print(f"- {scenario['scenario_name']}: {scenario['description']}")
    
    # Run the test
    asyncio.run(test_prediction())