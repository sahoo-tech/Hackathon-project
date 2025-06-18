"""
AI-Powered Mutation Simulator using BioGPT and LSTM models
This module provides functionality to simulate viral mutations and predict mutation patterns.
"""

import torch
import torch.nn as nn
import numpy as np
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import List, Dict, Tuple, Optional
import json
import logging
from datetime import datetime, timedelta
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ViralSequenceEncoder:
    """Encodes viral sequences for ML processing"""
    
    def __init__(self):
        self.nucleotide_to_idx = {'A': 0, 'T': 1, 'G': 2, 'C': 3, 'N': 4}
        self.idx_to_nucleotide = {v: k for k, v in self.nucleotide_to_idx.items()}
        
    def encode_sequence(self, sequence: str) -> List[int]:
        """Convert nucleotide sequence to numerical representation"""
        return [self.nucleotide_to_idx.get(nuc.upper(), 4) for nuc in sequence]
    
    def decode_sequence(self, encoded: List[int]) -> str:
        """Convert numerical representation back to nucleotide sequence"""
        return ''.join([self.idx_to_nucleotide[idx] for idx in encoded])

class MutationLSTM(nn.Module):
    """LSTM model for predicting mutation patterns"""
    
    def __init__(self, vocab_size=5, embedding_dim=64, hidden_dim=128, num_layers=2, dropout=0.2):
        super(MutationLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers, 
                           batch_first=True, dropout=dropout)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        
    def forward(self, x, hidden=None):
        embedded = self.embedding(x)
        lstm_out, hidden = self.lstm(embedded, hidden)
        lstm_out = self.dropout(lstm_out)
        output = self.fc(lstm_out)
        return output, hidden

class MutationSimulator:
    """Main class for viral mutation simulation"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.encoder = ViralSequenceEncoder()
        self.lstm_model = MutationLSTM()
        self.biogpt_tokenizer = None
        self.biogpt_model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load pre-trained models if available
        if model_path:
            self.load_model(model_path)
        
        # Initialize BioGPT (if available)
        self._initialize_biogpt()
        
    def _initialize_biogpt(self):
        """Initialize BioGPT model for biological text generation"""
        try:
            # Using a smaller model for demonstration - replace with BioGPT when available
            self.biogpt_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
            self.biogpt_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")
            self.biogpt_model.to(self.device)
            logger.info("BioGPT model initialized successfully")
        except Exception as e:
            logger.warning(f"Could not initialize BioGPT: {e}")
            self.biogpt_tokenizer = None
            self.biogpt_model = None
    
    def simulate_mutations(self, base_sequence: str, num_mutations: int = 5, 
                          mutation_rate: float = 0.001) -> List[Dict]:
        """
        Simulate viral mutations based on base sequence
        
        Args:
            base_sequence: Original viral sequence
            num_mutations: Number of mutations to simulate
            mutation_rate: Probability of mutation per nucleotide
            
        Returns:
            List of mutation dictionaries with details
        """
        mutations = []
        current_sequence = base_sequence
        
        for i in range(num_mutations):
            # Simulate time progression
            mutation_time = datetime.now() + timedelta(days=i*7)
            
            # Generate mutation
            mutated_sequence, mutation_info = self._generate_mutation(
                current_sequence, mutation_rate
            )
            
            # Calculate mutation impact score
            impact_score = self._calculate_mutation_impact(
                current_sequence, mutated_sequence
            )
            
            mutation_data = {
                'mutation_id': f"MUT_{i+1:03d}",
                'timestamp': mutation_time.isoformat(),
                'original_sequence': current_sequence,
                'mutated_sequence': mutated_sequence,
                'mutation_positions': mutation_info['positions'],
                'mutation_types': mutation_info['types'],
                'impact_score': impact_score,
                'transmissibility_change': self._predict_transmissibility_change(impact_score),
                'severity_change': self._predict_severity_change(impact_score)
            }
            
            mutations.append(mutation_data)
            current_sequence = mutated_sequence
            
        return mutations
    
    def _generate_mutation(self, sequence: str, mutation_rate: float) -> Tuple[str, Dict]:
        """Generate a single mutation in the sequence"""
        sequence_list = list(sequence)
        mutation_positions = []
        mutation_types = []
        
        for i, nucleotide in enumerate(sequence_list):
            if random.random() < mutation_rate:
                # Types of mutations: substitution, insertion, deletion
                mutation_type = random.choice(['substitution', 'insertion', 'deletion'])
                
                if mutation_type == 'substitution':
                    new_nucleotide = random.choice(['A', 'T', 'G', 'C'])
                    while new_nucleotide == nucleotide:
                        new_nucleotide = random.choice(['A', 'T', 'G', 'C'])
                    sequence_list[i] = new_nucleotide
                    
                elif mutation_type == 'insertion':
                    new_nucleotide = random.choice(['A', 'T', 'G', 'C'])
                    sequence_list.insert(i, new_nucleotide)
                    
                elif mutation_type == 'deletion' and len(sequence_list) > 1:
                    sequence_list.pop(i)
                
                mutation_positions.append(i)
                mutation_types.append(mutation_type)
        
        mutated_sequence = ''.join(sequence_list)
        mutation_info = {
            'positions': mutation_positions,
            'types': mutation_types
        }
        
        return mutated_sequence, mutation_info
    
    def _calculate_mutation_impact(self, original: str, mutated: str) -> float:
        """Calculate the impact score of mutations"""
        if len(original) == 0:
            return 1.0
        
        # Simple Hamming distance-based impact calculation
        min_len = min(len(original), len(mutated))
        differences = sum(1 for i in range(min_len) if original[i] != mutated[i])
        length_diff = abs(len(original) - len(mutated))
        
        total_changes = differences + length_diff
        impact_score = total_changes / max(len(original), len(mutated))
        
        return min(impact_score, 1.0)
    
    def _predict_transmissibility_change(self, impact_score: float) -> float:
        """Predict change in transmissibility based on mutation impact"""
        # Simplified model - in reality this would be much more complex
        base_change = (impact_score - 0.5) * 0.2
        noise = random.uniform(-0.1, 0.1)
        return max(-1.0, min(1.0, base_change + noise))
    
    def _predict_severity_change(self, impact_score: float) -> float:
        """Predict change in severity based on mutation impact"""
        # Simplified model - in reality this would be much more complex
        base_change = (impact_score - 0.5) * 0.15
        noise = random.uniform(-0.08, 0.08)
        return max(-1.0, min(1.0, base_change + noise))
    
    def predict_next_mutations(self, sequence_history: List[str], 
                             num_predictions: int = 3) -> List[Dict]:
        """
        Use LSTM to predict likely next mutations
        
        Args:
            sequence_history: List of historical sequences
            num_predictions: Number of future mutations to predict
            
        Returns:
            List of predicted mutation scenarios
        """
        if len(sequence_history) < 2:
            logger.warning("Insufficient sequence history for prediction")
            return []
        
        # Encode sequences
        encoded_sequences = [self.encoder.encode_sequence(seq) for seq in sequence_history]
        
        # Prepare input tensor
        max_len = max(len(seq) for seq in encoded_sequences)
        padded_sequences = []
        
        for seq in encoded_sequences:
            padded = seq + [4] * (max_len - len(seq))  # Pad with 'N'
            padded_sequences.append(padded)
        
        input_tensor = torch.tensor(padded_sequences, dtype=torch.long).to(self.device)
        
        predictions = []
        
        with torch.no_grad():
            for i in range(num_predictions):
                # Get model prediction
                output, _ = self.lstm_model(input_tensor)
                
                # Generate prediction based on output probabilities
                last_output = output[-1, -1, :]  # Last sequence, last position
                probabilities = torch.softmax(last_output, dim=0)
                
                # Sample next nucleotide
                next_nucleotide_idx = torch.multinomial(probabilities, 1).item()
                
                # Create predicted mutation
                base_sequence = sequence_history[-1]
                predicted_sequence = self._apply_predicted_mutation(
                    base_sequence, next_nucleotide_idx
                )
                
                prediction = {
                    'prediction_id': f"PRED_{i+1:03d}",
                    'confidence': float(probabilities[next_nucleotide_idx]),
                    'predicted_sequence': predicted_sequence,
                    'mutation_probability': self._calculate_mutation_probability(
                        base_sequence, predicted_sequence
                    ),
                    'estimated_timeline': f"{(i+1)*14} days"
                }
                
                predictions.append(prediction)
        
        return predictions
    
    def _apply_predicted_mutation(self, base_sequence: str, nucleotide_idx: int) -> str:
        """Apply predicted mutation to base sequence"""
        if len(base_sequence) == 0:
            return self.encoder.idx_to_nucleotide[nucleotide_idx]
        
        # Simple mutation application - replace random position
        position = random.randint(0, len(base_sequence) - 1)
        sequence_list = list(base_sequence)
        sequence_list[position] = self.encoder.idx_to_nucleotide[nucleotide_idx]
        
        return ''.join(sequence_list)
    
    def _calculate_mutation_probability(self, original: str, predicted: str) -> float:
        """Calculate probability of predicted mutation occurring"""
        impact = self._calculate_mutation_impact(original, predicted)
        # Higher impact mutations are generally less likely
        probability = max(0.1, 1.0 - impact * 0.8)
        return probability
    
    def generate_mutation_explanation(self, mutation_data: Dict) -> str:
        """
        Generate human-readable explanation of mutation using LLM
        
        Args:
            mutation_data: Dictionary containing mutation information
            
        Returns:
            Human-readable explanation of the mutation
        """
        if not self.biogpt_model or not self.biogpt_tokenizer:
            return self._generate_simple_explanation(mutation_data)
        
        try:
            # Create prompt for LLM
            prompt = f"""
            Viral mutation analysis:
            - Mutation ID: {mutation_data['mutation_id']}
            - Impact Score: {mutation_data['impact_score']:.3f}
            - Positions affected: {len(mutation_data['mutation_positions'])}
            - Transmissibility change: {mutation_data['transmissibility_change']:+.3f}
            - Severity change: {mutation_data['severity_change']:+.3f}
            
            Explain this mutation in simple terms:
            """
            
            # Tokenize and generate
            inputs = self.biogpt_tokenizer.encode(prompt, return_tensors='pt').to(self.device)
            
            with torch.no_grad():
                outputs = self.biogpt_model.generate(
                    inputs,
                    max_length=inputs.shape[1] + 100,
                    num_return_sequences=1,
                    temperature=0.7,
                    pad_token_id=self.biogpt_tokenizer.eos_token_id
                )
            
            explanation = self.biogpt_tokenizer.decode(outputs[0], skip_special_tokens=True)
            return explanation[len(prompt):].strip()
            
        except Exception as e:
            logger.error(f"Error generating LLM explanation: {e}")
            return self._generate_simple_explanation(mutation_data)
    
    def _generate_simple_explanation(self, mutation_data: Dict) -> str:
        """Generate simple rule-based explanation"""
        impact = mutation_data['impact_score']
        transmissibility = mutation_data['transmissibility_change']
        severity = mutation_data['severity_change']
        
        explanation = f"Mutation {mutation_data['mutation_id']} shows "
        
        if impact < 0.1:
            explanation += "minimal changes to the viral structure. "
        elif impact < 0.3:
            explanation += "moderate changes to the viral structure. "
        else:
            explanation += "significant changes to the viral structure. "
        
        if transmissibility > 0.1:
            explanation += "This mutation may increase transmissibility. "
        elif transmissibility < -0.1:
            explanation += "This mutation may decrease transmissibility. "
        else:
            explanation += "Transmissibility appears largely unchanged. "
        
        if severity > 0.1:
            explanation += "The mutation might increase disease severity."
        elif severity < -0.1:
            explanation += "The mutation might decrease disease severity."
        else:
            explanation += "Disease severity appears largely unchanged."
        
        return explanation
    
    def save_model(self, path: str):
        """Save the trained LSTM model"""
        torch.save({
            'model_state_dict': self.lstm_model.state_dict(),
            'encoder': self.encoder
        }, path)
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load a trained LSTM model"""
        try:
            checkpoint = torch.load(path, map_location=self.device)
            self.lstm_model.load_state_dict(checkpoint['model_state_dict'])
            self.encoder = checkpoint['encoder']
            logger.info(f"Model loaded from {path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")

# Example usage and testing
if __name__ == "__main__":
    # Initialize simulator
    simulator = MutationSimulator()
    
    # Example viral sequence (simplified)
    base_sequence = "ATGCGATCGATCGATCGATCGATCGATCG"
    
    # Simulate mutations
    print("Simulating viral mutations...")
    mutations = simulator.simulate_mutations(base_sequence, num_mutations=3)
    
    for mutation in mutations:
        print(f"\n--- {mutation['mutation_id']} ---")
        print(f"Impact Score: {mutation['impact_score']:.3f}")
        print(f"Transmissibility Change: {mutation['transmissibility_change']:+.3f}")
        print(f"Severity Change: {mutation['severity_change']:+.3f}")
        
        # Generate explanation
        explanation = simulator.generate_mutation_explanation(mutation)
        print(f"Explanation: {explanation}")
    
    # Predict future mutations
    print("\n\nPredicting future mutations...")
    sequence_history = [base_sequence] + [m['mutated_sequence'] for m in mutations]
    predictions = simulator.predict_next_mutations(sequence_history)
    
    for prediction in predictions:
        print(f"\n--- {prediction['prediction_id']} ---")
        print(f"Confidence: {prediction['confidence']:.3f}")
        print(f"Mutation Probability: {prediction['mutation_probability']:.3f}")
        print(f"Estimated Timeline: {prediction['estimated_timeline']}")