import http.server
import socketserver
import json
import os
import threading
import time
import urllib.request
import urllib.error
from urllib.parse import parse_qs

# Use the PORT environment variable provided by Render, default to 8000
PORT = int(os.environ.get('PORT', 8000))

# Self-ping configuration
PING_INTERVAL = int(os.environ.get('PING_INTERVAL', 900))  # 15 minutes default
ENABLE_SELF_PING = os.environ.get('ENABLE_SELF_PING', 'true').lower() == 'true'

# Global variable to track server URL
server_url = None

# Self-ping function
def self_ping():
    global server_url
    while True:
        try:
            if server_url:
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Self-pinging server at {server_url}")
                req = urllib.request.Request(
                    server_url,
                    headers={'User-Agent': 'Render-Self-Ping-Bot/1.0'}
                )
                response = urllib.request.urlopen(req, timeout=10)
                print(f"✅ Self-ping successful - Status: {response.getcode()}")
            else:
                print("⚠️ Server URL not set yet, waiting...")
        except urllib.error.URLError as e:
            print(f"❌ Self-ping failed: {e}")
        except Exception as e:
            print(f"❌ Unexpected error in self-ping: {e}")
        
        time.sleep(PING_INTERVAL)

# Start self-ping thread
def start_self_ping():
    if ENABLE_SELF_PING:
        ping_thread = threading.Thread(target=self_ping, daemon=True)
        ping_thread.start()
        print(f"🚀 Self-ping thread started - Interval: {PING_INTERVAL} seconds")
    else:
        print("⏭️ Self-ping disabled")
class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/process-'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            # Parse the form data
            parsed_data = parse_qs(post_data)
            
            # Prepare response data
            response_data = {
                "status": "success",
                "message": "Form submitted successfully!"
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            # For other POST requests, return 404
            self.send_response(404)
            self.end_headers()
            
    def do_GET(self):
        if self.path == '/config.js':
            # Generate config.js with environment variables
            public_key = os.environ.get('EMAILJS_PUBLIC_KEY', 'YOUR_PUBLIC_KEY_HERE')
            service_id = os.environ.get('EMAILJS_SERVICE_ID', 'YOUR_SERVICE_ID_HERE')
            
            config_content = f"""// Generated config.js with environment variables
window.EMAILJS_CONFIG = {{
    publicKey: '{public_key}',
    serviceId: '{service_id}'
}};
"""
            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.end_headers()
            self.wfile.write(config_content.encode('utf-8'))
        elif self.path == '/health':
            # Health check endpoint for self-ping
            health_data = {
                "status": "healthy",
                "timestamp": time.time(),
                "uptime": time.strftime('%Y-%m-%d %H:%M:%S'),
                "server": "Hallulies-Website-Python-Server"
            }
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(health_data).encode('utf-8'))
        else:
            # Serve static files
            super().do_GET()
            
    def end_headers(self):
        # Enable CORS for all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

Handler = CustomHTTPRequestHandler

# Set the server URL for self-ping
if os.environ.get('RENDER_EXTERNAL_URL'):
    server_url = os.environ.get('RENDER_EXTERNAL_URL')
elif os.environ.get('HOSTNAME'):
    server_url = f"https://{os.environ.get('HOSTNAME')}.onrender.com"
else:
    # Fallback for local development
    server_url = f"http://localhost:{PORT}"

print(f"🌐 Server URL detected: {server_url}")

# Start the self-ping thread
start_self_ping()

# Create the server
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}/")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")