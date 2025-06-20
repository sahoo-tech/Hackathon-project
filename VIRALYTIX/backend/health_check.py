#!/usr/bin/env python3
"""
Health check script for VIRALYTIX backend
This script can be used by monitoring services to check if the API is healthy
"""

import requests
import sys
import os

def check_health():
    """Check if the API is responding properly"""
    try:
        # Get the URL from environment or use default
        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        
        # Check root endpoint
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code != 200:
            print(f"Root endpoint returned status {response.status_code}")
            return False
            
        # Check health endpoint
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code != 200:
            print(f"Health endpoint returned status {response.status_code}")
            return False
            
        health_data = response.json()
        if health_data.get("status") != "healthy":
            print(f"Health check failed: {health_data}")
            return False
            
        print("Health check passed!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Health check failed with error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error during health check: {e}")
        return False

if __name__ == "__main__":
    if check_health():
        sys.exit(0)
    else:
        sys.exit(1)