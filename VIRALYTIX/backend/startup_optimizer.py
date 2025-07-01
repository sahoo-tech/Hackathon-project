#!/usr/bin/env python3
"""
Startup optimizer for VIRALYTIX backend
This script helps optimize the backend startup process
"""

import os
import sys
import time
import asyncio
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class StartupOptimizer:
    def __init__(self):
        self.start_time = time.time()
        
    def optimize_imports(self):
        """Optimize Python imports for faster startup"""
        logger.info("Optimizing Python imports...")
        
        # Set environment variables for faster imports
        os.environ['PYTHONDONTWRITEBYTECODE'] = '1'  # Don't write .pyc files
        os.environ['PYTHONUNBUFFERED'] = '1'  # Unbuffered output
        
        # Optimize torch/transformers if they exist
        try:
            import torch
            # Set torch to use fewer threads for faster startup
            torch.set_num_threads(1)
            logger.info("Optimized PyTorch settings")
        except ImportError:
            pass
            
        try:
            import transformers
            # Disable transformers logging for faster startup
            transformers.logging.set_verbosity_error()
            logger.info("Optimized Transformers settings")
        except ImportError:
            pass
    
    def check_dependencies(self):
        """Check if all required dependencies are available"""
        logger.info("Checking dependencies...")
        
        required_packages = [
            'fastapi', 'uvicorn', 'pydantic', 'python-dotenv'
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            logger.error(f"Missing required packages: {missing_packages}")
            return False
        
        logger.info("All required dependencies are available")
        return True
    
    def optimize_uvicorn_settings(self):
        """Get optimized uvicorn settings"""
        logger.info("Preparing optimized uvicorn settings...")
        
        settings = {
            'host': os.getenv('HOST', '0.0.0.0'),
            'port': int(os.getenv('PORT', 8000)),
            'reload': False,  # Disable reload for faster startup
            'access_log': False,  # Disable access logs for better performance
            'workers': 1,  # Single worker for development
            'loop': 'asyncio',  # Use asyncio loop
            'http': 'httptools',  # Use httptools for better performance
        }
        
        # Enable reload only in development
        if os.getenv('ENVIRONMENT') == 'development':
            settings['reload'] = True
            settings['access_log'] = True
        
        return settings
    
    def create_health_check_endpoint(self):
        """Create a fast health check endpoint"""
        logger.info("Setting up fast health check...")
        
        # This will be used by the main app
        return {
            'status': 'healthy',
            'startup_time': time.time() - self.start_time,
            'optimized': True
        }
    
    def get_startup_time(self):
        """Get the total startup time"""
        return time.time() - self.start_time

def main():
    """Main optimization function"""
    optimizer = StartupOptimizer()
    
    logger.info("Starting VIRALYTIX backend optimization...")
    
    # Run optimizations
    optimizer.optimize_imports()
    
    if not optimizer.check_dependencies():
        sys.exit(1)
    
    settings = optimizer.optimize_uvicorn_settings()
    
    startup_time = optimizer.get_startup_time()
    logger.info(f"Optimization completed in {startup_time:.2f} seconds")
    
    return settings

if __name__ == "__main__":
    main()