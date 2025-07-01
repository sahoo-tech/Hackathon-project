#!/usr/bin/env python3
"""
Enhanced health check script for VIRALYTIX backend
This script can be used by monitoring services to check if the API is healthy
"""

import requests
import sys
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_backend_url():
    """Get the backend URL from environment or use default"""
    backend_url = os.getenv('API_BASE_URL') or os.getenv('BACKEND_URL', 'http://localhost:8000')
    return backend_url.rstrip('/')

def check_endpoint(url, endpoint, timeout=8):
    """Check if a specific endpoint is responding"""
    try:
        start_time = time.time()
        response = requests.get(f"{url}{endpoint}", timeout=timeout)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            try:
                data = response.json()
                return True, data, response_time
            except:
                return True, response.text, response_time
        else:
            return False, f"HTTP {response.status_code}", response_time
    except requests.exceptions.Timeout:
        return False, "Timeout", timeout
    except requests.exceptions.RequestException as e:
        return False, str(e), time.time() - start_time

def check_health():
    """Check if the API is responding properly"""
    backend_url = get_backend_url()
    print(f"Checking backend health at: {backend_url}")
    print("-" * 50)
    
    overall_healthy = True
    
    # Check health endpoint (faster, should respond quickly)
    print("Checking /health endpoint...")
    health_ok, health_result, health_time = check_endpoint(backend_url, "/health")
    
    if health_ok:
        print(f"✅ Health endpoint OK ({health_time:.2f}s)")
        if isinstance(health_result, dict):
            status = health_result.get('status', 'unknown')
            routers_loaded = health_result.get('routers_loaded', False)
            print(f"   Status: {status}")
            print(f"   Routers loaded: {routers_loaded}")
            
            if status != 'healthy':
                overall_healthy = False
                print(f"   ⚠️  Status is not healthy: {status}")
        else:
            print(f"   Response: {health_result}")
    else:
        print(f"❌ Health endpoint failed ({health_time:.2f}s): {health_result}")
        overall_healthy = False
    
    # Check root endpoint (may be slower due to router loading)
    print("\nChecking / endpoint...")
    root_ok, root_result, root_time = check_endpoint(backend_url, "/")
    
    if root_ok:
        print(f"✅ Root endpoint OK ({root_time:.2f}s)")
        if isinstance(root_result, dict):
            message = root_result.get('message', 'unknown')
            version = root_result.get('version', 'unknown')
            routers_loaded = root_result.get('routers_loaded', False)
            print(f"   Message: {message}")
            print(f"   Version: {version}")
            print(f"   Routers loaded: {routers_loaded}")
        else:
            print(f"   Response: {root_result}")
    else:
        print(f"❌ Root endpoint failed ({root_time:.2f}s): {root_result}")
        # Root endpoint failure is less critical if health endpoint works
        if not health_ok:
            overall_healthy = False
    
    print("-" * 50)
    
    # Performance warnings
    if health_ok and health_time > 5:
        print(f"⚠️  Health endpoint is slow ({health_time:.2f}s) - consider optimization")
    
    if root_ok and root_time > 10:
        print(f"⚠️  Root endpoint is slow ({root_time:.2f}s) - routers may be loading")
    
    # Overall status
    if overall_healthy:
        print("🎉 Backend is healthy!")
        return True
    else:
        print("💥 Backend health check failed!")
        return False

if __name__ == "__main__":
    if check_health():
        sys.exit(0)
    else:
        sys.exit(1)