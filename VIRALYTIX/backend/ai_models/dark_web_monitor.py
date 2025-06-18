import random
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class DarkWebMonitor:
    """
    A class that simulates monitoring dark web forums and marketplaces
    for mentions of engineered pathogens, bioweapons, or suspicious viral research.
    """
    def __init__(self):
        logger.info("Initialized DarkWebMonitor")
        self.threat_keywords = [
            "engineered virus", "bioweapon", "synthetic pathogen", "gene editing",
            "CRISPR virus", "viral enhancement", "gain of function", "laboratory leak",
            "modified coronavirus", "artificial mutation", "viral blueprint", "pathogen design"
        ]
        
    def scan_for_threats(self, time_period="24h", threat_level_threshold=0.5):
        """
        Scan dark web sources for potential biothreats.
        
        Args:
            time_period: Time period to scan ("24h", "7d", "30d")
            threat_level_threshold: Minimum threat level to include in results
            
        Returns:
            A list of detected threats
        """
        # In a real implementation, this would connect to dark web monitoring services
        # For now, we'll generate simulated threats
        
        # Determine number of threats based on time period
        if time_period == "24h":
            num_threats = random.randint(0, 3)
            days_back = 1
        elif time_period == "7d":
            num_threats = random.randint(2, 7)
            days_back = 7
        elif time_period == "30d":
            num_threats = random.randint(5, 15)
            days_back = 30
        else:
            num_threats = random.randint(1, 5)
            days_back = 3
            
        # Generate threats
        threats = []
        for _ in range(num_threats):
            threat_level = random.uniform(0.3, 0.9)
            
            # Only include threats above the threshold
            if threat_level >= threat_level_threshold:
                threat = self._generate_threat(days_back, threat_level)
                threats.append(threat)
                
        # Sort by threat level (highest first)
        threats.sort(key=lambda x: x["threat_level"], reverse=True)
        
        return threats
    
    def _generate_threat(self, days_back, threat_level):
        """Generate a simulated threat"""
        # Random date within the specified time period
        detection_date = datetime.now() - timedelta(days=random.uniform(0, days_back))
        
        # Random source type
        source_types = ["forum", "marketplace", "chat", "blog", "repository"]
        source_type = random.choice(source_types)
        
        # Random keywords
        keywords = random.sample(self.threat_keywords, k=random.randint(1, 3))
        
        # Generate content based on keywords
        content = self._generate_content(keywords)
        
        # Generate location data (if available)
        has_location = random.random() > 0.7  # 30% chance of having location
        location = None
        if has_location:
            countries = ["Unknown", "Russia", "China", "Iran", "North Korea", "Eastern Europe", "Southeast Asia"]
            location = {
                "country": random.choice(countries),
                "specificity": random.choice(["country", "region", "city"]),
                "confidence": random.uniform(0.4, 0.9)
            }
            
        # Generate threat data
        threat = {
            "id": f"threat-{random.randint(1000, 9999)}",
            "detection_date": detection_date.isoformat(),
            "threat_level": threat_level,
            "source_type": source_type,
            "keywords_detected": keywords,
            "content_snippet": content,
            "location": location,
            "verified": random.random() > 0.8,  # 20% chance of being verified
            "analysis": self._generate_analysis(keywords, threat_level)
        }
        
        return threat
    
    def _generate_content(self, keywords):
        """Generate simulated content snippets based on keywords"""
        templates = [
            "Discussion about {kw1} techniques for creating more infectious strains.",
            "Selling information on {kw1} and {kw2} methods.",
            "Looking for collaborators on {kw1} project with focus on respiratory transmission.",
            "New {kw1} protocol developed that bypasses traditional detection.",
            "Research paper on {kw1} with applications for {kw2}.",
            "Tutorial on using {kw1} to modify existing pathogens.",
            "Offering services related to {kw1} and {kw2} for the right price.",
            "Debate about ethics of {kw1} research and potential applications.",
            "Leaked documents regarding {kw1} experiments conducted in [REDACTED] lab."
        ]
        
        template = random.choice(templates)
        
        # Replace keywords in template
        content = template
        if len(keywords) > 0:
            content = content.replace("{kw1}", keywords[0])
        if len(keywords) > 1:
            content = content.replace("{kw2}", keywords[1])
            
        return content
    
    def _generate_analysis(self, keywords, threat_level):
        """Generate a simulated threat analysis"""
        # Analysis templates based on threat level
        low_templates = [
            "Likely discussion of academic research with no immediate threat.",
            "Appears to be theoretical discussion without actionable details.",
            "Probably related to legitimate research being discussed in non-standard channels."
        ]
        
        medium_templates = [
            "Concerning discussion that includes some technical details about pathogen modification.",
            "Potential threat that combines knowledge of {kw} with expressed intent.",
            "Suspicious exchange of information about {kw} techniques with possible malicious applications."
        ]
        
        high_templates = [
            "Highly concerning communication that includes detailed technical information about {kw}.",
            "Credible threat involving specific plans related to {kw} with clear harmful intent.",
            "Immediate attention recommended due to combination of technical capability and expressed intent regarding {kw}."
        ]
        
        # Select template based on threat level
        if threat_level < 0.5:
            template = random.choice(low_templates)
        elif threat_level < 0.75:
            template = random.choice(medium_templates)
        else:
            template = random.choice(high_templates)
            
        # Replace keywords in template
        analysis = template
        if len(keywords) > 0:
            analysis = analysis.replace("{kw}", keywords[0])
            
        # Add recommendation based on threat level
        if threat_level < 0.5:
            recommendation = "Monitor for additional related communications."
        elif threat_level < 0.75:
            recommendation = "Increase monitoring and consider alerting relevant authorities if additional evidence emerges."
        else:
            recommendation = "Immediate notification to relevant authorities recommended."
            
        return {
            "summary": analysis,
            "recommendation": recommendation,
            "confidence": random.uniform(max(0.4, threat_level - 0.2), min(0.95, threat_level + 0.1))
        }