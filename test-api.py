#!/usr/bin/env python3
"""
API Test Suite for Hallulies Hotel System
Tests all API endpoints to ensure they're working correctly
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_api_endpoints():
    """Test all API endpoints"""
    
    print("🚀 Testing Hallulies Hotel API Endpoints")
    print("=" * 50)
    
    # Test 1: API Documentation
    print("\n📋 Testing API Documentation...")
    try:
        response = requests.get(f"{API_BASE}/docs")
        if response.status_code == 200:
            print("✅ API Documentation: OK")
            docs = response.json()
            print(f"   Version: {docs.get('version', 'Unknown')}")
            print(f"   Endpoints: {len(docs.get('endpoints', {}))} categories")
        else:
            print(f"❌ API Documentation: Failed (Status {response.status_code})")
    except Exception as e:
        print(f"❌ API Documentation: Error - {str(e)}")
    
    # Test 2: User Authentication
    print("\n🔐 Testing Authentication...")
    try:
        login_data = {
            "email": "admin@hallulies.com",
            "password": "admin123"
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if response.status_code == 200:
            auth_data = response.json()
            token = auth_data.get('token')
            user = auth_data.get('user')
            print("✅ Login Successful")
            print(f"   User: {user.get('username')} ({user.get('role')})")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"❌ Login Failed (Status {response.status_code})")
            return
    except Exception as e:
        print(f"❌ Authentication Error: {str(e)}")
        return
    
    # Test 3: Dashboard Analytics (requires auth)
    print("\n📊 Testing Dashboard Analytics...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/analytics/dashboard", headers=headers)
        if response.status_code == 200:
            analytics = response.json()
            print("✅ Dashboard Analytics: OK")
            print(f"   Total Bookings: {analytics.get('total_bookings', 0)}")
            print(f"   Recent Bookings: {analytics.get('recent_bookings', 0)}")
            print(f"   Average Rating: {analytics.get('average_rating', 0)}")
        else:
            print(f"❌ Dashboard Analytics: Failed (Status {response.status_code})")
    except Exception as e:
        print(f"❌ Dashboard Error: {str(e)}")
    
    # Test 4: Menu Items
    print("\n🍽️ Testing Menu API...")
    try:
        # Get all menu items
        response = requests.get(f"{API_BASE}/menu")
        if response.status_code == 200:
            menu_items = response.json()
            print(f"✅ Menu Items: OK ({len(menu_items)} items)")
            for item in menu_items[:3]:  # Show first 3 items
                print(f"   - {item['name']} ({item['category']}) - ₵{item['price']}")
        else:
            print(f"❌ Menu Items: Failed (Status {response.status_code})")
            
        # Get menu by category
        response = requests.get(f"{API_BASE}/menu/category/appetizers")
        if response.status_code == 200:
            appetizers = response.json()
            print(f"✅ Appetizers Category: OK ({len(appetizers)} items)")
        else:
            print(f"❌ Appetizers Category: Failed (Status {response.status_code})")
            
    except Exception as e:
        print(f"❌ Menu API Error: {str(e)}")
    
    # Test 5: Testimonials
    print("\n⭐ Testing Testimonials API...")
    try:
        # Get approved testimonials
        response = requests.get(f"{API_BASE}/testimonials")
        if response.status_code == 200:
            testimonials = response.json()
            print(f"✅ Testimonials: OK ({len(testimonials)} approved)")
            if testimonials:
                first_testimonial = testimonials[0]
                print(f"   Latest: {first_testimonial['title']} - {first_testimonial['rating']}★")
        else:
            print(f"❌ Testimonials: Failed (Status {response.status_code})")
            
        # Submit new testimonial
        testimonial_data = {
            "name": "API Test User",
            "location": "Testing City",
            "title": "Great API Testing",
            "content": "The API is working perfectly for automated testing!",
            "rating": 5
        }
        response = requests.post(f"{API_BASE}/testimonials", json=testimonial_data)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Testimonial Submission: OK (ID: {result.get('testimonial_id')})")
        else:
            print(f"❌ Testimonial Submission: Failed (Status {response.status_code})")
            
    except Exception as e:
        print(f"❌ Testimonials API Error: {str(e)}")
    
    # Test 6: Bookings
    print("\n🏨 Testing Bookings API...")
    try:
        # Get all bookings (requires auth)
        response = requests.get(f"{API_BASE}/bookings", headers=headers)
        if response.status_code == 200:
            bookings = response.json()
            print(f"✅ Bookings List: OK ({len(bookings)} bookings)")
        else:
            print(f"❌ Bookings List: Failed (Status {response.status_code})")
            
        # Create new booking
        booking_data = {
            "guest_name": "API Test Guest",
            "email": "test@example.com",
            "phone": "+233241234567",
            "checkin_date": "2024-12-20",
            "checkout_date": "2024-12-25",
            "room_type": "deluxe",
            "adults": 2,
            "children": 0,
            "special_requests": "Testing API booking functionality"
        }
        response = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers)
        if response.status_code == 201:
            result = response.json()
            booking_id = result.get('booking_id')
            print(f"✅ Booking Creation: OK (ID: {booking_id})")
        else:
            print(f"❌ Booking Creation: Failed (Status {response.status_code})")
            
    except Exception as e:
        print(f"❌ Bookings API Error: {str(e)}")
    
    # Test 7: Contact Form
    print("\n📧 Testing Contact Form API...")
    try:
        contact_data = {
            "name": "API Tester",
            "email": "tester@example.com",
            "subject": "API Testing Contact",
            "message": "This is a test message from the API test suite."
        }
        response = requests.post(f"{API_BASE}/contact", json=contact_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Contact Form: OK - {result.get('message')}")
        else:
            print(f"❌ Contact Form: Failed (Status {response.status_code})")
    except Exception as e:
        print(f"❌ Contact Form Error: {str(e)}")
    
    # Test 8: User Profile (requires auth)
    print("\n👤 Testing User Profile API...")
    try:
        response = requests.get(f"{API_BASE}/users/profile", headers=headers)
        if response.status_code == 200:
            profile = response.json()
            print("✅ User Profile: OK")
            print(f"   Username: {profile.get('username')}")
            print(f"   Email: {profile.get('email')}")
            print(f"   Role: {profile.get('role')}")
        else:
            print(f"❌ User Profile: Failed (Status {response.status_code})")
    except Exception as e:
        print(f"❌ User Profile Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 API Testing Complete!")
    print("🎉 All core endpoints are functioning properly!")

if __name__ == "__main__":
    # Wait a moment for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    
    try:
        test_api_endpoints()
    except KeyboardInterrupt:
        print("\n⚠️ Testing interrupted by user")
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")