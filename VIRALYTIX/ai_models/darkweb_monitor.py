"""
Dark Web Mutation Surveillance LLM
This module monitors dark web sources for viral mutation information and bioterrorism threats.
"""

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from typing import List, Dict, Optional, Tuple, Set
import json
import logging
from datetime import datetime, timedelta
import re
import hashlib
import asyncio
import aiohttp
from dataclasses import dataclass
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ThreatIntelligence:
    """Data structure for threat intelligence"""
    threat_id: str
    source: str
    content: str
    threat_level: str
    confidence_score: float
    keywords: List[str]
    timestamp: str
    geographic_indicators: List[str]
    mutation_references: List[str]

@dataclass
class SurveillanceAlert:
    """Data structure for surveillance alerts"""
    alert_id: str
    alert_type: str
    severity: str
    description: str
    evidence: List[str]
    recommended_actions: List[str]
    timestamp: str

class TextClassifier(nn.Module):
    """Neural network for classifying threat content"""
    
    def __init__(self, vocab_size=10000, embedding_dim=128, hidden_dim=256, num_classes=5):
        super(TextClassifier, self).__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Linear(hidden_dim * 2, num_classes)
        
    def forward(self, x):
        embedded = self.embedding(x)
        lstm_out, (hidden, _) = self.lstm(embedded)
        
        # Use the last hidden state
        final_hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        dropped = self.dropout(final_hidden)
        output = self.classifier(dropped)
        
        return output

class DarkWebMonitor:
    """Main class for dark web surveillance"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize models
        self._initialize_models()
        
        # Threat classification categories
        self.threat_categories = {
            0: "benign",
            1: "suspicious",
            2: "bioterrorism_discussion",
            3: "mutation_intelligence",
            4: "critical_threat"
        }
        
        # Keywords for different threat types
        self.threat_keywords = {
            'bioterrorism': [
                'bioweapon', 'biological weapon', 'engineered virus', 'weaponized',
                'bioterror', 'biological attack', 'pathogen release', 'viral weapon'
            ],
            'mutation': [
                'mutation', 'variant', 'strain', 'genetic modification', 'sequence',
                'spike protein', 'transmissibility', 'immune escape', 'evolution'
            ],
            'outbreak_planning': [
                'outbreak', 'pandemic', 'epidemic', 'spread pattern', 'infection rate',
                'containment', 'quarantine', 'lockdown', 'public health'
            ],
            'laboratory': [
                'lab leak', 'laboratory', 'research facility', 'biosafety',
                'gain of function', 'viral culture', 'cell culture', 'petri dish'
            ]
        }
        
        # Geographic indicators
        self.geographic_keywords = [
            'wuhan', 'china', 'usa', 'europe', 'africa', 'asia', 'america',
            'city', 'country', 'region', 'border', 'airport', 'port'
        ]
        
        # Initialize text processing
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.clustering_model = DBSCAN(eps=0.3, min_samples=2)
        
        # Surveillance state
        self.monitored_sources = []
        self.alert_history = []
        self.threat_intelligence_db = []
        
    def _initialize_models(self):
        """Initialize NLP models for threat detection"""
        try:
            # Initialize sentiment analysis for threat assessment
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Initialize text classification model
            self.text_classifier = TextClassifier()
            self.text_classifier.to(self.device)
            
            # Initialize tokenizer for text processing
            self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
            
            logger.info("Dark web monitoring models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            self._initialize_fallback_models()
    
    def _initialize_fallback_models(self):
        """Initialize fallback models if primary models fail"""
        try:
            # Simple rule-based fallback
            self.sentiment_analyzer = None
            self.text_classifier = TextClassifier()
            self.tokenizer = None
            
            logger.info("Fallback models initialized")
            
        except Exception as e:
            logger.error(f"Error initializing fallback models: {e}")
    
    async def monitor_sources(self, sources: List[str], 
                            monitoring_duration: int = 3600) -> List[ThreatIntelligence]:
        """
        Monitor specified sources for threat intelligence
        
        Args:
            sources: List of sources to monitor (simulated for demo)
            monitoring_duration: Duration in seconds
            
        Returns:
            List of threat intelligence gathered
        """
        logger.info(f"Starting surveillance of {len(sources)} sources")
        
        threat_intelligence = []
        
        # Simulate monitoring different sources
        for source in sources:
            source_intelligence = await self._monitor_single_source(source)
            threat_intelligence.extend(source_intelligence)
        
        # Process and analyze collected intelligence
        processed_intelligence = self._process_intelligence(threat_intelligence)
        
        # Generate alerts based on findings
        alerts = self._generate_alerts(processed_intelligence)
        
        # Store results
        self.threat_intelligence_db.extend(processed_intelligence)
        self.alert_history.extend(alerts)
        
        logger.info(f"Surveillance completed. Found {len(processed_intelligence)} intelligence items")
        
        return processed_intelligence
    
    async def _monitor_single_source(self, source: str) -> List[ThreatIntelligence]:
        """Monitor a single source for threats"""
        # Simulate different types of content found on dark web sources
        simulated_content = self._generate_simulated_content(source)
        
        intelligence_items = []
        
        for content_item in simulated_content:
            # Analyze content for threats
            threat_analysis = await self._analyze_content(content_item, source)
            
            if threat_analysis['is_threat']:
                intelligence = ThreatIntelligence(
                    threat_id=self._generate_threat_id(content_item),
                    source=source,
                    content=content_item['text'],
                    threat_level=threat_analysis['threat_level'],
                    confidence_score=threat_analysis['confidence'],
                    keywords=threat_analysis['keywords'],
                    timestamp=datetime.now().isoformat(),
                    geographic_indicators=threat_analysis['geographic_indicators'],
                    mutation_references=threat_analysis['mutation_references']
                )
                
                intelligence_items.append(intelligence)
        
        return intelligence_items
    
    def _generate_simulated_content(self, source: str) -> List[Dict]:
        """Generate simulated dark web content for demonstration"""
        # This would be replaced with actual dark web scraping in production
        simulated_posts = [
            {
                'text': "New variant detected in laboratory samples showing increased transmissibility",
                'author': 'anonymous_researcher',
                'timestamp': datetime.now().isoformat(),
                'location_hints': ['laboratory', 'samples']
            },
            {
                'text': "Discussion about engineered viral sequences and potential modifications",
                'author': 'bio_enthusiast',
                'timestamp': datetime.now().isoformat(),
                'location_hints': ['engineered', 'modifications']
            },
            {
                'text': "Outbreak patterns suggest coordinated release in multiple cities",
                'author': 'pattern_analyst',
                'timestamp': datetime.now().isoformat(),
                'location_hints': ['multiple cities', 'coordinated']
            },
            {
                'text': "Selling laboratory equipment suitable for viral culture work",
                'author': 'equipment_seller',
                'timestamp': datetime.now().isoformat(),
                'location_hints': ['laboratory', 'viral culture']
            },
            {
                'text': "Regular discussion about weather and sports, nothing suspicious",
                'author': 'normal_user',
                'timestamp': datetime.now().isoformat(),
                'location_hints': []
            }
        ]
        
        return simulated_posts
    
    async def _analyze_content(self, content_item: Dict, source: str) -> Dict:
        """Analyze content for threat indicators"""
        text = content_item['text'].lower()
        
        # Keyword-based threat detection
        threat_scores = {}
        detected_keywords = []
        
        for category, keywords in self.threat_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                threat_scores[category] = score
                detected_keywords.extend([kw for kw in keywords if kw in text])
        
        # Geographic indicator detection
        geographic_indicators = [geo for geo in self.geographic_keywords if geo in text]
        
        # Mutation reference detection
        mutation_references = self._extract_mutation_references(text)
        
        # Calculate overall threat level
        total_threat_score = sum(threat_scores.values())
        
        if total_threat_score >= 3 or 'bioterrorism' in threat_scores:
            threat_level = 'critical'
            confidence = 0.9
        elif total_threat_score >= 2:
            threat_level = 'high'
            confidence = 0.7
        elif total_threat_score >= 1:
            threat_level = 'medium'
            confidence = 0.5
        else:
            threat_level = 'low'
            confidence = 0.2
        
        # Use sentiment analysis if available
        if self.sentiment_analyzer:
            try:
                sentiment = self.sentiment_analyzer(content_item['text'])[0]
                if sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.8:
                    confidence += 0.1
            except Exception as e:
                logger.warning(f"Sentiment analysis failed: {e}")
        
        is_threat = threat_level in ['medium', 'high', 'critical']
        
        return {
            'is_threat': is_threat,
            'threat_level': threat_level,
            'confidence': min(confidence, 1.0),
            'keywords': detected_keywords,
            'geographic_indicators': geographic_indicators,
            'mutation_references': mutation_references,
            'threat_categories': list(threat_scores.keys())
        }
    
    def _extract_mutation_references(self, text: str) -> List[str]:
        """Extract potential mutation references from text"""
        mutation_patterns = [
            r'[A-Z]\d+[A-Z]',  # Single amino acid changes (e.g., D614G)
            r'[ATGC]+\d+[ATGC]+',  # Nucleotide changes
            r'variant\s+[A-Z]+\.\d+',  # Variant names
            r'strain\s+[A-Z0-9\-]+',  # Strain names
            r'mutation\s+[A-Z0-9\-]+',  # Mutation names
        ]
        
        references = []
        for pattern in mutation_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            references.extend(matches)
        
        return list(set(references))  # Remove duplicates
    
    def _process_intelligence(self, raw_intelligence: List[ThreatIntelligence]) -> List[ThreatIntelligence]:
        """Process and enrich threat intelligence"""
        processed_intelligence = []
        
        for intel in raw_intelligence:
            # Enrich with additional analysis
            enriched_intel = self._enrich_intelligence(intel)
            processed_intelligence.append(enriched_intel)
        
        # Cluster similar threats
        clustered_intelligence = self._cluster_threats(processed_intelligence)
        
        return clustered_intelligence
    
    def _enrich_intelligence(self, intel: ThreatIntelligence) -> ThreatIntelligence:
        """Enrich intelligence with additional analysis"""
        # Add threat scoring
        threat_score = self._calculate_threat_score(intel)
        
        # Add context analysis
        context = self._analyze_context(intel.content)
        
        # Create enriched copy
        enriched = ThreatIntelligence(
            threat_id=intel.threat_id,
            source=intel.source,
            content=intel.content,
            threat_level=intel.threat_level,
            confidence_score=min(intel.confidence_score + context['confidence_boost'], 1.0),
            keywords=intel.keywords + context['additional_keywords'],
            timestamp=intel.timestamp,
            geographic_indicators=intel.geographic_indicators + context['locations'],
            mutation_references=intel.mutation_references
        )
        
        return enriched
    
    def _calculate_threat_score(self, intel: ThreatIntelligence) -> float:
        """Calculate numerical threat score"""
        base_score = {
            'low': 0.2,
            'medium': 0.5,
            'high': 0.8,
            'critical': 1.0
        }.get(intel.threat_level, 0.1)
        
        # Adjust based on confidence
        adjusted_score = base_score * intel.confidence_score
        
        # Boost for specific indicators
        if any('bioweapon' in kw for kw in intel.keywords):
            adjusted_score += 0.2
        
        if len(intel.mutation_references) > 2:
            adjusted_score += 0.1
        
        return min(adjusted_score, 1.0)
    
    def _analyze_context(self, content: str) -> Dict:
        """Analyze content context for additional insights"""
        context = {
            'confidence_boost': 0.0,
            'additional_keywords': [],
            'locations': []
        }
        
        # Look for technical language that increases confidence
        technical_terms = ['genome', 'sequence', 'protein', 'antibody', 'vaccine', 'pcr']
        tech_count = sum(1 for term in technical_terms if term in content.lower())
        
        if tech_count >= 2:
            context['confidence_boost'] = 0.1
            context['additional_keywords'].extend([term for term in technical_terms if term in content.lower()])
        
        # Extract potential location names (simplified)
        location_patterns = [
            r'\b[A-Z][a-z]+\s+City\b',
            r'\b[A-Z][a-z]+,\s+[A-Z]{2}\b',  # City, State
            r'\b[A-Z][a-z]+\s+University\b'
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, content)
            context['locations'].extend(matches)
        
        return context
    
    def _cluster_threats(self, intelligence: List[ThreatIntelligence]) -> List[ThreatIntelligence]:
        """Cluster similar threats together"""
        if len(intelligence) < 2:
            return intelligence
        
        try:
            # Create feature vectors from content
            texts = [intel.content for intel in intelligence]
            feature_vectors = self.vectorizer.fit_transform(texts)
            
            # Perform clustering
            clusters = self.clustering_model.fit_predict(feature_vectors.toarray())
            
            # Add cluster information to intelligence
            for i, intel in enumerate(intelligence):
                # Add cluster ID as additional metadata (not in dataclass)
                intel.cluster_id = int(clusters[i]) if clusters[i] != -1 else None
            
            return intelligence
            
        except Exception as e:
            logger.warning(f"Clustering failed: {e}")
            return intelligence
    
    def _generate_alerts(self, intelligence: List[ThreatIntelligence]) -> List[SurveillanceAlert]:
        """Generate alerts based on threat intelligence"""
        alerts = []
        
        # Group by threat level
        critical_threats = [i for i in intelligence if i.threat_level == 'critical']
        high_threats = [i for i in intelligence if i.threat_level == 'high']
        
        # Generate critical alerts
        if critical_threats:
            alert = SurveillanceAlert(
                alert_id=f"ALERT_CRITICAL_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                alert_type="critical_threat_detected",
                severity="critical",
                description=f"Detected {len(critical_threats)} critical threats requiring immediate attention",
                evidence=[t.threat_id for t in critical_threats],
                recommended_actions=[
                    "Notify security agencies immediately",
                    "Increase surveillance of identified sources",
                    "Cross-reference with known threat actors",
                    "Prepare emergency response protocols"
                ],
                timestamp=datetime.now().isoformat()
            )
            alerts.append(alert)
        
        # Generate high-priority alerts
        if high_threats:
            alert = SurveillanceAlert(
                alert_id=f"ALERT_HIGH_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                alert_type="high_priority_threats",
                severity="high",
                description=f"Detected {len(high_threats)} high-priority threats",
                evidence=[t.threat_id for t in high_threats],
                recommended_actions=[
                    "Investigate threat sources",
                    "Monitor for escalation",
                    "Prepare contingency measures",
                    "Brief relevant authorities"
                ],
                timestamp=datetime.now().isoformat()
            )
            alerts.append(alert)
        
        # Generate pattern-based alerts
        pattern_alerts = self._detect_threat_patterns(intelligence)
        alerts.extend(pattern_alerts)
        
        return alerts
    
    def _detect_threat_patterns(self, intelligence: List[ThreatIntelligence]) -> List[SurveillanceAlert]:
        """Detect patterns in threat intelligence"""
        alerts = []
        
        # Check for coordinated activity
        if len(intelligence) >= 3:
            # Check if multiple threats mention similar locations
            all_locations = []
            for intel in intelligence:
                all_locations.extend(intel.geographic_indicators)
            
            location_counts = {}
            for loc in all_locations:
                location_counts[loc] = location_counts.get(loc, 0) + 1
            
            # Alert if same location mentioned multiple times
            for location, count in location_counts.items():
                if count >= 3:
                    alert = SurveillanceAlert(
                        alert_id=f"ALERT_PATTERN_{location}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        alert_type="coordinated_activity",
                        severity="medium",
                        description=f"Multiple threats detected mentioning {location}",
                        evidence=[i.threat_id for i in intelligence if location in i.geographic_indicators],
                        recommended_actions=[
                            f"Increase surveillance in {location}",
                            "Investigate potential coordinated activity",
                            "Alert local authorities"
                        ],
                        timestamp=datetime.now().isoformat()
                    )
                    alerts.append(alert)
        
        return alerts
    
    def _generate_threat_id(self, content_item: Dict) -> str:
        """Generate unique threat ID"""
        content_hash = hashlib.md5(content_item['text'].encode()).hexdigest()[:8]
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"THREAT_{timestamp}_{content_hash}"
    
    def generate_surveillance_report(self, time_period: int = 24) -> Dict:
        """Generate surveillance report for specified time period"""
        cutoff_time = datetime.now() - timedelta(hours=time_period)
        
        # Filter recent intelligence
        recent_intelligence = [
            intel for intel in self.threat_intelligence_db
            if datetime.fromisoformat(intel.timestamp) > cutoff_time
        ]
        
        recent_alerts = [
            alert for alert in self.alert_history
            if datetime.fromisoformat(alert.timestamp) > cutoff_time
        ]
        
        # Generate statistics
        threat_stats = self._calculate_threat_statistics(recent_intelligence)
        
        report = {
            'report_id': f"SURVEILLANCE_REPORT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'time_period_hours': time_period,
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_threats_detected': len(recent_intelligence),
                'critical_threats': len([i for i in recent_intelligence if i.threat_level == 'critical']),
                'high_threats': len([i for i in recent_intelligence if i.threat_level == 'high']),
                'alerts_generated': len(recent_alerts),
                'sources_monitored': len(set(i.source for i in recent_intelligence))
            },
            'threat_statistics': threat_stats,
            'top_threats': self._get_top_threats(recent_intelligence, 5),
            'geographic_hotspots': self._identify_geographic_hotspots(recent_intelligence),
            'mutation_intelligence': self._summarize_mutation_intelligence(recent_intelligence),
            'recommendations': self._generate_recommendations(recent_intelligence, recent_alerts)
        }
        
        return report
    
    def _calculate_threat_statistics(self, intelligence: List[ThreatIntelligence]) -> Dict:
        """Calculate threat statistics"""
        if not intelligence:
            return {}
        
        threat_levels = [i.threat_level for i in intelligence]
        confidence_scores = [i.confidence_score for i in intelligence]
        
        return {
            'threat_level_distribution': {
                level: threat_levels.count(level) for level in set(threat_levels)
            },
            'average_confidence': np.mean(confidence_scores),
            'confidence_range': {
                'min': np.min(confidence_scores),
                'max': np.max(confidence_scores)
            },
            'total_keywords_detected': sum(len(i.keywords) for i in intelligence),
            'unique_sources': len(set(i.source for i in intelligence))
        }
    
    def _get_top_threats(self, intelligence: List[ThreatIntelligence], limit: int) -> List[Dict]:
        """Get top threats by severity and confidence"""
        # Sort by threat level and confidence
        threat_priority = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        
        sorted_threats = sorted(
            intelligence,
            key=lambda x: (threat_priority.get(x.threat_level, 0), x.confidence_score),
            reverse=True
        )
        
        return [
            {
                'threat_id': threat.threat_id,
                'threat_level': threat.threat_level,
                'confidence_score': threat.confidence_score,
                'source': threat.source,
                'keywords': threat.keywords[:5],  # Top 5 keywords
                'summary': threat.content[:200] + "..." if len(threat.content) > 200 else threat.content
            }
            for threat in sorted_threats[:limit]
        ]
    
    def _identify_geographic_hotspots(self, intelligence: List[ThreatIntelligence]) -> List[Dict]:
        """Identify geographic hotspots from intelligence"""
        location_threats = {}
        
        for intel in intelligence:
            for location in intel.geographic_indicators:
                if location not in location_threats:
                    location_threats[location] = []
                location_threats[location].append(intel)
        
        hotspots = []
        for location, threats in location_threats.items():
            if len(threats) >= 2:  # Hotspot threshold
                hotspots.append({
                    'location': location,
                    'threat_count': len(threats),
                    'max_threat_level': max(threats, key=lambda x: {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}.get(x.threat_level, 0)).threat_level,
                    'average_confidence': np.mean([t.confidence_score for t in threats])
                })
        
        return sorted(hotspots, key=lambda x: x['threat_count'], reverse=True)
    
    def _summarize_mutation_intelligence(self, intelligence: List[ThreatIntelligence]) -> Dict:
        """Summarize mutation-related intelligence"""
        mutation_intel = [i for i in intelligence if i.mutation_references]
        
        if not mutation_intel:
            return {'total_mutation_references': 0}
        
        all_mutations = []
        for intel in mutation_intel:
            all_mutations.extend(intel.mutation_references)
        
        mutation_counts = {}
        for mutation in all_mutations:
            mutation_counts[mutation] = mutation_counts.get(mutation, 0) + 1
        
        return {
            'total_mutation_references': len(all_mutations),
            'unique_mutations': len(set(all_mutations)),
            'most_mentioned_mutations': sorted(
                mutation_counts.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5],
            'sources_with_mutation_intel': len(mutation_intel)
        }
    
    def _generate_recommendations(self, intelligence: List[ThreatIntelligence], 
                                alerts: List[SurveillanceAlert]) -> List[str]:
        """Generate recommendations based on surveillance results"""
        recommendations = []
        
        critical_count = len([i for i in intelligence if i.threat_level == 'critical'])
        high_count = len([i for i in intelligence if i.threat_level == 'high'])
        
        if critical_count > 0:
            recommendations.append(f"URGENT: {critical_count} critical threats detected - immediate escalation required")
            recommendations.append("Activate emergency response protocols")
            recommendations.append("Coordinate with law enforcement and security agencies")
        
        if high_count > 2:
            recommendations.append(f"Elevated threat level: {high_count} high-priority threats require investigation")
            recommendations.append("Increase monitoring frequency")
        
        # Geographic recommendations
        hotspots = self._identify_geographic_hotspots(intelligence)
        if hotspots:
            top_hotspot = hotspots[0]
            recommendations.append(f"Focus surveillance on {top_hotspot['location']} - {top_hotspot['threat_count']} threats detected")
        
        # Mutation intelligence recommendations
        mutation_summary = self._summarize_mutation_intelligence(intelligence)
        if mutation_summary.get('total_mutation_references', 0) > 5:
            recommendations.append("Significant mutation intelligence detected - coordinate with epidemiological teams")
        
        return recommendations

# Example usage and testing
if __name__ == "__main__":
    # Initialize monitor
    monitor = DarkWebMonitor()
    
    # Example sources to monitor (simulated)
    sources = [
        "darkweb_forum_1",
        "encrypted_chat_2",
        "anonymous_board_3"
    ]
    
    async def test_monitoring():
        print("Starting dark web surveillance...")
        
        # Monitor sources
        intelligence = await monitor.monitor_sources(sources, monitoring_duration=60)
        
        print(f"\n=== Surveillance Results ===")
        print(f"Total threats detected: {len(intelligence)}")
        
        for intel in intelligence:
            print(f"\n--- Threat {intel.threat_id} ---")
            print(f"Source: {intel.source}")
            print(f"Threat Level: {intel.threat_level}")
            print(f"Confidence: {intel.confidence_score:.3f}")
            print(f"Keywords: {', '.join(intel.keywords[:5])}")
            if intel.mutation_references:
                print(f"Mutation References: {', '.join(intel.mutation_references)}")
        
        # Generate surveillance report
        print(f"\n=== Surveillance Report ===")
        report = monitor.generate_surveillance_report(time_period=1)
        
        print(f"Report ID: {report['report_id']}")
        print(f"Threats Detected: {report['summary']['total_threats_detected']}")
        print(f"Critical Threats: {report['summary']['critical_threats']}")
        print(f"Alerts Generated: {report['summary']['alerts_generated']}")
        
        if report['recommendations']:
            print(f"\nRecommendations:")
            for rec in report['recommendations']:
                print(f"- {rec}")
    
    # Run the test
    asyncio.run(test_monitoring())