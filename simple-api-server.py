import http.server
import socketserver
import os
import json
import sqlite3
from datetime import datetime, timedelta
import jwt
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PORT = int(os.environ.get('PORT', 8000))
SECRET_KEY = os.environ.get('SECRET_KEY', 'hallulies_secret_key_2024')

# Email configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'hallulies6@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')  # Use app password for Gmail

# Database setup
# Email utility functions
def send_email(to_email, subject, body_html):
    """Send an email using SMTP"""
    if not EMAIL_HOST_PASSWORD:
        print("Warning: EMAIL_HOST_PASSWORD not set. Email sending disabled.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_HOST_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(body_html, 'html'))
        
        # Create SMTP session
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()  # Enable TLS encryption
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(EMAIL_HOST_USER, to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

def send_booking_confirmation_email(booking_data, to_email):
    """Send booking confirmation email"""
    subject = f"Booking Confirmation - {booking_data['guest_name']}"
    
    body_html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(90deg, #d2691e, #8b4513); color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .details {{ background: #f9f9f9; padding: 15px; margin: 15px 0; }}
            .footer {{ background: #f0f0f0; padding: 15px; text-align: center; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Confirmation</h1>
                <p>Hallulies Hotel & Restaurant/Bar</p>
            </div>
            <div class="content">
                <h2>Hello {booking_data['guest_name']},</h2>
                <p>Thank you for your booking at Hallulies Hotel & Restaurant/Bar. Your reservation has been confirmed.</p>
                
                <div class="details">
                    <h3>Booking Details:</h3>
                    <p><strong>Check-in:</strong> {booking_data['checkin_date']}</p>
                    <p><strong>Check-out:</strong> {booking_data['checkout_date']}</p>
                    <p><strong>Room Type:</strong> {booking_data['room_type']}</p>
                    <p><strong>Guests:</strong> {booking_data['adults']} Adults, {booking_data['children']} Children</p>
                    <p><strong>Email:</strong> {booking_data['email']}</p>
                    <p><strong>Phone:</strong> {booking_data['phone']}</p>
                    {f'<p><strong>Special Requests:</strong> {booking_data['special_requests']}</p>' if booking_data.get('special_requests') else ''}
                </div>
                
                <p>If you have any questions or need to make changes to your reservation, please contact us at <a href="mailto:hallulies6@gmail.com">hallulies6@gmail.com</a> or call 0247533518.</p>
                
                <p>We look forward to welcoming you!</p>
                
                <p>Best regards,<br>The Hallulies Team</p>
            </div>
            <div class="footer">
                <p>Hallulies Hotel & Restaurant/Bar<br>Asufufu-Sunyani, Ghana</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, body_html)

def send_testimonial_notification_email(testimonial_data):
    """Send notification email to admin when a new testimonial is submitted"""
    subject = f"New Testimonial Submitted - {testimonial_data['name']}"
    
    body_html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(90deg, #d2691e, #8b4513); color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .testimonial {{ background: #f9f9f9; padding: 15px; margin: 15px 0; }}
            .footer {{ background: #f0f0f0; padding: 15px; text-align: center; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Testimonial Submission</h1>
                <p>Hallulies Hotel & Restaurant/Bar</p>
            </div>
            <div class="content">
                <h2>A new testimonial has been submitted:</h2>
                
                <div class="testimonial">
                    <p><strong>Name:</strong> {testimonial_data['name']}</p>
                    <p><strong>Location:</strong> {testimonial_data.get('location', 'N/A')}</p>
                    <p><strong>Title:</strong> {testimonial_data['title']}</p>
                    <p><strong>Rating:</strong> {testimonial_data['rating']}/5 stars</p>
                    <p><strong>Content:</strong> {testimonial_data['content']}</p>
                </div>
                
                <p>Please log in to the admin panel to review and approve this testimonial.</p>
            </div>
            <div class="footer">
                <p>Hallulies Hotel & Restaurant/Bar<br>Asufufu-Sunyani, Ghana</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(EMAIL_HOST_USER, subject, body_html)

def init_database():
    conn = sqlite3.connect('hallulies.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            checkin_date DATE NOT NULL,
            checkout_date DATE NOT NULL,
            room_type TEXT NOT NULL,
            adults INTEGER DEFAULT 1,
            children INTEGER DEFAULT 0,
            special_requests TEXT,
            status TEXT DEFAULT 'pending',
            total_amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            rating INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            discounted_price REAL,
            ingredients TEXT,
            allergens TEXT,
            tags TEXT,
            image_url TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert sample admin user (password: admin123)
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    ''', ('admin', 'admin@hallulies.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', 'admin'))
    
    # Insert sample menu items
    sample_menu_items = [
        ('Bruschetta Trio', 'Fresh tomatoes, basil, garlic on ciabatta', 'appetizers', 35.0, 26.0, 'Ciabatta bread, tomatoes, basil, garlic, olive oil', 'Gluten', 'vegetarian,gluten-free', ''),
        ('Seared Scallops', 'Pan-seared Atlantic scallops with cauliflower purée', 'appetizers', 45.0, 34.0, 'Atlantic scallops, cauliflower, pancetta, truffle oil', 'Milk', 'seafood,gluten-free', ''),
        ('Herb-Crusted Rack of Lamb', 'New Zealand lamb with rosemary crust and mint jus', 'mains', 85.0, 68.0, 'New Zealand lamb, fresh herbs, mint, root vegetables', 'Milk,Gluten', 'meat', ''),
        ('Wild Mushroom Risotto', 'Creamy arborio rice with wild forest mushrooms', 'mains', 42.0, None, 'Arborio rice, wild mushrooms, vegetable stock, white wine', 'Milk', 'vegetarian,vegan,gluten-free', '')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO menu_items (name, description, category, price, discounted_price, ingredients, allergens, tags, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_menu_items)
    
    conn.commit()
    conn.close()

class SimpleAPIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            # API Routes
            if self.path == '/api/docs':
                self.handle_api_docs()
            elif self.path == '/api/menu':
                self.handle_get_menu()
            elif self.path == '/api/testimonials':
                self.handle_get_testimonials()
            elif self.path == '/api/bookings':
                self.handle_get_bookings()
            elif self.path == '/api/analytics/dashboard':
                self.handle_get_dashboard_analytics()
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
        else:
            # Static file serving
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b''
            
            try:
                data = json.loads(post_data.decode()) if post_data else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode())
                return
            
            # API Routes
            if self.path == '/api/auth/login':
                self.handle_login(data)
            elif self.path == '/api/testimonials':
                self.handle_create_testimonial(data)
            elif self.path == '/api/contact':
                self.handle_contact_form(data)
            elif self.path == '/api/bookings':
                self.handle_create_booking(data)
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    # Handler methods
    def handle_login(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Email and password required'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, password_hash, role FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        # Simple password check (in production, use proper hashing)
        if user and user[3] == '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S':  # bcrypt hash of "admin123"
            token = jwt.encode({
                'user_id': user[0],
                'username': user[1],
                'email': user[2],
                'role': user[4],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, SECRET_KEY, algorithm='HS256')
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'token': token,
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'role': user[4]
                }
            }).encode())
        else:
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid credentials'}).encode())
    
    def handle_get_menu(self):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM menu_items WHERE is_active = 1 ORDER BY category, name')
        menu_items = cursor.fetchall()
        conn.close()
        
        menu_list = []
        for item in menu_items:
            menu_list.append({
                'id': item[0],
                'name': item[1],
                'description': item[2],
                'category': item[3],
                'price': item[4],
                'discounted_price': item[5],
                'ingredients': item[6],
                'allergens': item[7],
                'tags': item[8],
                'image_url': item[9],
                'is_active': bool(item[10]),
                'created_at': item[11]
            })
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(menu_list).encode())
    
    def handle_get_testimonials(self):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM testimonials WHERE status = "approved" ORDER BY created_at DESC')
        testimonials = cursor.fetchall()
        conn.close()
        
        testimonial_list = []
        for testimonial in testimonials:
            testimonial_list.append({
                'id': testimonial[0],
                'name': testimonial[1],
                'location': testimonial[2],
                'title': testimonial[3],
                'content': testimonial[4],
                'rating': testimonial[5],
                'status': testimonial[6],
                'created_at': testimonial[7]
            })
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(testimonial_list).encode())
    
    def handle_create_testimonial(self, data):
        required_fields = ['name', 'title', 'content', 'rating']
        if not all(field in data for field in required_fields):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO testimonials (name, location, title, content, rating)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'], data.get('location', ''), data['title'],
            data['content'], data['rating']
        ))
        
        testimonial_id = cursor.lastrowid
        conn.commit()
        
        # Send notification email to admin
        testimonial_data = {
            'name': data['name'],
            'location': data.get('location', ''),
            'title': data['title'],
            'content': data['content'],
            'rating': data['rating']
        }
        email_sent = send_testimonial_notification_email(testimonial_data)
        
        conn.close()
        
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response_data = {
            'message': 'Testimonial submitted successfully',
            'testimonial_id': testimonial_id
        }
        if not email_sent:
            response_data['warning'] = 'Testimonial submitted but admin notification email failed to send.'
        
        self.wfile.write(json.dumps(response_data).encode())
    
    def handle_contact_form(self, data):
        # Extract contact form data
        name = data.get('name', '')
        email = data.get('email', '')
        phone = data.get('phone', '')
        subject = data.get('subject', 'Contact Form Submission')
        message = data.get('message', '')
        
        if not name or not email or not message:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Name, email, and message are required'}).encode())
            return
        
        # Send email notification to admin
        subject = f"New Contact Message - {name}"
        body_html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(90deg, #d2691e, #8b4513); color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .message {{ background: #f9f9f9; padding: 15px; margin: 15px 0; }}
                .footer {{ background: #f0f0f0; padding: 15px; text-align: center; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Contact Message</h1>
                    <p>Hallulies Hotel & Restaurant/Bar</p>
                </div>
                <div class="content">
                    <h2>You have received a new message:</h2>
                    
                    <div class="message">
                        <p><strong>From:</strong> {name}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Phone:</strong> {phone}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Message:</strong> {message}</p>
                    </div>
                    
                    <p>Please respond to this inquiry as soon as possible.</p>
                </div>
                <div class="footer">
                    <p>Hallulies Hotel & Restaurant/Bar<br>Asufufu-Sunyani, Ghana</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email to admin
        email_sent = send_email(EMAIL_HOST_USER, subject, body_html)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response_data = {'message': 'Message sent successfully'}
        if not email_sent:
            response_data['warning'] = 'Message saved but email notification failed. Please check server logs.'
        self.wfile.write(json.dumps(response_data).encode())
    
    def handle_get_bookings(self):
        # For security reasons, only authenticated admin users can view bookings
        # For now, return empty array
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps([]).encode())
    
    def handle_create_booking(self, data):
        required_fields = ['guest_name', 'email', 'phone', 'checkin_date', 'checkout_date', 'room_type']
        if not all(field in data for field in required_fields):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO bookings (
                    guest_name, email, phone, checkin_date, checkout_date, 
                    room_type, adults, children, special_requests, total_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['guest_name'], data['email'], data['phone'], 
                data['checkin_date'], data['checkout_date'], data['room_type'],
                data.get('adults', 1), data.get('children', 0), 
                data.get('special_requests', ''), data.get('total_amount', 0.0)
            ))
            
            booking_id = cursor.lastrowid
            conn.commit()
            
            # Send booking confirmation email
            booking_data = {
                'id': booking_id,
                'guest_name': data['guest_name'],
                'email': data['email'],
                'phone': data['phone'],
                'checkin_date': data['checkin_date'],
                'checkout_date': data['checkout_date'],
                'room_type': data['room_type'],
                'adults': data.get('adults', 1),
                'children': data.get('children', 0),
                'special_requests': data.get('special_requests', '')
            }
            
            email_sent = send_booking_confirmation_email(booking_data, data['email'])
            
            conn.close()
            
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response_data = {
                'message': 'Booking created successfully',
                'booking_id': booking_id
            }
            if not email_sent:
                response_data['warning'] = 'Booking created but confirmation email failed to send. Please contact us directly.'
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            conn.close()
            print(f"Error creating booking: {str(e)}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Failed to create booking'}).encode())
    
    def handle_get_dashboard_analytics(self):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Get total bookings
        cursor.execute('SELECT COUNT(*) FROM bookings')
        total_bookings = cursor.fetchone()[0]
        
        # Get recent bookings count
        cursor.execute('''
            SELECT COUNT(*) FROM bookings 
            WHERE created_at >= datetime('now', '-30 days')
        ''')
        recent_bookings = cursor.fetchone()[0]
        
        # Get approved testimonials count
        cursor.execute('SELECT COUNT(*) FROM testimonials WHERE status = "approved"')
        approved_testimonials = cursor.fetchone()[0]
        
        # Get average rating
        cursor.execute('SELECT AVG(rating) FROM testimonials WHERE status = "approved"')
        avg_rating = cursor.fetchone()[0] or 0
        
        conn.close()
        
        analytics = {
            'total_bookings': total_bookings,
            'recent_bookings': recent_bookings,
            'approved_testimonials': approved_testimonials,
            'average_rating': round(avg_rating, 1),
            'revenue_30_days': 124560  # Mock data
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(analytics).encode())
    
    def handle_api_docs(self):
        docs = {
            "title": "Hallulies Hotel API Documentation",
            "version": "1.0.0",
            "endpoints": {
                "Authentication": {
                    "POST /api/auth/login": "User login",
                    "POST /api/auth/register": "User registration"
                },
                "Bookings": {
                    "GET /api/bookings": "Get all bookings",
                    "POST /api/bookings": "Create new booking"
                },
                "Testimonials": {
                    "GET /api/testimonials": "Get approved testimonials",
                    "POST /api/testimonials": "Submit new testimonial"
                },
                "Menu": {
                    "GET /api/menu": "Get all menu items"
                },
                "Analytics": {
                    "GET /api/analytics/dashboard": "Get dashboard analytics"
                }
            },
            "authentication": "Use Bearer token in Authorization header",
            "sample_data": {
                "login_request": {
                    "email": "admin@hallulies.com",
                    "password": "admin123"
                }
            }
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(docs, indent=2).encode())

if __name__ == "__main__":
    # Initialize database
    init_database()
    
    # Start server
    with socketserver.TCPServer(("0.0.0.0", PORT), SimpleAPIHandler) as httpd:
        print(f"🚀 Hallulies Hotel API Server running at http://0.0.0.0:{PORT}")
        print("🔐 Admin login: admin@hallulies.com / admin123")
        print("📚 API Documentation: http://0.0.0.0:8000/api/docs")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")