
import requests
import json
import time

BASE_URL = "http://localhost:8015"

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_data():
    """Test data endpoint"""
    print("\n📊 Testing Data Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/data")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Total months: {data.get('total_months', 0)}")
        print(f"   Total sales: {data.get('total_sales', 0):,}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_forecast():
    """Test forecast endpoint"""
    print("\n🔮 Testing Forecast Endpoint...")
    
    payload = {
        "use_saved_model": False,
        "horizon": 12,
        "algorithm": "Seasonal AI"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/forecast",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('success')}")
            print(f"   Algorithm: {result.get('algorithm')}")
            print(f"   Model Used: {result.get('model_used')}")
            print(f"   Total Forecast: {result.get('metrics', {}).get('total_forecast', 0):,.0f}")
            print(f"   Forecast Periods: {len(result.get('forecast_periods', []))}")
            print(f"   Sample Forecast: {result.get('forecast_values', [])[:3]}")
        else:
            print(f"   ❌ Error: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_models():
    """Test models endpoint"""
    print("\n📦 Testing Models Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/models")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Total models: {data.get('total_models', 0)}")
            for model in data.get('models', []):
                print(f"   - {model.get('name')} ({model.get('algorithm')})")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 TESTING FORECASTING SERVICE")
    print("="*60)
    
    # First check if service is running
    print("\n📡 Checking if service is running...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        print("   ✅ Service is running!")
    except:
        print("   ❌ Service is NOT running!")
        print("\nPlease start the service first:")
        print("   python simple_forecast_service.py")
        return False
    
    # Run all tests
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Data Loading", test_data()))
    results.append(("Forecast Generation", test_forecast()))
    results.append(("Models List", test_models()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:<20} {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("="*60)
    
    return passed_count == total_count

if __name__ == "__main__":
    run_all_tests()