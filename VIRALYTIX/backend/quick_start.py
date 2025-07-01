#!/usr/bin/env python3
"""
Quick start script for VIRALYTIX backend with optimizations
This script starts the backend with optimized settings for faster startup
"""

import os
import sys
import time
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def optimize_environment():
    """Set environment variables for optimal performance"""
    logger.info("Setting optimization environment variables...")
    
    # Python optimizations
    os.environ['PYTHONDONTWRITEBYTECODE'] = '1'  # Don't write .pyc files
    os.environ['PYTHONUNBUFFERED'] = '1'  # Unbuffered output
    os.environ['PYTHONHASHSEED'] = '0'  # Consistent hash seed
    
    # FastAPI optimizations
    if not os.getenv('ENVIRONMENT'):
        os.environ['ENVIRONMENT'] = 'development'
    
    # Uvicorn optimizations
    if not os.getenv('HOST'):
        os.environ['HOST'] = '0.0.0.0'
    
    if not os.getenv('PORT'):
        os.environ['PORT'] = '8000'

def check_dependencies():
    """Check if required dependencies are available"""
    logger.info("Checking dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'python-dotenv'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {missing_packages}")
        logger.error("Please install them using: pip install " + " ".join(missing_packages))
        return False
    
    logger.info("All required dependencies are available")
    return True

def start_server():
    """Start the FastAPI server with optimized settings"""
    logger.info("Starting VIRALYTIX backend server...")
    
    try:
        import uvicorn
        from startup_optimizer import StartupOptimizer
        
        # Use startup optimizer
        optimizer = StartupOptimizer()
        optimizer.optimize_imports()
        settings = optimizer.optimize_uvicorn_settings()
        
        logger.info(f"Starting server with optimized settings")
        logger.info(f"Server will be available at: http://{settings['host']}:{settings['port']}")
        
        # Start the server
        uvicorn.run("main:app", **settings)
        
    except ImportError as e:
        logger.warning(f"Startup optimizer not available: {e}")
        logger.info("Using fallback startup method...")
        
        # Fallback to basic uvicorn startup
        import uvicorn
        
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 8000))
        reload = os.getenv('ENVIRONMENT') == 'development'
        
        logger.info(f"Server will be available at: http://{host}:{port}")
        uvicorn.run("main:app", host=host, port=port, reload=reload)
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    start_time = time.time()
    
    logger.info("=" * 60)
    logger.info("VIRALYTIX Backend Quick Start")
    logger.info("=" * 60)
    
    # Set optimizations
    optimize_environment()
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Start server
    try:
        start_server()
        return 0
    except KeyboardInterrupt:
        logger.info("\nServer stopped by user")
        return 0
    except Exception as e:
        logger.error(f"Server failed to start: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())