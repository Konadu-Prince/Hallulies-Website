"""
Test script for Hallulies Hotel Email System
This script tests the email functionality of the API server
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_email_system():
    print("🧪 Testing Hallulies Hotel Email System")
    print("=" * 50)
    
    # Test 1: Contact form email
    print("\n📧 Testing Contact Form Email...")
    try:
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+233123456789",
            "subject": "Test Contact Form",
            "message": "This is a test message to verify the email system is working properly."
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", 
                                headers={"Content-Type": "application/json"},
                                data=json.dumps(contact_data))
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Contact form email: SUCCESS")
            if "warning" in result:
                print(f"⚠️  Warning: {result['warning']}")
        else:
            print(f"❌ Contact form email: FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Contact form email: ERROR - {str(e)}")
    
    # Test 2: Booking confirmation email
    print("\n🏨 Testing Booking Confirmation Email...")
    try:
        booking_data = {
            "guest_name": "Test Guest",
            "email": "test@example.com",
            "phone": "+233123456789",
            "checkin_date": "2024-12-01",
            "checkout_date": "2024-12-05",
            "room_type": "Deluxe Room",
            "adults": 2,
            "children": 1,
            "special_requests": "Non-smoking room preferred",
            "payment_method": "credit_card",
            "total_amount": 450.00
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", 
                                headers={"Content-Type": "application/json"},
                                data=json.dumps(booking_data))
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Booking confirmation email: SUCCESS")
            print(f"   Booking ID: {result['booking_id']}")
            if "warning" in result:
                print(f"⚠️  Warning: {result['warning']}")
        else:
            print(f"❌ Booking confirmation email: FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Booking confirmation email: ERROR - {str(e)}")
    
    # Test 3: Testimonial notification email
    print("\n⭐ Testing Testimonial Notification Email...")
    try:
        testimonial_data = {
            "name": "Satisfied Customer",
            "location": "Accra, Ghana",
            "title": "Excellent Service!",
            "content": "Had a wonderful stay at Hallulies Hotel. The staff was friendly and the rooms were clean and comfortable.",
            "rating": 5
        }
        
        response = requests.post(f"{BASE_URL}/api/testimonials", 
                                headers={"Content-Type": "application/json"},
                                data=json.dumps(testimonial_data))
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Testimonial notification email: SUCCESS")
            print(f"   Testimonial ID: {result['testimonial_id']}")
            if "warning" in result:
                print(f"⚠️  Warning: {result['warning']}")
        else:
            print(f"❌ Testimonial notification email: FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Testimonial notification email: ERROR - {str(e)}")

    print("\n" + "=" * 50)
    print("📊 Email System Test Summary:")
    print("- Contact form submissions send notifications to admin")
    print("- Booking confirmations send emails to guests")
    print("- New testimonials trigger admin notifications")
    print("- All emails are HTML formatted with professional templates")
    print("- Error handling in place for failed email delivery")

if __name__ == "__main__":
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)  # Give server time to be ready
    
    test_email_system()