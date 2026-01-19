// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});

// Set minimum check-in date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    if (checkinInput) {
        checkinInput.setAttribute('min', today);
    }
});

// Set minimum check-out date based on check-in date
document.addEventListener('DOMContentLoaded', function() {
    const checkinInput = document.getElementById('checkin');
    if (checkinInput) {
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const minCheckout = new Date(checkinDate);
            minCheckout.setDate(minCheckout.getDate() + 1);
            const minCheckoutStr = minCheckout.toISOString().split('T')[0];
            const checkoutInput = document.getElementById('checkout');
            if (checkoutInput) {
                checkoutInput.setAttribute('min', minCheckoutStr);
            }
        });
    }
});

// Handle room booking buttons
// Note: Room booking buttons now link directly to booking.html

// Scroll to top functionality
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    // Check if the button exists
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });

        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Gallery modal functionality
function initGalleryModals() {
    // Create image modal
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';
    const imageModalContent = document.createElement('div');
    imageModalContent.className = 'image-modal-content';
    const imageModalImg = document.createElement('img');
    const closeImageModalBtn = document.createElement('button');
    closeImageModalBtn.className = 'close-modal-btn';
    closeImageModalBtn.innerHTML = '&times;';
    
    imageModalContent.appendChild(imageModalImg);
    imageModalContent.appendChild(closeImageModalBtn);
    imageModal.appendChild(imageModalContent);
    document.body.appendChild(imageModal);
    
    // Handle expand button clicks for images
    const expandButtons = document.querySelectorAll('.gallery-item .expand-btn');
    expandButtons.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const imgSrc = this.closest('.gallery-item').querySelector('img').src;
            imageModalImg.src = imgSrc;
            imageModal.classList.add('active');
        });
    });
    
    // Handle double-click on images to expand them
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('dblclick', function(e) {
            // Prevent double-click from triggering if it's on the expand button itself
            if (e.target.classList.contains('expand-btn')) return;
            
            const imgSrc = this.querySelector('img').src;
            imageModalImg.src = imgSrc;
            imageModal.classList.add('active');
        });
    });
    
    // Close image modal
    closeImageModalBtn.addEventListener('click', function() {
        imageModal.classList.remove('active');
    });
    
    // Close modals when clicking outside
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
        }
    });
    
    // Add keyboard support (ESC key to close modal)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            imageModal.classList.remove('active');
        }
    });
}
// Initialize gallery modals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        initGalleryModals();
    }
});

// Testimonial marquee functionality
function initTestimonialMarquee() {
    const marqueeContainer = document.querySelector('.testimonial-marquee');
    if (!marqueeContainer) return;
    
    // Add event listeners to pause/resume animation on hover/click
    marqueeContainer.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
    });
    
    marqueeContainer.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
    });
    
    marqueeContainer.addEventListener('touchstart', function() {
        this.style.animationPlayState = 'paused';
    });
    
    marqueeContainer.addEventListener('touchend', function() {
        // Resume after a short delay to allow user to read
        setTimeout(() => {
            this.style.animationPlayState = 'running';
        }, 3000);
    });
}

// Initialize testimonial marquee
document.addEventListener('DOMContentLoaded', function() {
    initTestimonialMarquee();
    
    // Initialize testimonial form only if it exists
    const testimonialForm = document.getElementById('testimonial-form');
    if (testimonialForm) {
        initTestimonialForm();
    }
    
    // Initialize restaurant menu functionality
    initRestaurantMenu();
    
    // Initialize payment functionality if on booking page
    if (window.location.pathname.includes('booking.html')) {
        initPaymentSystem();
    }
});

// Payment System Functionality
function initPaymentSystem() {
    // Payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment_method"]');
    const mobileMoneySection = document.getElementById('mobile-money-section');
    const creditCardSection = document.getElementById('credit-card-section');
    const bankTransferSection = document.getElementById('bank-transfer-section');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Hide all payment sections
            mobileMoneySection.style.display = 'none';
            creditCardSection.style.display = 'none';
            bankTransferSection.style.display = 'none';
            
            // Show selected payment section
            if (this.value === 'mobile_money') {
                mobileMoneySection.style.display = 'block';
            } else if (this.value === 'credit_card') {
                creditCardSection.style.display = 'block';
            } else if (this.value === 'bank_transfer') {
                bankTransferSection.style.display = 'block';
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue.substring(0, 19);
        });
    }
    
    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value.substring(0, 5);
        });
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
    
    // Mobile number validation
    const mobileNumberInput = document.getElementById('mobile-number');
    if (mobileNumberInput) {
        mobileNumberInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
        });
    }
    
    // Booking form submission with payment processing
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = document.getElementById('submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;
            
            // Process payment based on selected method
            const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
            
            setTimeout(() => {
                // Simulate payment processing
                processPayment(selectedPaymentMethod)
                    .then(result => {
                        if (result.success) {
                            // Submit booking with payment info
                            submitBookingWithPayment(result);
                        } else {
                            showBookingFeedback(result.message, 'error');
                            resetSubmitButton();
                        }
                    })
                    .catch(error => {
                        console.error('Payment error:', error);
                        showBookingFeedback('Payment processing failed. Please try again.', 'error');
                        resetSubmitButton();
                    });
            }, 2000); // Simulate processing delay
        });
    }
}

// Process payment based on selected method
function processPayment(paymentMethod) {
    return new Promise((resolve, reject) => {
        try {
            if (paymentMethod === 'pay_later') {
                // Pay later option - no payment processing needed
                resolve({ success: true, method: 'pay_later', transactionId: null });
            } else if (paymentMethod === 'mobile_money') {
                // Validate mobile money details
                const mobileNumber = document.getElementById('mobile-number').value;
                const mobileNetwork = document.getElementById('mobile-network').value;
                
                if (!mobileNumber || !mobileNetwork) {
                    throw new Error('Please enter mobile number and select network');
                }
                
                if (mobileNumber.length !== 10) {
                    throw new Error('Mobile number must be 10 digits');
                }
                
                // Simulate mobile money payment
                setTimeout(() => {
                    resolve({
                        success: true,
                        method: 'mobile_money',
                        transactionId: 'MM' + Date.now(),
                        reference: mobileNumber
                    });
                }, 1000);
            } else if (paymentMethod === 'credit_card') {
                // Validate credit card details
                const cardNumber = document.getElementById('card-number').value;
                const cardHolder = document.getElementById('card-holder').value;
                const expiryDate = document.getElementById('expiry-date').value;
                const cvv = document.getElementById('cvv').value;
                
                if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
                    throw new Error('Please fill in all card details');
                }
                
                if (cardNumber.replace(/\s/g, '').length !== 16) {
                    throw new Error('Card number must be 16 digits');
                }
                
                if (cvv.length < 3) {
                    throw new Error('CVV must be 3 digits');
                }
                
                // Simulate credit card payment
                setTimeout(() => {
                    resolve({
                        success: true,
                        method: 'credit_card',
                        transactionId: 'CC' + Date.now(),
                        lastFour: cardNumber.slice(-4)
                    });
                }, 1500);
            } else if (paymentMethod === 'bank_transfer') {
                // Bank transfer - just confirm details
                resolve({
                    success: true,
                    method: 'bank_transfer',
                    transactionId: 'BT' + Date.now(),
                    instructions: 'Please transfer the amount to the provided bank details.'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Submit booking with payment information
function submitBookingWithPayment(paymentResult) {
    const formData = new FormData(document.getElementById('booking-form'));
    
    // Add payment information to form data
    formData.append('payment_method', paymentResult.method);
    if (paymentResult.transactionId) {
        formData.append('transaction_id', paymentResult.transactionId);
    }
    
    // Prepare booking data
    const bookingData = {
        guest_name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        checkin_date: document.getElementById('checkin').value,
        checkout_date: document.getElementById('checkout').value,
        room_type: document.getElementById('room-type').value,
        adults: document.getElementById('adults').value,
        children: document.getElementById('children').value,
        special_requests: document.getElementById('special-requests').value,
        payment_method: paymentResult.method,
        total_amount: 0 // This would be calculated based on room type and duration
    };
    
    // Send booking request to API
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.booking_id) {
            console.log('SUCCESS!', data);
            showBookingFeedback('Booking confirmed successfully! We have sent a confirmation to your email.', 'success');
            
            // Show payment confirmation based on method
            if (paymentResult.method === 'mobile_money') {
                showBookingFeedback(`Mobile Money payment successful! Transaction ID: ${paymentResult.transactionId}`, 'info');
            } else if (paymentResult.method === 'credit_card') {
                showBookingFeedback(`Credit card payment successful! Last 4 digits: ${paymentResult.lastFour}`, 'info');
            } else if (paymentResult.method === 'bank_transfer') {
                showBookingFeedback(`Bank transfer instructions sent to your email. Please complete the transfer within 24 hours.`, 'info');
            }
            
            // Reset form
            document.getElementById('booking-form').reset();
            
            // Reset payment sections
            document.getElementById('mobile-money-section').style.display = 'none';
            document.getElementById('credit-card-section').style.display = 'none';
            document.getElementById('bank-transfer-section').style.display = 'none';
            
            // Select default payment method
            document.getElementById('pay-later').checked = true;
            
            resetSubmitButton();
        } else {
            throw new Error(data.error || 'Booking failed');
        }
    })
    .catch(error => {
        console.log('FAILED...', error);
        showBookingFeedback('Booking failed. Please try again.', 'error');
        resetSubmitButton();
    });
}

// Show booking feedback
function showBookingFeedback(message, type) {
    const feedbackElement = document.getElementById('booking-feedback');
    feedbackElement.textContent = message;
    feedbackElement.className = `form-feedback ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            feedbackElement.textContent = '';
            feedbackElement.className = 'form-feedback';
        }, 5000);
    }
}

// Reset submit button to default state
function resetSubmitButton() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
}

// Testimonial form functionality
function initTestimonialForm() {
    const form = document.getElementById('testimonial-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('testimonial-name').value;
        const location = document.getElementById('testimonial-location').value;
        const rating = document.getElementById('testimonial-rating').value;
        const comment = document.getElementById('testimonial-comment').value;
        
        // Validate form
        if (!name || !rating || !comment) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Create loading spinner
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Send testimonial via EmailJS
        const templateParams = {
            from_name: name,
            location: location,
            rating: rating,
            comment: comment,
            message: `New Testimonial Received:

Name: ${name}
Location: ${location}
Rating: ${rating} stars
Comment: ${comment}`
        };
        
        emailjs.send('service_duhsvl9', 'template_testimonial', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Show success message
            alert('Thank you for sharing your experience! Your testimonial has been received.');
            
            // Reset form
            form.reset();
        }, function(error) {
            console.log('FAILED...', error);
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Show error message
            alert('There was an error sending your testimonial. Please try again or contact us directly. Error: ' + error.text);
        });
    });
}

// Restaurant Menu Functionality
function initRestaurantMenu() {
    // Check if we're on the restaurant page
    if (!window.location.pathname.includes('restaurant.html')) {
        return;
    }
    
    // Menu filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            menuItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else {
                    const tags = item.getAttribute('data-tags') || '';
                    item.style.display = tags.includes(filterValue) ? 'block' : 'none';
                }
            });
        });
    });
    
    // Menu search functionality
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            menuItems.forEach(item => {
                const title = item.querySelector('h4').textContent.toLowerCase();
                const description = item.querySelector('.item-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const orderSidebar = document.getElementById('order-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    let orderItems = [];
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuItemCard = this.closest('.menu-item-card');
            const itemName = menuItemCard.querySelector('h4').textContent;
            const itemPriceElement = menuItemCard.querySelector('.discount-price') || menuItemCard.querySelector('.price');
            const itemPrice = parseFloat(itemPriceElement.textContent.replace(/[₵$]/g, ''));
            
            // Add to order items array
            const existingItem = orderItems.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                orderItems.push({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }
            
            // Update UI
            updateOrderSummary();
            showOrderNotification(itemName);
            
            // Show sidebar
            orderSidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    });
    
    // Close sidebar functionality
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            orderSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            orderSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('qty-btn')) {
            const qtyControl = e.target.closest('.quantity-control');
            const qtyValue = qtyControl.querySelector('.qty-value');
            let currentQty = parseInt(qtyValue.textContent);
            
            if (e.target.classList.contains('plus')) {
                currentQty++;
            } else if (e.target.classList.contains('minus') && currentQty > 1) {
                currentQty--;
            }
            
            qtyValue.textContent = currentQty;
        }
    });
    
    // Checkout button
    const checkoutButton = document.querySelector('.btn-checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (orderItems.length > 0) {
                alert('Proceeding to checkout with:\n\n' + 
                      orderItems.map(item => `- ${item.name} x${item.quantity}`).join('\n') + 
                      '\n\nTotal: ₵' + calculateTotal());
            }
        });
    }
    
    // Helper functions
    function updateOrderSummary() {
        const orderItemsContainer = document.getElementById('order-items');
        const orderSummary = document.querySelector('.order-summary');
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (orderItems.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="empty-order">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your order is empty</p>
                    <small>Add items from the menu to get started</small>
                </div>
            `;
            orderSummary.style.display = 'none';
            return;
        }
        
        // Display order items
        orderItemsContainer.innerHTML = orderItems.map(item => `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₵${item.price.toFixed(2)} each</p>
                </div>
                <div class="item-quantity">
                    <span>x${item.quantity}</span>
                </div>
                <div class="item-total">
                    <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
        
        // Update totals
        const subtotal = calculateSubtotal();
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        subtotalElement.textContent = `₵${subtotal.toFixed(2)}`;
        taxElement.textContent = `₵${tax.toFixed(2)}`;
        totalElement.textContent = `₵${total.toFixed(2)}`;
        
        orderSummary.style.display = 'block';
    }
    
    function calculateSubtotal() {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    function calculateTotal() {
        const subtotal = calculateSubtotal();
        return (subtotal * 1.1).toFixed(2); // Including 10% tax
    }
    
    function showOrderNotification(itemName) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'order-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Added ${itemName} to your order!</span>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500'
        });
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Daily specials countdown timer
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        let timeLeft = 2 * 60 * 60 + 45 * 60 + 30; // 2 hours, 45 minutes, 30 seconds
        
        const timerInterval = setInterval(() => {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                countdownElement.textContent = 'Offer Expired';
            }
        }, 1000);
    }
}

// Form submission with enhanced validation
function handleFormSubmit(formId, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Check if event listener is already attached
    if (form.dataset.listenerAttached) {
        console.log(`Event listener already attached to ${formId}`);
        return;
    }
    
    form.dataset.listenerAttached = 'true';
    console.log(`Attaching event listener to ${formId}`);

    form.addEventListener('submit', function(e) {
        console.log(`Form ${formId} submission intercepted`);
        e.preventDefault();
        
        // For contact form, do client-side validation first
        if (formId === 'contact-form') {
            console.log('Performing client-side validation for contact form');
            // More robust field value extraction
            const nameField = form.querySelector('#contact-name');
            const emailField = form.querySelector('#contact-email');
            const subjectField = form.querySelector('#subject');
            const messageField = form.querySelector('#contact-message');
            
            // Check if fields exist
            if (!nameField || !emailField || !subjectField || !messageField) {
                alert('Form fields not found. Please refresh the page and try again.');
                return;
            }
            
            // Extract values with extra safety
            const name = nameField.value ? nameField.value.toString().trim() : '';
            const email = emailField.value ? emailField.value.toString().trim() : '';
            const subject = subjectField.value ? subjectField.value.toString().trim() : '';
            const message = messageField.value ? messageField.value.toString().trim() : '';
            
            console.log('Field values extracted:', { name, email, subject, message });
            
            let missingFields = [];
            
            if (!name || name.length === 0) missingFields.push('Name');
            if (!email || email.length === 0) missingFields.push('Email');
            if (!subject || subject.length === 0) missingFields.push('Subject');
            if (!message || message.length === 0) missingFields.push('Message');
            
            if (missingFields.length > 0) {
                console.log('Validation failed: Missing fields:', missingFields);
                alert('Please fill in the following required fields: ' + missingFields.join(', '));
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Validate message length
            if (message.length < 10) {
                alert('Message must be at least 10 characters long.');
                return;
            }
            
            if (message.length > 1000) {
                alert('Message must be less than 1000 characters.');
                return;
            }
        }
        
        // For booking form, do enhanced client-side validation
        if (formId === 'booking-form') {
            console.log('Performing enhanced client-side validation for booking form');
            
            // Get all form fields
            const nameField = form.querySelector('#name');
            const emailField = form.querySelector('#email');
            const phoneField = form.querySelector('#phone');
            const checkinField = form.querySelector('#checkin');
            const checkoutField = form.querySelector('#checkout');
            const adultsField = form.querySelector('#adults');
            const roomTypeField = form.querySelector('#room-type');
            
            // Check if fields exist
            if (!nameField || !emailField || !phoneField || !checkinField || !checkoutField || !adultsField || !roomTypeField) {
                alert('Booking form fields not found. Please refresh the page and try again.');
                return;
            }
            
            // Extract values
            const name = nameField.value ? nameField.value.toString().trim() : '';
            const email = emailField.value ? emailField.value.toString().trim() : '';
            const phone = phoneField.value ? phoneField.value.toString().trim() : '';
            const checkin = checkinField.value ? checkinField.value.toString().trim() : '';
            const checkout = checkoutField.value ? checkoutField.value.toString().trim() : '';
            const adults = adultsField.value ? adultsField.value.toString().trim() : '';
            const roomType = roomTypeField.value ? roomTypeField.value.toString().trim() : '';
            
            console.log('Booking field values extracted:', { name, email, phone, checkin, checkout, adults, roomType });
            
            // Show feedback container
            const feedbackContainer = document.getElementById('booking-form-feedback');
            
            // Check for missing required fields
            let missingFields = [];
            
            if (!name || name.length === 0) missingFields.push('Full Name');
            if (!email || email.length === 0) missingFields.push('Email');
            if (!phone || phone.length === 0) missingFields.push('Phone Number');
            if (!checkin || checkin.length === 0) missingFields.push('Check-in Date');
            if (!checkout || checkout.length === 0) missingFields.push('Check-out Date');
            if (!adults || adults.length === 0) missingFields.push('Number of Adults');
            if (!roomType || roomType.length === 0) missingFields.push('Room Type');
            
            if (missingFields.length > 0) {
                console.log('Validation failed: Missing fields:', missingFields);
                const errorMsg = 'Please fill in the following required fields: ' + missingFields.join(', ');
                
                // Show error in feedback container
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                const errorMsg = 'Please enter a valid email address.';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
                    // Validate Ghana phone number format (+233 or 0 followed by 9 digits)
            const phoneRegex = /^(?:\+233|0)(?:20|50|24|54|27|57|26|56|23|28|55|59)\d{7}$/;
            if (!phoneRegex.test(phone)) {
                const errorMsg = 'Please enter a valid Ghana phone number (e.g., +23324XXXXXXX or 024XXXXXXX).';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            // Validate dates
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (checkinDate < today) {
                const errorMsg = 'Check-in date cannot be in the past.';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            if (checkoutDate <= checkinDate) {
                const errorMsg = 'Check-out date must be after check-in date.';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            // Validate adults (must be between 1 and 10)
            const adultsNum = parseInt(adults);
            if (isNaN(adultsNum) || adultsNum < 1 || adultsNum > 10) {
                const errorMsg = 'Number of adults must be between 1 and 10.';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            // Validate room type
            const validRoomTypes = ['luxury', 'standard', 'family', 'event-hall'];
            if (!validRoomTypes.includes(roomType)) {
                const errorMsg = 'Please select a valid room type.';
                
                if (feedbackContainer) {
                    feedbackContainer.textContent = errorMsg;
                    feedbackContainer.className = 'form-feedback error';
                    feedbackContainer.style.display = 'block';
                    
                    // Scroll to feedback
                    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    alert(errorMsg);
                }
                
                return;
            }
            
            // Show loading feedback
            if (feedbackContainer) {
                feedbackContainer.textContent = 'Processing your booking request...';
                feedbackContainer.className = 'form-feedback loading';
                feedbackContainer.style.display = 'block';
                
                // Scroll to feedback
                feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Payment method handling
        if (formId === 'booking-form') {
            // Handle payment method selection
            const paymentMethods = form.querySelectorAll('input[name="payment_method"]');
            const mobileMoneySection = document.getElementById('mobile-money-section');
            const creditCardSection = document.getElementById('credit-card-section');
            const bankTransferSection = document.getElementById('bank-transfer-section');
            
            paymentMethods.forEach(method => {
                method.addEventListener('change', function() {
                    // Hide all payment sections
                    mobileMoneySection.style.display = 'none';
                    creditCardSection.style.display = 'none';
                    bankTransferSection.style.display = 'none';
                    
                    // Show selected payment section
                    if (this.value === 'mobile_money') {
                        mobileMoneySection.style.display = 'block';
                    } else if (this.value === 'credit_card') {
                        creditCardSection.style.display = 'block';
                    } else if (this.value === 'bank_transfer') {
                        bankTransferSection.style.display = 'block';
                    }
                });
            });
            
            // Calculate booking summary
            const checkinField = form.querySelector('#checkin');
            const checkoutField = form.querySelector('#checkout');
            const roomTypeField = form.querySelector('#room-type');
            
            // Update summary when relevant fields change
            [checkinField, checkoutField, roomTypeField].forEach(field => {
                if (field) {
                    field.addEventListener('change', updateBookingSummary);
                }
            });
            
            function updateBookingSummary() {
                const checkin = checkinField ? new Date(checkinField.value) : null;
                const checkout = checkoutField ? new Date(checkoutField.value) : null;
                const roomType = roomTypeField ? roomTypeField.value : '';
                
                if (checkin && checkout && checkin < checkout) {
                    // Calculate nights
                    const timeDiff = checkout.getTime() - checkin.getTime();
                    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    // Calculate duration
                    const duration = `${checkin.toLocaleDateString()} - ${checkout.toLocaleDateString()}`;
                    
                    // Calculate total based on room type and nights
                    const roomPrices = {
                        'standard': 80,
                        'deluxe': 120,
                        'suite': 200,
                        'family': 150
                    };
                    
                    const pricePerNight = roomPrices[roomType] || 0;
                    const totalAmount = pricePerNight * nights;
                    
                    // Update summary display
                    document.getElementById('summary-room-type').textContent = roomType.charAt(0).toUpperCase() + roomType.slice(1);
                    document.getElementById('summary-duration').textContent = duration;
                    document.getElementById('summary-nights').textContent = nights;
                    document.getElementById('summary-total').textContent = `₵${totalAmount.toFixed(2)}`;
                }
            }
            
            // Card number formatting
            const cardNumberField = document.getElementById('card-number');
            if (cardNumberField) {
                cardNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 16) value = value.substring(0, 16);
                    
                    // Format as 4 groups of 4 digits
                    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
                    e.target.value = formattedValue;
                });
            }
            
            // Expiry date formatting
            const expiryField = document.getElementById('expiry-date');
            if (expiryField) {
                expiryField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 4) value = value.substring(0, 4);
                    
                    // Format as MM/YY
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2);
                    }
                    e.target.value = value;
                });
            }
            
            // CVV formatting
            const cvvField = document.getElementById('cvv');
            if (cvvField) {
                cvvField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 4) value = value.substring(0, 4);
                    e.target.value = value;
                });
            }
            
            // Mobile number formatting
            const mobileNumberField = document.getElementById('mobile-number');
            if (mobileNumberField) {
                mobileNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) value = value.substring(0, 10);
                    e.target.value = value;
                });
            }
        }

        console.log('Client-side validation passed');

        // Show loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner active';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);

        // Collect form data and convert to URLSearchParams for proper form encoding
        const formData = new FormData(form);
        const urlParams = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            urlParams.append(key, value);
        }
        
        console.log('URLSearchParams collected:');
        for (let [key, value] of urlParams.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Determine endpoint based on form
        // Use absolute URL to ensure it works correctly when hosted
        let baseUrl = window.location.origin;
        
        // Check if we're on GitHub Pages and use Render.com server instead
        if (window.location.hostname.includes('github.io')) {
            // Use your Render.com server URL for form submissions when hosted on GitHub Pages
            baseUrl = 'https://your-deployed-url.onrender.com';
        }
        
        const endpoint = formId === 'booking-form' ? `${baseUrl}/process-booking` : `${baseUrl}/process-contact`;

        // Send data to backend with proper content type and timeout
        console.log(`Sending data to ${endpoint}`);
        
        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // Increase to 30 seconds
        
        fetch(endpoint, {
            method: 'POST',
            body: urlParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            console.log(`Received response: ${response.status} ${response.statusText}`);
            // Check if response is ok before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Hide spinner
            spinner.remove();
            
            // Show success or error message
            if (data.status === 'success') {
                if (formId === 'booking-form') {
                    // Show success message
                    alert('Thank you for your booking request! We will contact you shortly to confirm your reservation.');
                    form.reset();
                } else {
                    alert(data.message);
                    form.reset();
                }
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            // Hide spinner
            spinner.remove();
            
            // Show more detailed error message
            console.error('Error:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                alert('Network error: Failed to connect to server. Please check your internet connection and try again.');
            } else if (error.name === 'AbortError') {
                alert('Request timeout: The server is taking too long to respond. Please try again later.');
            } else if (error.message.includes('HTTP error')) {
                alert('Server error: ' + error.message + '. Please try again later.');
            } else {
                alert('Network error: Failed to submit form. Please try again later.\n\nError details: ' + error.message);
            }
        });
    });
}

// Initialize EmailJS
(function() {
    emailjs.init("noCmCNlH4QxK8H9dN"); // Replace with your actual EmailJS public key
})();

// Enhanced form submission with EmailJS
function handleFormSubmitWithEmailJS(formId, templateId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            if (formId === 'booking-form') {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText && btnLoading) {
                    btnText.style.display = 'none';
                    btnLoading.style.display = 'inline';
                } else {
                    submitBtn.textContent = 'Sending...';
                }
            } else {
                submitBtn.textContent = 'Sending...';
            }
        }
        
        // Get form data
        const formData = new FormData(form);
        
        // Prepare template parameters based on form type
        let templateParams = {};
        
        if (formId === 'booking-form') {
            templateParams = {
                from_name: formData.get('full-name') || formData.get('name'),
                from_email: formData.get('email'),
                phone: formData.get('phone'),
                checkin_date: document.getElementById('checkin') ? document.getElementById('checkin').value : '',
                checkout_date: document.getElementById('checkout') ? document.getElementById('checkout').value : '',
                adults: document.getElementById('adults') ? document.getElementById('adults').value : '',
                children: document.getElementById('children') ? document.getElementById('children').value : '',
                room_type: document.getElementById('room-type') ? document.getElementById('room-type').value : '',
                special_requests: document.getElementById('special-requests') ? document.getElementById('special-requests').value : 'None',
                message: `Booking Inquiry:
Guest Name: ${formData.get('full-name') || formData.get('name')}
Email: ${formData.get('email')}
Phone: ${formData.get('phone')}
Check-in: ${document.getElementById('checkin') ? document.getElementById('checkin').value : 'N/A'}
Check-out: ${document.getElementById('checkout') ? document.getElementById('checkout').value : 'N/A'}
Adults: ${document.getElementById('adults') ? document.getElementById('adults').value : 'N/A'}
Children: ${document.getElementById('children') ? document.getElementById('children').value : 'N/A'}
Room Type: ${document.getElementById('room-type') ? document.getElementById('room-type').value : 'N/A'}
Special Requests: ${document.getElementById('special-requests') ? document.getElementById('special-requests').value : 'None'}`
            };
        } else if (formId === 'contact-form') {
            templateParams = {
                from_name: formData.get('name') || formData.get('contact-name'),
                from_email: formData.get('email') || formData.get('contact-email'),
                subject: formData.get('subject'),
                message: formData.get('message') || formData.get('contact-message') || formData.get('comment'),
                phone: formData.get('phone')
            };
        }
        
        // Send email using EmailJS
        emailjs.send('service_duhsvl9', templateId, templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                // Reset button
                if (submitBtn) {
                    if (formId === 'booking-form') {
                        const btnText = submitBtn.querySelector('.btn-text');
                        const btnLoading = submitBtn.querySelector('.btn-loading');
                        if (btnText && btnLoading) {
                            btnText.style.display = 'inline';
                            btnLoading.style.display = 'none';
                        } else {
                            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                        }
                        submitBtn.disabled = false;
                    } else {
                        submitBtn.textContent = 'Send Message';
                        submitBtn.disabled = false;
                    }
                }
                
                // Show confirmation
                if (formId === 'booking-form') {
                    alert('Thank you for your booking inquiry! We will contact you shortly to confirm availability.');
                } else {
                    alert('Thank you for your message! We will get back to you soon.');
                }
                
                // Reset form
                form.reset();
                
                // Hide any feedback messages
                const feedback = document.getElementById('booking-form-feedback') || document.getElementById('contact-feedback');
                if (feedback) {
                    feedback.style.display = 'none';
                }
            }, function(error) {
                console.log('FAILED...', error);
                
                // Reset button
                if (submitBtn) {
                    if (formId === 'booking-form') {
                        const btnText = submitBtn.querySelector('.btn-text');
                        const btnLoading = submitBtn.querySelector('.btn-loading');
                        if (btnText && btnLoading) {
                            btnText.style.display = 'inline';
                            btnLoading.style.display = 'none';
                        } else {
                            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                        }
                        submitBtn.disabled = false;
                    } else {
                        submitBtn.textContent = 'Send Message';
                        submitBtn.disabled = false;
                    }
                }
                
                // Show error message
                alert('There was an error sending your ' + (formId === 'booking-form' ? 'booking inquiry' : 'message') + '. Please try again or contact us directly.');
            });
    });
}

// Apply EmailJS-enhanced form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking form if it exists
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        handleFormSubmitWithAPI('booking-form');
    }
    
    // Initialize contact form if it exists
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        handleFormSubmitWithAPI('contact-form');
    }
    
    // Initialize testimonial form if it exists
    const testimonialForm = document.getElementById('testimonial-form');
    if (testimonialForm) {
        initTestimonialForm();
    }
});

// Enhanced form submission with API
function handleFormSubmitWithAPI(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            if (formId === 'booking-form') {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText && btnLoading) {
                    btnText.style.display = 'none';
                    btnLoading.style.display = 'inline';
                } else {
                    submitBtn.textContent = 'Sending...';
                }
            } else {
                submitBtn.textContent = 'Sending...';
            }
        }
        
        // Get form data
        const formData = new FormData(form);
        
        if (formId === 'booking-form') {
            // Prepare booking data
            const bookingData = {
                guest_name: formData.get('full-name') || formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                checkin_date: document.getElementById('checkin') ? document.getElementById('checkin').value : '',
                checkout_date: document.getElementById('checkout') ? document.getElementById('checkout').value : '',
                room_type: document.getElementById('room-type') ? document.getElementById('room-type').value : '',
                adults: document.getElementById('adults') ? document.getElementById('adults').value : 1,
                children: document.getElementById('children') ? document.getElementById('children').value : 0,
                special_requests: document.getElementById('special-requests') ? document.getElementById('special-requests').value : '',
                payment_method: formData.get('payment_method') || 'pay_later'
            };
            
            // Send booking request to API
            fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.booking_id) {
                    console.log('SUCCESS!', data);
                    
                    // Reset button
                    if (submitBtn) {
                        const btnText = submitBtn.querySelector('.btn-text');
                        const btnLoading = submitBtn.querySelector('.btn-loading');
                        if (btnText && btnLoading) {
                            btnText.style.display = 'inline';
                            btnLoading.style.display = 'none';
                        } else {
                            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                        }
                        submitBtn.disabled = false;
                    }
                    
                    // Show confirmation
                    alert('Thank you for your booking! We have sent a confirmation to your email.');
                    
                    // Reset form
                    form.reset();
                    
                    // Hide any feedback messages
                    const feedback = document.getElementById('booking-form-feedback') || document.getElementById('contact-feedback');
                    if (feedback) {
                        feedback.style.display = 'none';
                    }
                    
                    // Hide payment sections
                    const mobileMoneySection = document.getElementById('mobile-money-section');
                    const creditCardSection = document.getElementById('credit-card-section');
                    const bankTransferSection = document.getElementById('bank-transfer-section');
                    
                    if (mobileMoneySection) mobileMoneySection.style.display = 'none';
                    if (creditCardSection) creditCardSection.style.display = 'none';
                    if (bankTransferSection) bankTransferSection.style.display = 'none';
                    
                    // Select default payment method
                    const payLaterRadio = document.getElementById('pay-later');
                    if (payLaterRadio) payLaterRadio.checked = true;
                } else {
                    throw new Error(data.error || 'Booking failed');
                }
            })
            .catch(error => {
                console.log('FAILED...', error);
                
                // Reset button
                if (submitBtn) {
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    if (btnText && btnLoading) {
                        btnText.style.display = 'inline';
                        btnLoading.style.display = 'none';
                    } else {
                        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                    }
                    submitBtn.disabled = false;
                }
                
                // Show error message
                alert('There was an error sending your booking inquiry. Please try again or contact us directly.');
            });
        } else if (formId === 'contact-form') {
            // Prepare contact data
            const contactData = {
                name: formData.get('name') || formData.get('contact-name'),
                email: formData.get('email') || formData.get('contact-email'),
                phone: formData.get('phone'),
                subject: formData.get('subject') || 'Contact Form Submission',
                message: formData.get('message') || formData.get('contact-message') || formData.get('comment')
            };
            
            // Send contact request to API
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log('SUCCESS!', data);
                    
                    // Reset button
                    if (submitBtn) {
                        submitBtn.textContent = 'Send Message';
                        submitBtn.disabled = false;
                    }
                    
                    // Show confirmation
                    alert('Thank you for your message! We will get back to you soon.');
                    
                    // Reset form
                    form.reset();
                    
                    // Hide any feedback messages
                    const feedback = document.getElementById('booking-form-feedback') || document.getElementById('contact-feedback');
                    if (feedback) {
                        feedback.style.display = 'none';
                    }
                    
                    if (data.warning) {
                        console.warn('Warning:', data.warning);
                    }
                } else {
                    throw new Error(data.error || 'Failed to send message');
                }
            })
            .catch(error => {
                console.log('FAILED...', error);
                
                // Reset button
                if (submitBtn) {
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;
                }
                
                // Show error message
                alert('There was an error sending your message. Please try again or contact us directly.');
            });
        }
    });
}

// PDF Preview functionality
function openPdfPreview(pdfUrl) {
    // Create or get existing PDF modal
    let pdfModal = document.getElementById('pdf-preview-modal');
    
    if (!pdfModal) {
        // Create modal container
        pdfModal = document.createElement('div');
        pdfModal.id = 'pdf-preview-modal';
        pdfModal.className = 'pdf-modal';
        
        pdfModal.innerHTML = `
            <div class="pdf-modal-content">
                <div class="pdf-modal-header">
                    <h3>Document Preview</h3>
                    <button class="close-pdf-modal">&times;</button>
                </div>
                <div class="pdf-modal-body">
                    <iframe id="pdf-frame" width="100%" height="600px" frameborder="0"></iframe>
                </div>
                <div class="pdf-modal-footer">
                    <button class="btn-primary" onclick="downloadPdf()">Download PDF</button>
                    <button class="btn-secondary close-pdf-modal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(pdfModal);
        
        // Add close functionality
        const closeButtons = pdfModal.querySelectorAll('.close-pdf-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                pdfModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside content
        pdfModal.addEventListener('click', function(e) {
            if (e.target === pdfModal) {
                pdfModal.style.display = 'none';
            }
        });
    }
    
    // Set the PDF source in the iframe
    const pdfFrame = document.getElementById('pdf-frame');
    if (pdfFrame) {
        pdfFrame.src = pdfUrl;
    }
    
    // Store current PDF URL for download function
    window.currentPdfUrl = pdfUrl;
    
    // Show the modal
    pdfModal.style.display = 'flex';
}

function downloadPdf() {
    if (window.currentPdfUrl) {
        const link = document.createElement('a');
        link.href = window.currentPdfUrl;
        link.download = 'hallulies-banner-annex.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}