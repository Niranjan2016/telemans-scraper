const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://telemanas.mohfw.gov.in', 'http://localhost:3000', 'http://localhost:8787'],
  credentials: true
}));
app.use(express.json());

// Mock data - simulating real Tele MANAS data
let mockData = {
  totalCalls: "2821889",
  teleManasCells: "53", 
  mentoringInstitutes: "23",
  regionalCoordinatingCenters: "5"
};

// Simulate data changes over time (for testing)
function updateMockData() {
  const now = new Date();
  const hour = now.getHours();
  
  // Simulate slight variations based on time
  const baseCalls = 2821889;
  const variation = Math.floor(Math.random() * 1000) + (hour * 50);
  
  mockData = {
    totalCalls: (baseCalls + variation).toString(),
    teleManasCells: "53",
    mentoringInstitutes: "23", 
    regionalCoordinatingCenters: "5"
  };
}

// Update data every 5 minutes
setInterval(updateMockData, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tele MANAS Mock API'
  });
});

// Mock the essential Tele MANAS API endpoints
app.get('/getCallCount', (req, res) => {
  console.log('📞 GET /getCallCount');
  
  // Simulate some processing time
  setTimeout(() => {
    res.json({
      Total_Calls: mockData.totalCalls
    });
  }, Math.random() * 200 + 100); // 100-300ms delay
});

app.get('/getTMCcount', (req, res) => {
  console.log('🏥 GET /getTMCcount');
  
  // Simulate some processing time
  setTimeout(() => {
    res.json({
      TMC: mockData.teleManasCells,
      MI: mockData.mentoringInstitutes,
      RCC: mockData.regionalCoordinatingCenters
    });
  }, Math.random() * 200 + 100); // 100-300ms delay
});

// Admin endpoint to update mock data
app.post('/admin/updateData', (req, res) => {
  console.log('🔧 POST /admin/updateData');
  
  const { totalCalls, teleManasCells, mentoringInstitutes, regionalCoordinatingCenters } = req.body;
  
  if (totalCalls) mockData.totalCalls = totalCalls.toString();
  if (teleManasCells) mockData.teleManasCells = teleManasCells.toString();
  if (mentoringInstitutes) mockData.mentoringInstitutes = mentoringInstitutes.toString();
  if (regionalCoordinatingCenters) mockData.regionalCoordinatingCenters = regionalCoordinatingCenters.toString();
  
  res.json({
    message: 'Mock data updated successfully',
    data: mockData,
    timestamp: new Date().toISOString()
  });
});

// Get current mock data
app.get('/admin/data', (req, res) => {
  res.json({
    data: mockData,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tele MANAS Mock API Server',
    version: '1.0.0',
    endpoints: {
      'GET /getCallCount': 'Get total calls count',
      'GET /getTMCcount': 'Get TMC, MI, RCC counts',
      'POST /admin/updateData': 'Update mock data',
      'GET /admin/data': 'Get current mock data',
      'GET /health': 'Health check'
    },
    currentData: mockData
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
  console.log('🚀 Tele MANAS Mock API Server Started');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /getCallCount');
  console.log('   GET  /getTMCcount');
  console.log('   POST /admin/updateData');
  console.log('   GET  /admin/data');
  console.log('   GET  /health');
  console.log('');
  console.log('🧪 Test the API:');
  console.log(`   curl http://localhost:${PORT}/getCallCount`);
  console.log(`   curl http://localhost:${PORT}/getTMCcount`);
  console.log('');
  console.log('📊 Current mock data:', mockData);
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
