/**
 * Advanced Payment System Component
 * Senior UI/UX Developer Implementation
 */

class PaymentSystem {
    constructor(options = {}) {
        this.config = {
            stripePublicKey: null,
            paypalClientId: null,
            currency: 'GHS',
            supportedMethods: ['card', 'mobile_money', 'bank_transfer'],
            ...options
        };
        
        this.state = {
            currentMethod: 'card',
            formData: {},
            isProcessing: false,
            errors: {}
        };
        
        this.elements = {};
        this.stripe = null;
        this.init();
    }
    
    async init() {
        await this.loadPaymentLibraries();
        this.createDOMElements();
        this.bindEvents();
        this.setupValidation();
    }
    
    async loadPaymentLibraries() {
        // Load Stripe.js if configured
        if (this.config.stripePublicKey) {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            document.head.appendChild(script);
            
            // Wait for Stripe to load
            await new Promise(resolve => {
                script.onload = () => {
                    this.stripe = Stripe(this.config.stripePublicKey);
                    resolve();
                };
            });
        }
    }
    
    createDOMElements() {
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'payment-system';
        
        this.elements.container.innerHTML = `
            <div class="payment-header">
                <h2>Secure Payment</h2>
                <p>Complete your booking with confidence</p>
            </div>
            
            <div class="payment-methods">
                ${this.renderPaymentMethods()}
            </div>
            
            <form class="payment-form" id="payment-form">
                ${this.renderPaymentForm()}
                <div class="payment-summary">
                    ${this.renderOrderSummary()}
                </div>
                <button type="submit" class="pay-button" id="pay-button">
                    <span class="button-text">Pay Now</span>
                    <span class="button-loader" hidden>Processing...</span>
                </button>
            </form>
            
            <div class="security-info">
                <div class="ssl-badge">🔒 SSL Secured</div>
                <div class="payment-methods-badge">
                    ${this.config.supportedMethods.map(method => 
                        `<span class="method-icon">${this.getMethodIcon(method)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Insert into booking page
        const bookingSection = document.querySelector('#booking-section');
        if (bookingSection) {
            bookingSection.appendChild(this.elements.container);
        }
    }
    
    renderPaymentMethods() {
        const methods = [
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'mobile_money', name: 'Mobile Money', icon: '📱' },
            { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
        ];
        
        return `
            <div class="method-selector">
                <h3>Payment Method</h3>
                <div class="methods-grid">
                    ${methods
                        .filter(method => this.config.supportedMethods.includes(method.id))
                        .map(method => `
                            <label class="method-option ${this.state.currentMethod === method.id ? 'active' : ''}">
                                <input type="radio" name="payment_method" value="${method.id}" 
                                       ${this.state.currentMethod === method.id ? 'checked' : ''}>
                                <span class="method-icon">${method.icon}</span>
                                <span class="method-name">${method.name}</span>
                            </label>
                        `).join('')}
                </div>
            </div>
        `;
    }
    
    renderPaymentForm() {
        return `
            <div class="form-section">
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer_name">Full Name</label>
                        <input type="text" id="customer_name" name="customer_name" required>
                        <span class="error-message" data-field="customer_name"></span>
                    </div>
                    <div class="form-group">
                        <label for="customer_email">Email Address</label>
                        <input type="email" id="customer_email" name="customer_email" required>
                        <span class="error-message" data-field="customer_email"></span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer_phone">Phone Number</label>
                        <input type="tel" id="customer_phone" name="customer_phone" required>
                        <span class="error-message" data-field="customer_phone"></span>
                    </div>
                    <div class="form-group">
                        <label for="billing_address">Billing Address</label>
                        <input type="text" id="billing_address" name="billing_address" required>
                        <span class="error-message" data-field="billing_address"></span>
                    </div>
                </div>
                
                ${this.renderCardFields()}
                ${this.renderMobileMoneyFields()}
                ${this.renderBankTransferFields()}
            </div>
        `;
    }
    
    renderCardFields() {
        return `
            <div class="payment-fields card-fields" data-method="card">
                <div class="form-group">
                    <label for="card_number">Card Number</label>
                    <div class="card-input-wrapper">
                        <input type="text" id="card_number" name="card_number" 
                               placeholder="1234 5678 9012 3456" maxlength="19">
                        <div class="card-brand-indicator"></div>
                    </div>
                    <span class="error-message" data-field="card_number"></span>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="expiry_date">Expiry Date</label>
                        <input type="text" id="expiry_date" name="expiry_date" 
                               placeholder="MM/YY" maxlength="5">
                        <span class="error-message" data-field="expiry_date"></span>
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" name="cvv" 
                               placeholder="123" maxlength="4">
                        <span class="error-message" data-field="cvv"></span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMobileMoneyFields() {
        return `
            <div class="payment-fields mobile-money-fields" data-method="mobile_money">
                <div class="form-group">
                    <label for="mobile_network">Network Provider</label>
                    <select id="mobile_network" name="mobile_network">
                        <option value="">Select Network</option>
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodaphone">Vodafone Cash</option>
                        <option value="airtel">AirtelTigo Money</option>
                    </select>
                    <span class="error-message" data-field="mobile_network"></span>
                </div>
                
                <div class="form-group">
                    <label for="mobile_number">Mobile Number</label>
                    <input type="tel" id="mobile_number" name="mobile_number" 
                           placeholder="024 XXX XXXX">
                    <span class="error-message" data-field="mobile_number"></span>
                </div>
            </div>
        `;
    }
    
    renderBankTransferFields() {
        return `
            <div class="payment-fields bank-transfer-fields" data-method="bank_transfer">
                <div class="form-group">
                    <label for="bank_name">Bank Name</label>
                    <select id="bank_name" name="bank_name">
                        <option value="">Select Bank</option>
                        <option value="ecobank">Ecobank</option>
                        <option value="gtbank">GT Bank</option>
                        <option value="access">Access Bank</option>
                        <option value="stanbic">Stanbic Bank</option>
                        <option value="uba">United Bank for Africa</option>
                    </select>
                    <span class="error-message" data-field="bank_name"></span>
                </div>
                
                <div class="form-group">
                    <label for="account_number">Account Number</label>
                    <input type="text" id="account_number" name="account_number">
                    <span class="error-message" data-field="account_number"></span>
                </div>
            </div>
        `;
    }
    
    renderOrderSummary() {
        // This would typically come from booking data
        const bookingData = this.getBookingData();
        
        return `
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-item">
                    <span>${bookingData.itemName || 'Luxury Room'}</span>
                    <span>${this.config.currency} ${bookingData.price || '400.00'}</span>
                </div>
                <div class="summary-item">
                    <span>Duration</span>
                    <span>${bookingData.duration || '1 night'}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-total">
                    <strong>Total Amount</strong>
                    <strong>${this.config.currency} ${bookingData.total || '400.00'}</strong>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Payment method selection
        this.elements.container.querySelectorAll('input[name="payment_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchPaymentMethod(e.target.value);
            });
        });
        
        // Form submission
        const form = this.elements.container.querySelector('#payment-form');
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.setupFieldValidation();
        
        // Card formatting
        this.setupCardFormatting();
    }
    
    switchPaymentMethod(method) {
        this.state.currentMethod = method;
        
        // Hide all payment fields
        this.elements.container.querySelectorAll('.payment-fields').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show selected method fields
        const selectedFields = this.elements.container.querySelector(`[data-method="${method}"]`);
        if (selectedFields) {
            selectedFields.style.display = 'block';
        }
        
        // Update active state
        this.elements.container.querySelectorAll('.method-option').forEach(option => {
            option.classList.remove('active');
        });
        this.elements.container.querySelector(`input[value="${method}"]`).closest('.method-option').classList.add('active');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.state.isProcessing) return;
        
        const isValid = await this.validateForm();
        if (!isValid) {
            this.showErrors();
            return;
        }
        
        this.startProcessing();
        
        try {
            const paymentResult = await this.processPayment();
            this.handlePaymentSuccess(paymentResult);
        } catch (error) {
            this.handlePaymentError(error);
        } finally {
            this.stopProcessing();
        }
    }
    
    async processPayment() {
        const formData = new FormData(this.elements.container.querySelector('#payment-form'));
        const paymentData = Object.fromEntries(formData.entries());
        
        // Process based on payment method
        switch (this.state.currentMethod) {
            case 'card':
                return await this.processCardPayment(paymentData);
            case 'mobile_money':
                return await this.processMobileMoneyPayment(paymentData);
            case 'bank_transfer':
                return await this.processBankTransferPayment(paymentData);
            default:
                throw new Error('Unsupported payment method');
        }
    }
    
    async processCardPayment(data) {
        if (this.stripe) {
            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: this.getOrderAmount(), currency: this.config.currency })
            });
            
            const { clientSecret } = await response.json();
            
            // Confirm card payment
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.elements.container.querySelector('#card_number'),
                    billing_details: {
                        name: data.customer_name,
                        email: data.customer_email,
                        phone: data.customer_phone,
                        address: { line1: data.billing_address }
                    }
                }
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.paymentIntent;
        } else {
            // Fallback to server-side processing
            const response = await fetch('/api/process-card-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        }
    }
    
    async processMobileMoneyPayment(data) {
        const response = await fetch('/api/process-mobile-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    }
    
    async processBankTransferPayment(data) {
        const response = await fetch('/api/process-bank-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    }
    
    setupValidation() {
        this.validators = {
            customer_name: (value) => value.length >= 2 ? null : 'Please enter your full name',
            customer_email: (value) => /\S+@\S+\.\S+/.test(value) ? null : 'Please enter a valid email',
            customer_phone: (value) => /^[\d\s\-\+\(\)]{10,}$/.test(value) ? null : 'Please enter a valid phone number',
            card_number: (value) => this.validateCardNumber(value),
            expiry_date: (value) => this.validateExpiryDate(value),
            cvv: (value) => value.length >= 3 ? null : 'Invalid CVV',
            mobile_number: (value) => /^[\d\s]{10,}$/.test(value) ? null : 'Please enter a valid mobile number',
            account_number: (value) => /^\d{10,15}$/.test(value) ? null : 'Please enter a valid account number'
        };
    }
    
    async validateForm() {
        this.state.errors = {};
        const formData = new FormData(this.elements.container.querySelector('#payment-form'));
        
        for (const [field, validator] of Object.entries(this.validators)) {
            if (validator && formData.has(field)) {
                const error = validator(formData.get(field));
                if (error) {
                    this.state.errors[field] = error;
                }
            }
        }
        
        return Object.keys(this.state.errors).length === 0;
    }
    
    showErrors() {
        // Clear previous errors
        this.elements.container.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.closest('.form-group').classList.remove('has-error');
        });
        
        // Show current errors
        Object.entries(this.state.errors).forEach(([field, message]) => {
            const errorElement = this.elements.container.querySelector(`[data-field="${field}"]`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.closest('.form-group').classList.add('has-error');
            }
        });
    }
    
    startProcessing() {
        this.state.isProcessing = true;
        const button = this.elements.container.querySelector('#pay-button');
        button.disabled = true;
        button.classList.add('processing');
        button.querySelector('.button-text').hidden = true;
        button.querySelector('.button-loader').hidden = false;
    }
    
    stopProcessing() {
        this.state.isProcessing = false;
        const button = this.elements.container.querySelector('#pay-button');
        button.disabled = false;
        button.classList.remove('processing');
        button.querySelector('.button-text').hidden = false;
        button.querySelector('.button-loader').hidden = true;
    }
    
    handlePaymentSuccess(result) {
        // Show success message
        this.showNotification('Payment successful!', 'success');
        
        // Generate receipt
        this.generateReceipt(result);
        
        // Redirect or show confirmation
        setTimeout(() => {
            window.location.href = `/confirmation.html?payment_id=${result.id}`;
        }, 2000);
    }
    
    handlePaymentError(error) {
        this.showNotification(error.message || 'Payment failed. Please try again.', 'error');
        console.error('Payment error:', error);
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `payment-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ${type === 'success' ? 'background: #4CAF50;' : 'background: #f44336;'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    generateReceipt(paymentData) {
        // Generate and store receipt data
        const receiptData = {
            id: paymentData.id,
            date: new Date().toISOString(),
            amount: paymentData.amount,
            method: this.state.currentMethod,
            customer: this.state.formData.customer_name,
            items: this.getOrderItems()
        };
        
        localStorage.setItem(`receipt_${paymentData.id}`, JSON.stringify(receiptData));
        
        // Trigger receipt download
        this.downloadReceipt(receiptData);
    }
    
    downloadReceipt(data) {
        const receiptContent = `
            HALLULIES HOTEL & RESTAURANT/BAR
            Receipt #${data.id}
            Date: ${new Date(data.date).toLocaleDateString()}
            
            Customer: ${data.customer}
            Payment Method: ${data.method}
            
            Items:
            ${data.items.map(item => `${item.name}: ${this.config.currency} ${item.price}`).join('\n')}
            
            Total: ${this.config.currency} ${data.amount}
            
            Thank you for choosing Hallulies!
        `;
        
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${data.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Utility methods
    getMethodIcon(method) {
        const icons = {
            card: '💳',
            mobile_money: '📱',
            bank_transfer: '🏦'
        };
        return icons[method] || '💰';
    }
    
    getOrderAmount() {
        const bookingData = this.getBookingData();
        return bookingData.total || 400;
    }
    
    getOrderItems() {
        return [{ name: 'Luxury Room', price: '400.00' }];
    }
    
    getBookingData() {
        // This would typically come from the booking form or session
        return {
            itemName: 'Luxury Room',
            price: '400.00',
            duration: '1 night',
            total: '400.00'
        };
    }
    
    validateCardNumber(number) {
        // Remove spaces and validate Luhn algorithm
        const cleanNumber = number.replace(/\s/g, '');
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
            return 'Invalid card number';
        }
        
        // Luhn algorithm check
        let sum = 0;
        let isEven = false;
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i]);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0 ? null : 'Invalid card number';
    }
    
    validateExpiryDate(date) {
        const [month, year] = date.split('/').map(n => parseInt(n));
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        if (!month || !year || month < 1 || month > 12) {
            return 'Invalid expiry date';
        }
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return 'Card has expired';
        }
        
        return null;
    }
}

// Initialize payment system
document.addEventListener('DOMContentLoaded', () => {
    new PaymentSystem({
        stripePublicKey: 'pk_test_your_stripe_key_here',
        currency: 'GHS',
        supportedMethods: ['card', 'mobile_money', 'bank_transfer']
    });
});