/**
 * Server Keep-Alive Script for Render Free Tier
 * This script periodically pings the server to prevent it from sleeping
 */

const axios = require('axios');
const cron = require('node-cron');

// Configuration
const SERVER_URL = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:8000';
const PING_INTERVAL = process.env.PING_INTERVAL || '*/14 * * * *'; // Every 14 minutes (slightly less than Python interval)
const TIMEOUT = process.env.PING_TIMEOUT || 5000; // 5 seconds

// Ping function
async function pingServer() {
    try {
        console.log(`[${new Date().toISOString()}] Pinging server at ${SERVER_URL}`);
        
        const response = await axios.get(SERVER_URL, {
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'Render-Keep-Alive-Bot/1.0'
            }
        });
        
        console.log(`✅ Server responded with status: ${response.status}`);
        return true;
    } catch (error) {
        console.error(`❌ Ping failed: ${error.message}`);
        
        // Log specific error details
        if (error.response) {
            console.error(`   Response status: ${error.response.status}`);
            console.error(`   Response data: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error(`   No response received`);
        }
        
        return false;
    }
}

// Health check function
async function healthCheck() {
    console.log('\n=== Server Health Check ===');
    const success = await pingServer();
    
    if (success) {
        console.log('✅ Server is healthy and responding');
    } else {
        console.log('⚠️  Server may be down or experiencing issues');
    }
    console.log('=========================\n');
}

// Start the keep-alive service
function startKeepAlive() {
    console.log('🚀 Starting Render Keep-Alive Service');
    console.log(`📍 Target URL: ${SERVER_URL}`);
    console.log(`⏰ Ping interval: ${PING_INTERVAL}`);
    console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
    console.log('=====================================\n');
    
    // Schedule periodic pings
    cron.schedule(PING_INTERVAL, async () => {
        console.log('🔄 Scheduled ping starting...');
        await pingServer();
        await healthCheck(); // Attempt health check if available
    });
    
    // Perform initial health check
    console.log('🎯 Initial ping on startup...');
    healthCheck();
    
    // Schedule daily health report
    cron.schedule('0 0 * * *', async () => {
        console.log('\n=== Daily Health Report ===');
        await healthCheck();
    });
    
    console.log('✅ Keep-alive service started successfully');
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down keep-alive service...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down keep-alive service...');
    process.exit(0);
});

// Export for use as module
module.exports = {
    pingServer,
    healthCheck,
    startKeepAlive
};

// Run if called directly
if (require.main === module) {
    startKeepAlive();
}