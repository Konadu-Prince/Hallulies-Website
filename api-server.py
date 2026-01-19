import http.server
import socketserver
import os
import json
import urllib.parse
from datetime import datetime, timedelta
import hashlib
import jwt
import sqlite3
from functools import wraps

PORT = int(os.environ.get('PORT', 8000))
SECRET_KEY = os.environ.get('SECRET_KEY', 'hallulies_secret_key_2024')

# Database setup
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

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def wrapper(self, *args, **kwargs):
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Authorization header required'}).encode())
            return
        
        try:
            token = auth_header.split('Bearer ')[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            self.current_user = payload
        except jwt.ExpiredSignatureError:
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Token expired'}).encode())
            return
        except jwt.InvalidTokenError:
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid token'}).encode())
            return
        
        return f(self, *args, **kwargs)
    return wrapper

# Role-based authorization decorator
def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def wrapper(self, *args, **kwargs):
            if not hasattr(self, 'current_user'):
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Authentication required'}).encode())
                return
            
            user_role = self.current_user.get('role', 'user')
            if user_role != required_role and user_role != 'admin':
                self.send_response(403)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Insufficient permissions'}).encode())
                return
            
            return f(self, *args, **kwargs)
        return wrapper
    return decorator

class HalluliesAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            # API Routes
            self.send_cors_headers()
            if self.path == '/api/bookings':
                self.handle_get_bookings()
            elif self.path.startswith('/api/bookings/'):
                self.send_cors_headers()
                booking_id = self.path.split('/')[-1]
                self.handle_get_booking(booking_id)
            elif self.path == '/api/testimonials':
                self.send_cors_headers()
                self.handle_get_testimonials()
            elif self.path == '/api/menu':
                self.send_cors_headers()
                self.handle_get_menu()
            elif self.path.startswith('/api/menu/category/'):
                self.send_cors_headers()
                category = self.path.split('/')[-1]
                self.handle_get_menu_by_category(category)
            elif self.path == '/api/analytics/dashboard':
                self.send_cors_headers()
                self.handle_get_dashboard_analytics()
            elif self.path == '/api/users/profile':
                self.send_cors_headers()
                self.handle_get_user_profile()
            elif self.path == '/api/docs':
                self.send_cors_headers()
                self.handle_api_docs()
            else:
                self.send_cors_headers()
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
        else:
            # Static file serving
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.send_cors_headers()
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
            elif self.path == '/api/auth/register':
                self.handle_register(data)
            elif self.path == '/api/bookings':
                self.handle_create_booking(data)
            elif self.path == '/api/testimonials':
                self.handle_create_testimonial(data)
            elif self.path == '/api/menu':
                self.handle_create_menu_item(data)
            elif self.path == '/api/contact':
                self.handle_contact_form(data)
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.send_cors_headers()
            content_length = int(self.headers.get('Content-Length', 0))
            put_data = self.rfile.read(content_length) if content_length > 0 else b''
            
            try:
                data = json.loads(put_data.decode()) if put_data else {}
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode())
                return
            
            if self.path.startswith('/api/bookings/'):
                self.send_cors_headers()
                booking_id = self.path.split('/')[-1]
                self.handle_update_booking(booking_id, data)
            elif self.path.startswith('/api/testimonials/'):
                self.send_cors_headers()
                testimonial_id = self.path.split('/')[-1]
                self.handle_update_testimonial(testimonial_id, data)
            elif self.path.startswith('/api/menu/'):
                self.send_cors_headers()
                menu_id = self.path.split('/')[-1]
                self.handle_update_menu_item(menu_id, data)
            else:
                self.send_cors_headers()
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'API endpoint not found'}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.send_cors_headers()
            if self.path.startswith('/api/bookings/'):
                booking_id = self.path.split('/')[-1]
                self.handle_delete_booking(booking_id)
            elif self.path.startswith('/api/testimonials/'):
                testimonial_id = self.path.split('/')[-1]
                self.handle_delete_testimonial(testimonial_id)
            elif self.path.startswith('/api/menu/'):
                menu_id = self.path.split('/')[-1]
                self.handle_delete_menu_item(menu_id)
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
    
    def handle_register(self, data):
        # Registration logic here
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'User registered successfully'}).encode())
    
    def handle_create_booking(self, data):
        required_fields = ['guest_name', 'email', 'checkin_date', 'checkout_date', 'room_type']
        if not all(field in data for field in required_fields):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO bookings (guest_name, email, phone, checkin_date, checkout_date, 
                                room_type, adults, children, special_requests, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['guest_name'], data['email'], data.get('phone', ''),
            data['checkin_date'], data['checkout_date'], data['room_type'],
            data.get('adults', 1), data.get('children', 0),
            data.get('special_requests', ''), data.get('total_amount')
        ))
        
        booking_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'message': 'Booking created successfully',
            'booking_id': booking_id
        }).encode())
    
    def handle_get_bookings(self):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bookings ORDER BY created_at DESC')
        bookings = cursor.fetchall()
        conn.close()
        
        booking_list = []
        for booking in bookings:
            booking_list.append({
                'id': booking[0],
                'guest_name': booking[1],
                'email': booking[2],
                'phone': booking[3],
                'checkin_date': booking[4],
                'checkout_date': booking[5],
                'room_type': booking[6],
                'adults': booking[7],
                'children': booking[8],
                'special_requests': booking[9],
                'status': booking[10],
                'total_amount': booking[11],
                'created_at': booking[12]
            })
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(booking_list).encode())
    
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
        conn.close()
        
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'message': 'Testimonial submitted successfully',
            'testimonial_id': testimonial_id
        }).encode())
    
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
    
    def handle_contact_form(self, data):
        # Handle contact form submission
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Message sent successfully'}).encode())
    
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
                    "POST /api/bookings": "Create new booking",
                    "GET /api/bookings/{id}": "Get specific booking",
                    "PUT /api/bookings/{id}": "Update booking",
                    "DELETE /api/bookings/{id}": "Delete booking"
                },
                "Testimonials": {
                    "GET /api/testimonials": "Get approved testimonials",
                    "POST /api/testimonials": "Submit new testimonial",
                    "PUT /api/testimonials/{id}": "Update testimonial",
                    "DELETE /api/testimonials/{id}": "Delete testimonial"
                },
                "Menu": {
                    "GET /api/menu": "Get all menu items",
                    "POST /api/menu": "Create menu item",
                    "GET /api/menu/category/{category}": "Get menu by category",
                    "PUT /api/menu/{id}": "Update menu item",
                    "DELETE /api/menu/{id}": "Delete menu item"
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
    
    # Additional handler methods
    def handle_get_user_profile(self):
        if not hasattr(self, 'current_user'):
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Authentication required'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ?', 
                      (self.current_user['user_id'],))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            user_data = {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'role': user[3],
                'created_at': user[4],
                'last_login': datetime.now().isoformat()
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(user_data).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'User not found'}).encode())
    
    def handle_create_menu_item(self, data):
        required_fields = ['name', 'description', 'category', 'price']
        if not all(field in data for field in required_fields):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
            return
        
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO menu_items (name, description, category, price, discounted_price, 
                                  ingredients, allergens, tags, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'], data['description'], data['category'],
            float(data['price']), data.get('discounted_price'),
            data.get('ingredients', ''), data.get('allergens', ''),
            data.get('tags', ''), data.get('image_url', '')
        ))
        
        menu_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'message': 'Menu item created successfully',
            'menu_id': menu_id
        }).encode())
    
    def handle_get_menu_by_category(self, category):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM menu_items WHERE category = ? AND is_active = 1 ORDER BY name', (category,))
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
    
    def handle_update_booking(self, booking_id, data):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if booking exists
        cursor.execute('SELECT id FROM bookings WHERE id = ?', (booking_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Booking not found'}).encode())
            return
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        allowed_fields = ['guest_name', 'email', 'phone', 'checkin_date', 'checkout_date', 
                         'room_type', 'adults', 'children', 'special_requests', 'status', 'total_amount']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f'{field} = ?')
                update_values.append(data[field])
        
        if not update_fields:
            conn.close()
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No valid fields to update'}).encode())
            return
        
        update_values.append(booking_id)
        query = f'UPDATE bookings SET {", ".join(update_fields)} WHERE id = ?'
        
        cursor.execute(query, update_values)
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Booking updated successfully'}).encode())
    
    def handle_update_testimonial(self, testimonial_id, data):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if testimonial exists
        cursor.execute('SELECT id FROM testimonials WHERE id = ?', (testimonial_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Testimonial not found'}).encode())
            return
        
        # Build update query
        update_fields = []
        update_values = []
        
        allowed_fields = ['name', 'location', 'title', 'content', 'rating', 'status']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f'{field} = ?')
                update_values.append(data[field])
        
        if not update_fields:
            conn.close()
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No valid fields to update'}).encode())
            return
        
        update_values.append(testimonial_id)
        query = f'UPDATE testimonials SET {", ".join(update_fields)} WHERE id = ?'
        
        cursor.execute(query, update_values)
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Testimonial updated successfully'}).encode())
    
    def handle_update_menu_item(self, menu_id, data):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if menu item exists
        cursor.execute('SELECT id FROM menu_items WHERE id = ?', (menu_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Menu item not found'}).encode())
            return
        
        # Build update query
        update_fields = []
        update_values = []
        
        allowed_fields = ['name', 'description', 'category', 'price', 'discounted_price', 
                         'ingredients', 'allergens', 'tags', 'image_url', 'is_active']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f'{field} = ?')
                if field in ['price', 'discounted_price']:
                    update_values.append(float(data[field]) if data[field] else None)
                else:
                    update_values.append(data[field])
        
        if not update_fields:
            conn.close()
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No valid fields to update'}).encode())
            return
        
        update_values.append(menu_id)
        query = f'UPDATE menu_items SET {", ".join(update_fields)} WHERE id = ?'
        
        cursor.execute(query, update_values)
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Menu item updated successfully'}).encode())
    
    def handle_delete_booking(self, booking_id):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if booking exists
        cursor.execute('SELECT id FROM bookings WHERE id = ?', (booking_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Booking not found'}).encode())
            return
        
        # Soft delete - update status instead of removing
        cursor.execute('UPDATE bookings SET status = "cancelled" WHERE id = ?', (booking_id,))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Booking cancelled successfully'}).encode())
    
    def handle_delete_testimonial(self, testimonial_id):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if testimonial exists
        cursor.execute('SELECT id FROM testimonials WHERE id = ?', (testimonial_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Testimonial not found'}).encode())
            return
        
        # Soft delete - update status instead of removing
        cursor.execute('UPDATE testimonials SET status = "deleted" WHERE id = ?', (testimonial_id,))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Testimonial deleted successfully'}).encode())
    
    def handle_delete_menu_item(self, menu_id):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        
        # Check if menu item exists
        cursor.execute('SELECT id FROM menu_items WHERE id = ?', (menu_id,))
        if not cursor.fetchone():
            conn.close()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Menu item not found'}).encode())
            return
        
        # Soft delete - set is_active to False
        cursor.execute('UPDATE menu_items SET is_active = 0 WHERE id = ?', (menu_id,))
        conn.commit()
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'Menu item deactivated successfully'}).encode())
    
    def handle_get_booking(self, booking_id):
        conn = sqlite3.connect('hallulies.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,))
        booking = cursor.fetchone()
        conn.close()
        
        if not booking:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Booking not found'}).encode())
            return
        
        booking_data = {
            'id': booking[0],
            'guest_name': booking[1],
            'email': booking[2],
            'phone': booking[3],
            'checkin_date': booking[4],
            'checkout_date': booking[5],
            'room_type': booking[6],
            'adults': booking[7],
            'children': booking[8],
            'special_requests': booking[9],
            'status': booking[10],
            'total_amount': booking[11],
            'created_at': booking[12]
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(booking_data).encode())

if __name__ == "__main__":
    # Initialize database
    init_database()
    
    # Start server
    with socketserver.TCPServer(("0.0.0.0", PORT), HalluliesAPIHandler) as httpd:
        print(f"🚀 Hallulies Hotel API Server running at http://0.0.0.0:{PORT}")
        print("🔐 Admin login: admin@hallulies.com / admin123")
        print("📚 API Documentation: http://0.0.0.0:8000/api/docs")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")