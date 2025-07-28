#!/usr/bin/env python3
"""
Health check script for deployed API
Use this to verify your deployment is working
"""

import urllib.request
import urllib.error
import sys
import json

def test_api_health(api_url):
    """Test API health and basic functionality"""
    
    print(f"🏥 Testing API Health: {api_url}")
    print("=" * 50)
    
    # Test health endpoint
    try:
        with urllib.request.urlopen(f"{api_url}/health", timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                print("✅ Health check: PASSED")
                print(f"   Response: {data}")
            else:
                print(f"❌ Health check: FAILED (Status: {response.status})")
                return False
    except Exception as e:
        print(f"❌ Health check: ERROR - {e}")
        return False
    
    # Test root endpoint
    try:
        with urllib.request.urlopen(api_url, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                print("✅ Root endpoint: PASSED")
                print(f"   Response: {data}")
            else:
                print(f"❌ Root endpoint: FAILED (Status: {response.status})")
    except Exception as e:
        print(f"❌ Root endpoint: ERROR - {e}")
    
    # Test docs endpoint
    try:
        with urllib.request.urlopen(f"{api_url}/docs", timeout=10) as response:
            if response.status == 200:
                print("✅ Documentation: ACCESSIBLE")
                print(f"   Docs available at: {api_url}/docs")
            else:
                print(f"⚠️  Documentation: Status {response.status}")
    except Exception as e:
        print(f"⚠️  Documentation: ERROR - {e}")
    
    print("\n🎉 Basic health check completed!")
    return True

def main():
    # Default to localhost for testing
    api_url = "http://localhost:8000"  # Standard FastAPI port
    
    if len(sys.argv) > 1:
        api_url = sys.argv[1].rstrip('/')
    
    print("Bank Statement Analyzer API - Health Check")
    print("==========================================")
    print(f"Testing: {api_url}")
    print()
    
    # Example deployment URL format
    if api_url == "http://localhost:8000":
        print("💡 For production deployment, use:")
        print("   python health_check.py https://your-api-domain.com")
        print()
    
    if test_api_health(api_url):
        print("✅ API is healthy and ready!")
        sys.exit(0)
    else:
        print("❌ API health check failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
