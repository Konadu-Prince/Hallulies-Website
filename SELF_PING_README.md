# Hallulies Website - Self-Ping Configuration

This project includes a self-ping mechanism to keep the Render free tier server awake and prevent it from sleeping due to inactivity.

## Self-Ping Configuration

The server automatically pings itself at regular intervals to maintain uptime on Render's free tier. The following environment variables can be configured:

- `PING_INTERVAL`: Time interval between pings in seconds (default: 900 = 15 minutes)
- `ENABLE_SELF_PING`: Whether to enable self-ping functionality ('true' or 'false', default: 'true')

## How It Works

- A background thread runs continuously and makes HTTP requests to the server's own URL
- The self-ping uses a custom user agent: `Render-Self-Ping-Bot/1.0`
- Logs are printed to track ping success/failure
- Automatically detects the server's external URL on Render

## Deployment

When deploying to Render:
1. Set environment variables as needed in the Render dashboard
2. The server will automatically detect its own URL and start pinging itself
3. Monitor the logs to ensure pings are happening regularly

## Local Development

For local development, the self-ping will target `http://localhost:{PORT}` and can be disabled by setting `ENABLE_SELF_PING=false`.

---

The server runs using Python's built-in HTTP server with the following command:
```
npm start
```
or
```
python server.py
```