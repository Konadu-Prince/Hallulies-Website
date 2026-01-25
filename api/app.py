"""
API Endpoints for Hallulies Hotel Website
Senior UI/UX Developer Backend Implementation
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
import uuid
import stripe

app = Flask(__name__)
CORS(app)

# Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_your_key_here')
stripe.api_key = STRIPE_SECRET_KEY

# Mock data storage (in production, use a database)
documents_storage = []
payments_storage = []

# Search API
@app.route('/api/search', methods=['GET'])
def search():
    """Handle search queries with filtering"""
    query = request.args.get('q', '').lower()
    category = request.args.get('category', 'all')
    limit = int(request.args.get('limit', 10))
    
    # Mock search results
    mock_results = [
        {
            'id': '1',
            'title': 'Luxury Suite Room',
            'description': 'Premium accommodation with stunning views',
            'category': 'rooms',
            'type': 'room',
            'slug': 'luxury-suite',
            'url': '/booking.html?room=luxury-suite'
        },
        {
            'id': '2', 
            'title': 'Fine Dining Restaurant',
            'description': 'Exquisite cuisine featuring local delicacies',
            'category': 'services',
            'type': 'service',
            'slug': 'fine-dining',
            'url': '#restaurant'
        },
        {
            'id': '3',
            'title': 'Wedding Event Hall',
            'description': 'Perfect venue for your special celebration',
            'category': 'events',
            'type': 'event',
            'slug': 'wedding-hall',
            'url': '/events.html?id=wedding-hall'
        }
    ]
    
    # Filter results
    filtered_results = mock_results
    if category != 'all':
        filtered_results = [r for r in filtered_results if r['category'] == category]
    
    if query:
        filtered_results = [r for r in filtered_results 
                          if query in r['title'].lower() or query in r['description'].lower()]
    
    return jsonify({
        'results': filtered_results[:limit],
        'total': len(filtered_results)
    })

# Document Management APIs
@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get user documents with filtering"""
    view = request.args.get('view', 'all')
    
    # Mock documents data
    mock_documents = [
        {
            'id': 'doc_1',
            'title': 'Invoice #INV-001',
            'description': 'Luxury Suite Booking - 3 nights',
            'type': 'invoice',
            'status': 'paid',
            'amount': '1200.00',
            'currency': '₵',
            'created_at': '2024-01-15T10:30:00Z',
            'file_type': 'pdf',
            'file_size': 1024000
        },
        {
            'id': 'doc_2',
            'title': 'Receipt #REC-001', 
            'description': 'Restaurant Payment - Dinner Service',
            'type': 'receipt',
            'status': 'paid',
            'amount': '250.00',
            'currency': '₵',
            'created_at': '2024-01-14T19:45:00Z',
            'file_type': 'pdf',
            'file_size': 512000
        },
        {
            'id': 'doc_3',
            'title': 'Invoice #INV-002',
            'description': 'Event Hall Booking - Wedding Reception',
            'type': 'invoice',
            'status': 'pending',
            'amount': '800.00',
            'currency': '₵',
            'created_at': '2024-01-16T09:15:00Z',
            'file_type': 'pdf',
            'file_size': 768000
        }
    ]
    
    # Filter by view
    if view != 'all':
        mock_documents = [doc for doc in mock_documents if doc['type'] == view or view == 'all']
    
    return jsonify({'documents': mock_documents})

@app.route('/api/documents/<doc_id>/view', methods=['GET'])
def view_document(doc_id):
    """View document content"""
    # Mock document content
    return jsonify({
        'id': doc_id,
        'content': f'Document content for {doc_id}',
        'url': f'/documents/{doc_id}.pdf'
    })

@app.route('/api/documents/<doc_id>/download', methods=['GET'])
def download_document(doc_id):
    """Download document file"""
    # In production, serve actual file
    return send_file('mock_document.pdf', as_attachment=True)

@app.route('/api/documents/<doc_id>/share-link', methods=['GET'])
def generate_share_link(doc_id):
    """Generate shareable link for document"""
    share_link = f'https://hallulies-hotel.onrender.com/share/{doc_id}'
    return jsonify({'share_link': share_link})

@app.route('/api/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete document"""
    global documents_storage
    documents_storage = [doc for doc in documents_storage if doc['id'] != doc_id]
    return jsonify({'success': True, 'message': 'Document deleted'})

@app.route('/api/upload-document', methods=['POST'])
def upload_document():
    """Upload new document"""
    try:
        # Handle file upload
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Save file (in production, save to cloud storage)
        filename = f"{uuid.uuid4()}_{file.filename}"
        # file.save(os.path.join('uploads', filename))
        
        # Store document metadata
        document = {
            'id': str(uuid.uuid4()),
            'title': request.form.get('title'),
            'type': request.form.get('type'),
            'description': request.form.get('description'),
            'amount': request.form.get('amount'),
            'filename': filename,
            'file_size': len(file.read()),
            'created_at': datetime.now().isoformat(),
            'status': 'draft'
        }
        
        documents_storage.append(document)
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'document': document
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Payment APIs
@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Create Stripe payment intent"""
    try:
        data = request.get_json()
        amount = int(float(data['amount']) * 100)  # Convert to cents
        
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=data['currency'].lower(),
            metadata={
                'description': 'Hallulies Hotel Booking Payment'
            }
        )
        
        return jsonify({
            'clientSecret': intent.client_secret,
            'publishableKey': os.environ.get('STRIPE_PUBLISHABLE_KEY')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/process-card-payment', methods=['POST'])
def process_card_payment():
    """Process card payment (server-side)"""
    try:
        data = request.get_json()
        
        # Mock payment processing
        payment_id = str(uuid.uuid4())
        payment_record = {
            'id': payment_id,
            'amount': data['amount'],
            'currency': 'GHS',
            'status': 'succeeded',
            'method': 'card',
            'customer': {
                'name': data['customer_name'],
                'email': data['customer_email'],
                'phone': data['customer_phone']
            },
            'created_at': datetime.now().isoformat()
        }
        
        payments_storage.append(payment_record)
        
        return jsonify(payment_record)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/process-mobile-money', methods=['POST'])
def process_mobile_money():
    """Process mobile money payment"""
    try:
        data = request.get_json()
        
        # Mock mobile money processing
        payment_id = str(uuid.uuid4())
        payment_record = {
            'id': payment_id,
            'amount': data['amount'],
            'currency': 'GHS',
            'status': 'pending',  # Mobile money usually requires confirmation
            'method': 'mobile_money',
            'customer': {
                'name': data['customer_name'],
                'email': data['customer_email'],
                'phone': data['mobile_number']
            },
            'network': data['mobile_network'],
            'created_at': datetime.now().isoformat()
        }
        
        payments_storage.append(payment_record)
        
        return jsonify({
            'id': payment_id,
            'status': 'pending',
            'message': 'Payment initiated. Please check your mobile money app to complete the transaction.'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/process-bank-transfer', methods=['POST'])
def process_bank_transfer():
    """Process bank transfer payment"""
    try:
        data = request.get_json()
        
        # Mock bank transfer processing
        payment_id = str(uuid.uuid4())
        payment_record = {
            'id': payment_id,
            'amount': data['amount'],
            'currency': 'GHS',
            'status': 'pending',
            'method': 'bank_transfer',
            'customer': {
                'name': data['customer_name'],
                'email': data['customer_email'],
                'phone': data['customer_phone']
            },
            'bank': data['bank_name'],
            'account_number': data['account_number'],
            'created_at': datetime.now().isoformat()
        }
        
        payments_storage.append(payment_record)
        
        return jsonify({
            'id': payment_id,
            'status': 'pending',
            'message': f'Please transfer GHS {data["amount"]} to our {data["bank_name"]} account ending in {data["account_number"][-4:]}. Reference: {payment_id}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/payment-status/<payment_id>', methods=['GET'])
def get_payment_status(payment_id):
    """Get payment status"""
    payment = next((p for p in payments_storage if p['id'] == payment_id), None)
    if payment:
        return jsonify(payment)
    return jsonify({'error': 'Payment not found'}), 404

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': 'connected',
            'stripe': 'configured' if STRIPE_SECRET_KEY else 'not_configured',
            'search': 'operational'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))