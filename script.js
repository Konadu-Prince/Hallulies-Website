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
    document.querySelectorAll('.gallery-item .expand-btn').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const imgSrc = this.closest('.gallery-item').querySelector('img').src;
            imageModalImg.src = imgSrc;
            imageModal.style.display = 'flex';
        });
    });
    
    // Handle double-click on images to expand them
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('dblclick', function(e) {
            // Prevent double-click from triggering if it's on the expand button itself
            if (e.target.classList.contains('expand-btn')) return;
            
            const imgSrc = this.querySelector('img').src;
            imageModalImg.src = imgSrc;
            imageModal.style.display = 'flex';
        });
    });
    
    // Close image modal
    closeImageModalBtn.addEventListener('click', function() {
        imageModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
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
});

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
        
        // Submit testimonial
        // Determine the correct base URL (Render.com when on GitHub Pages)
        let baseUrl = window.location.origin;
        
        // Check if we're on GitHub Pages and use Render.com server instead
        if (window.location.hostname.includes('github.io')) {
            // Use your Render.com server URL for form submissions when hosted on GitHub Pages
            baseUrl = 'https://your-deployed-url.onrender.com'; // Replace with your actual Render.com URL
        }
        
        fetch(`${baseUrl}/add-testimonial`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                location: location,
                rating: rating,
                comment: comment
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                form.reset();
                
                // Refresh testimonials
                // Determine the correct base URL (Render.com when on GitHub Pages)
                let baseUrl = window.location.origin;
                
                // Check if we're on GitHub Pages and use Render.com server instead
                if (window.location.hostname.includes('github.io')) {
                    // Use your Render.com server URL for form submissions when hosted on GitHub Pages
                    baseUrl = 'https://your-deployed-url.onrender.com';
                }
                
                fetch(`${baseUrl}/testimonials.json`)
                    .then(response => response.json())
                    .then(testimonials => {
                        const marquee = document.querySelector('.testimonial-marquee');
                        if (marquee) {
                            // Reinitialize marquee with new testimonials
                            initTestimonialMarquee();
                        }
                    });

            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error submitting testimonial:', error);
            alert('Failed to submit testimonial. Please try again later.');
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });
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
        handleFormSubmitWithEmailJS('booking-form', 'template_booking_inquiry');
    }
    
    // Initialize contact form if it exists
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        handleFormSubmitWithEmailJS('contact-form', 'template_contact_form');
    }
});