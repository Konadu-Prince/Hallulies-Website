# Hallulies Hotel & Restaurant/Bar - Luxury Venue & Restaurant

Welcome to Hallulies Hotel & Restaurant/Bar, a luxury venue and restaurant located in Asufufu-Sunyani, Ghana. This website serves as the digital presence for our establishment, offering information about our accommodations, restaurant services, and booking capabilities.

## Features

- **Responsive Design**: Works seamlessly on all devices
- **Room Booking System**: Allows customers to book various room types
- **Restaurant Information**: Detailed information about our dining options
- **Gallery**: Visual showcase of our facilities
- **Testimonials**: Customer reviews and feedback
- **Contact Form**: Easy communication with our team

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python HTTP Server
- **Deployment**: Render.com
- **Email Service**: EmailJS

## Installation & Setup

### Prerequisites

- Python 3.x installed on your system
- An EmailJS account for form submissions

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Konadu-Prince/Hallulies-Website.git
```

2. Navigate to the project directory:
```bash
cd Hallulies-Website
```

3. Install dependencies (if any):
```bash
npm install
```

4. Configure EmailJS:
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Create a new service (e.g., Gmail)
   - Create two email templates:
     - `template_booking_inquiry` for booking requests
     - `template_contact_form` for contact messages
   - Update the EmailJS initialization in `script.js` with your public key

5. Run the server:
```bash
npm start
```
Or directly with Python:
```bash
python server.py
```

6. Visit `http://localhost:8000` in your browser

## Deployment

### Deploy to Render

1. Create a free account at [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Choose the branch to deploy (usually main or master)
5. Render will automatically detect the Python environment and use the `Dockerfile`
6. The site will be deployed at `https://your-service-name.onrender.com`

### Configuration Notes

- Update the EmailJS public key in `script.js`
- Replace placeholder URLs with your actual deployed URL
- Ensure all form endpoints are correctly configured

## File Structure

```
Hallulies-Website/
├── index.html          # Main landing page
├── booking.html        # Booking form page
├── restaurant.html     # Restaurant information page
├── contact.html        # Contact form page
├── styles.css          # Styling for all pages
├── script.js           # Client-side JavaScript functionality
├── server.py           # Python HTTP server
├── Dockerfile          # Containerization instructions
├── render.yaml         # Render deployment configuration
├── package.json        # Node.js package information
├── requirements.txt    # Python dependencies
├── images/             # Image assets
└── README.md           # This file
```

## Customization

### Branding
- Update the logo in the header
- Modify color schemes in `styles.css`
- Change images in the `images/` folder

### Content
- Edit text content in HTML files
- Update meta tags for SEO
- Modify testimonials in the JavaScript

### Functionality
- Adjust form validation as needed
- Modify booking process
- Update contact information

## Environment Variables

The application uses the following environment variables (set automatically by Render):

- `PORT`: Port number assigned by Render (defaults to 8000 if not set)

## Troubleshooting

### Forms Not Working
- Ensure EmailJS is properly configured
- Verify template IDs match those in your EmailJS dashboard
- Check browser console for JavaScript errors

### Images Not Loading
- Verify image paths in HTML files
- Confirm images exist in the `images/` directory

### Server Issues
- Check that `server.py` is properly configured
- Verify the `PORT` environment variable is being used

## Contributing

We welcome contributions to improve the Hallulies website. Feel free to fork the repository, make changes, and submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact us at:
- Email: hallulies6@gmail.com
- Phone: 0247533518

---

© 2025 Hallulies Hotel & Restaurant/Bar. All rights reserved.