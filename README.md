# Hallulies Lodge, Restaurant&Bar

Website and booking API for Hallulies Lodge, Restaurant&Bar in Asufufu-Sunyani, Ghana.

## Included

- Responsive public website for rooms, restaurant, facilities, gallery, testimonials, and contact
- SQLite-backed booking, menu, testimonial, and user APIs
- Admin-protected booking and management endpoints
- Email/password login, Google OAuth login, and password reset flow
- WhatsApp booking handoff to `+233 558 294 527`
- Facebook, Instagram, and TikTok profile links
- Banner PDF preview and download

## Requirements

- Python 3.10 or newer
- `pip`

## Local Setup

```powershell
git clone https://github.com/Konadu-Prince/Hallulies-Website.git
cd Hallulies-Website
python -m pip install -r requirements-api.txt
```

Copy `.env.example` to `.env` and set the values needed for your environment. The API can run with only `PORT` for local development, but production requires a stable `SECRET_KEY` and configured email/Google credentials.

Start the full-stack application:

```powershell
python api-server.py
```

Or use the project command:

```powershell
npm start
```

Open `http://localhost:8000`. The API documentation is available at `/api/docs`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; Render supplies this automatically |
| `SECRET_KEY` | Stable secret used to sign JWT sessions |
| `GOOGLE_CLIENT_ID` | Google Identity Services client ID |
| `EMAIL_HOST` | SMTP host, usually `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port, usually `587` |
| `EMAIL_USE_TLS` | Enable SMTP TLS |
| `EMAIL_HOST_USER` | SMTP sender account |
| `EMAIL_HOST_PASSWORD` | SMTP app password |
| `APP_BASE_URL` | Public base URL used in password-reset links |
| `STRIPE_SECRET_KEY` | Stripe server key when card payments are enabled |
| `STRIPE_PUBLISHABLE_KEY` | Stripe browser key when card payments are enabled |

Never commit `.env` or production credentials. `.env` is ignored by Git.

## Deployment on Render

The repository includes a Dockerfile and `render.yaml`. Deploy the `main` branch as a web service and ensure the service starts:

```text
python api-server.py
```

The Docker build installs `requirements-api.txt` before starting the server. Add the production environment variables in the Render dashboard, then use **Clear build cache & deploy** after runtime or dependency changes.

## Project Structure

```text
index.html                 Public homepage
booking.html               Booking form
restaurant.html            Restaurant menu
contact.html               Contact form
testimonial.html           Reviews
testimonial-form.html      Review submission
pdf-viewer.html            Resources and banner PDF viewer
login.html                 Login and password reset
admin.html                 Admin dashboard shell
api-server.py              Active Python API and static server
script.js                  Shared frontend behavior
styles.css                 Shared brand styling
components/                Search, payment, and document UI
images/                    Website assets
Dockerfile                 Production container
render.yaml                Render service definition
requirements-api.txt       API dependencies
```

## Support

Email: `hallulies6@gmail.com`
Phone: `+233558294527`
