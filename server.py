import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs

# Use the PORT environment variable provided by Render, default to 8000
PORT = int(os.environ.get('PORT', 8000))

# Custom request handler to handle form submissions
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

# Create the server
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}/")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")