import urllib.request
import json

def simple_test():
    print("Testing API endpoints...")
    
    # Test 1: API docs
    try:
        req = urllib.request.Request('http://localhost:8000/api/docs', method='GET')
        req.add_header('Accept', 'application/json')
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        print(f"✅ API docs: {data.get('title', 'Unknown')}")
    except Exception as e:
        print(f"❌ API docs: {e}")
    
    # Test 2: Menu
    try:
        req = urllib.request.Request('http://localhost:8000/api/menu', method='GET')
        req.add_header('Accept', 'application/json')
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        print(f"✅ Menu: Got {len(data)} items")
    except Exception as e:
        print(f"❌ Menu: {e}")
    
    # Test 3: Login
    try:
        login_data = json.dumps({
            "email": "admin@hallulies.com",
            "password": "admin123"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            'http://localhost:8000/api/auth/login',
            data=login_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        print(f"✅ Login: Success - {data.get('user', {}).get('username', 'Unknown')}")
    except Exception as e:
        print(f"❌ Login: {e}")

if __name__ == "__main__":
    simple_test()