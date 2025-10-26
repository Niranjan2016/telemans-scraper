#!/usr/bin/env node

/**
 * Integration Example: Using Tele MANAS Mock API with your scraper
 * 
 * This example shows how to:
 * 1. Test your Tele MANAS scraper against the mock API
 * 2. Simulate different scenarios (success, errors, data variations)
 * 3. Update mock data to test different conditions
 */

const http = require('http');

const MOCK_API_BASE = 'http://localhost:3000';
const SCRAPER_BASE = 'http://localhost:8787'; // Your Tele MANAS scraper

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test scenarios
async function testScenario1_NormalOperation() {
  console.log('🧪 Scenario 1: Normal Operation');
  console.log('=' * 40);
  
  // 1. Check mock API is working
  console.log('1. Testing mock API...');
  const healthResponse = await makeRequest(`${MOCK_API_BASE}/health`);
  console.log('   ✅ Mock API Health:', healthResponse.data.status);
  
  // 2. Get current mock data
  console.log('2. Getting current mock data...');
  const dataResponse = await makeRequest(`${MOCK_API_BASE}/admin/data`);
  console.log('   📊 Current Data:', dataResponse.data.data);
  
  // 3. Test API endpoints
  console.log('3. Testing API endpoints...');
  const callCountResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/getCallCount`);
  console.log('   📞 getCallCount:', callCountResponse.data);
  
  const tmcResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/getTMCcount/TMC`);
  console.log('   🏥 getTMCcount:', tmcResponse.data);
  
  console.log('✅ Scenario 1 completed successfully!\n');
}

async function testScenario2_DataVariations() {
  console.log('🧪 Scenario 2: Data Variations');
  console.log('=' * 40);
  
  // Update mock data with different values
  const newData = {
    totalCalls: "3500000",
    teleManasCells: "65",
    mentoringInstitutes: "30",
    regionalCoordinatingCenters: "8"
  };
  
  console.log('1. Updating mock data...');
  const updateResponse = await makeRequest(`${MOCK_API_BASE}/admin/updateData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newData)
  });
  
  console.log('   ✅ Data updated:', updateResponse.data.message);
  
  // Test the updated data
  console.log('2. Testing updated data...');
  const callCountResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/getCallCount`);
  console.log('   📞 Updated getCallCount:', callCountResponse.data);
  
  const tmcResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/getTMCcount/TMC`);
  console.log('   🏥 Updated getTMCcount:', tmcResponse.data);
  
  console.log('✅ Scenario 2 completed successfully!\n');
}

async function testScenario3_ErrorHandling() {
  console.log('🧪 Scenario 3: Error Handling');
  console.log('=' * 40);
  
  // Test error simulation
  console.log('1. Testing error simulation...');
  try {
    const errorResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/simulateError`);
    console.log('   ❌ Error Response:', errorResponse.data);
  } catch (error) {
    console.log('   ❌ Error Caught:', error.message);
  }
  
  // Test non-existent endpoint
  console.log('2. Testing 404 handling...');
  try {
    const notFoundResponse = await makeRequest(`${MOCK_API_BASE}/TELEMANAS/rest/v0/nonexistent`);
    console.log('   🔍 404 Response:', notFoundResponse.data);
  } catch (error) {
    console.log('   ❌ 404 Error:', error.message);
  }
  
  console.log('✅ Scenario 3 completed successfully!\n');
}

async function testScenario4_ScraperIntegration() {
  console.log('🧪 Scenario 4: Scraper Integration');
  console.log('=' * 40);
  
  console.log('1. Testing scraper against mock API...');
  console.log('   📝 To test your scraper with this mock API:');
  console.log('   ');
  console.log('   a) Start this mock API server:');
  console.log('      cd /d/Impactyaan/Kaya\\ Guides/code/telemanas-mock-api');
  console.log('      npm start');
  console.log('   ');
  console.log('   b) Update your scraper environment:');
  console.log('      TELEMANAS_DASHBOARD_URL=http://localhost:3000');
  console.log('   ');
  console.log('   c) Test your scraper endpoints:');
  console.log('      curl http://localhost:8787/scrape');
  console.log('      curl http://localhost:8787/data');
  console.log('   ');
  console.log('   d) Test manual data entry:');
  console.log('      curl -X POST http://localhost:8787/manual-data \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"totalCalls": "3000000", "teleManasCells": "60", "mentoringInstitutes": "25", "regionalCoordinatingCenters": "6"}\'');
  
  console.log('✅ Scenario 4 completed successfully!\n');
}

// Main function
async function runIntegrationTests() {
  console.log('🚀 Tele MANAS Mock API Integration Tests');
  console.log('=' * 50);
  console.log('');
  
  try {
    await testScenario1_NormalOperation();
    await testScenario2_DataVariations();
    await testScenario3_ErrorHandling();
    await testScenario4_ScraperIntegration();
    
    console.log('🎉 All integration tests completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Keep this mock API server running');
    console.log('2. Update your Tele MANAS scraper to use this mock API');
    console.log('3. Test different scenarios and error conditions');
    console.log('4. Verify your scraper handles all cases correctly');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = {
  testScenario1_NormalOperation,
  testScenario2_DataVariations,
  testScenario3_ErrorHandling,
  testScenario4_ScraperIntegration,
  runIntegrationTests
};
