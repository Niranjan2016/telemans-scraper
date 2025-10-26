const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Common headers for both API calls
const commonHeaders = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json',
  'Cookie': '_gcl_au=1.1.1553982654.1761285178',
  'Referer': 'https://telemanas.mohfw.gov.in/telemanas-dashboard/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"'
};

// Helper function to make HTTPS requests
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'GET',
      headers: { ...commonHeaders, ...headers },
      timeout: 10000
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tele MANAS API Proxy'
  });
});

// Get call count endpoint
app.get('/getCallCount', async (req, res) => {
  console.log('📞 GET /getCallCount - Calling Tele MANAS API...');
  
  try {
    const url = 'https://telemanas.mohfw.gov.in/TELEMANAS/rest/v0/getCallCount';
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      console.log('✅ getCallCount successful');
      res.json(response.data);
    } else {
      console.log(`❌ getCallCount failed with status: ${response.status}`);
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error('❌ getCallCount error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch call count',
      message: error.message
    });
  }
});

// Get TMC count endpoint
app.get('/getTMCCount', async (req, res) => {
  console.log('🏥 GET /getTMCCount - Calling Tele MANAS API...');
  
  try {
    const url = 'https://telemanas.mohfw.gov.in/TELEMANAS/rest/v0/getOrg/TMC';
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      console.log('✅ getTMCCount successful');
      res.json(response.data);
    } else {
      console.log(`❌ getTMCCount failed with status: ${response.status}`);
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error('❌ getTMCCount error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch TMC count',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tele MANAS API Proxy',
    version: '1.0.0',
    endpoints: {
      'GET /getCallCount': 'Get total calls count from Tele MANAS API',
      'GET /getTMCCount': 'Get TMC organization data from Tele MANAS API',
      'GET /health': 'Health check'
    },
    description: 'Simple proxy server that forwards requests to Tele MANAS APIs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Tele MANAS API Proxy Started');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /getCallCount');
  console.log('   GET  /getTMCCount');
  console.log('   GET  /health');
  console.log('');
  console.log('🧪 Test the API:');
  console.log(`   curl http://localhost:${PORT}/getCallCount`);
  console.log(`   curl http://localhost:${PORT}/getTMCCount`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});