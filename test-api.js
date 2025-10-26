#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
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
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const response = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
}

async function testGetCallCount() {
  console.log('\n📞 Testing getCallCount API...');
  try {
    const response = await makeRequest(`${BASE_URL}/getCallCount`);
    console.log('✅ getCallCount Response:', response.data);
  } catch (error) {
    console.log('❌ getCallCount Failed:', error.message);
  }
}

async function testGetTMCcount() {
  console.log('\n🏥 Testing getTMCcount API...');
  try {
    const response = await makeRequest(`${BASE_URL}/getTMCcount`);
    console.log('✅ getTMCcount Response:', response.data);
  } catch (error) {
    console.log('❌ getTMCcount Failed:', error.message);
  }
}


async function testUpdateData() {
  console.log('\n🔧 Testing Data Update...');
  console.log('⚠️  Data update endpoint removed - server now uses live scraping');
  console.log('✅ No action needed - data is scraped live from Tele MANAS APIs');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Tele MANAS Mock API Tests\n');
  console.log('='.repeat(50));
  
  await testHealthCheck();
  await testGetCallCount();
  await testGetTMCcount();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /getCallCount (live scraping)');
  console.log('   GET  /getTMCcount (live scraping)');
  console.log('   GET  /health');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  makeRequest,
  testHealthCheck,
  testGetCallCount,
  testGetTMCcount,
  testUpdateData,
  runTests
};
