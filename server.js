const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const TeleManasScraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize scraper
const scraper = new TeleManasScraper({
  baseUrl: 'https://telemanas.mohfw.gov.in',
  timeout: 15000,
  maxRetries: 3,
  enableLogging: true
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://telemanas.mohfw.gov.in', 'http://localhost:3000', 'http://localhost:8787'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tele MANAS Mock API'
  });
});

// Scrape data using the scraper
app.get('/getCallCount', async (req, res) => {
  console.log('📞 GET /getCallCount - Running scraper...');
  
  try {
    const result = await scraper.scrape();
    
    if (result.success) {
      console.log('✅ Scraping successful, returning data');
      res.json({
        Total_Calls: result.data.totalCalls
      });
    } else {
      console.log('❌ Scraping failed, returning 0');
      res.json({
        Total_Calls: "0"
      });
    }
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
      Total_Calls: "0"
    });
  }
});

app.get('/getTMCcount', async (req, res) => {
  console.log('🏥 GET /getTMCcount - Running scraper...');
  
  try {
    const result = await scraper.scrape();
    
    if (result.success) {
      console.log('✅ Scraping successful, returning TMC data');
      res.json({
        TMC: result.data.teleManasCells,
        MI: result.data.mentoringInstitutes,
        RCC: result.data.regionalCoordinatingCenters
      });
    } else {
      console.log('❌ Scraping failed, returning 0 values');
      res.json({
        TMC: "0",
        MI: "0",
        RCC: "0"
      });
    }
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
      TMC: "0",
      MI: "0",
      RCC: "0"
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tele MANAS Scraper API Server',
    version: '1.0.0',
    endpoints: {
      'GET /getCallCount': 'Get total calls count (live scraping)',
      'GET /getTMCcount': 'Get TMC, MI, RCC counts (live scraping)',
      'GET /health': 'Health check'
    },
    description: 'This server runs live scraping against Tele MANAS APIs'
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
  console.log('🚀 Tele MANAS Scraper API Server Started');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /getCallCount (live scraping)');
  console.log('   GET  /getTMCcount (live scraping)');
  console.log('   GET  /health');
  console.log('');
  console.log('🧪 Test the API:');
  console.log(`   curl http://localhost:${PORT}/getCallCount`);
  console.log(`   curl http://localhost:${PORT}/getTMCcount`);
  console.log('');
  console.log('⚠️  Note: This server runs live scraping against Tele MANAS APIs');
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
