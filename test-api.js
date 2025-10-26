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
    const response = await makeRequest(`${BASE_URL}/TELEMANAS/rest/v0/getCallCount`);
    console.log('✅ getCallCount Response:', response.data);
  } catch (error) {
    console.log('❌ getCallCount Failed:', error.message);
  }
}

async function testGetTMCcount() {
  console.log('\n🏥 Testing getTMCcount API...');
  try {
    const response = await makeRequest(`${BASE_URL}/TELEMANAS/rest/v0/getTMCcount/TMC`);
    console.log('✅ getTMCcount Response:', response.data);
  } catch (error) {
    console.log('❌ getTMCcount Failed:', error.message);
  }
}

async function testGetDashboardData() {
  console.log('\n📊 Testing getDashboardData API...');
  try {
    const response = await makeRequest(`${BASE_URL}/TELEMANAS/rest/v0/getDashboardData`);
    console.log('✅ getDashboardData Response:', response.data);
  } catch (error) {
    console.log('❌ getDashboardData Failed:', error.message);
  }
}

async function testErrorSimulation() {
  console.log('\n❌ Testing Error Simulation...');
  try {
    const response = await makeRequest(`${BASE_URL}/TELEMANAS/rest/v0/simulateError`);
    console.log('✅ Error Simulation Response:', response.data);
  } catch (error) {
    console.log('❌ Error Simulation Failed:', error.message);
  }
}

async function testUpdateData() {
  console.log('\n🔧 Testing Data Update...');
  try {
    const updateData = {
      totalCalls: "3000000",
      teleManasCells: "60",
      mentoringInstitutes: "25",
      regionalCoordinatingCenters: "6"
    };
    
    const response = await makeRequest(`${BASE_URL}/admin/updateData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('✅ Data Update Response:', response.data);
  } catch (error) {
    console.log('❌ Data Update Failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Tele MANAS Mock API Tests\n');
  console.log('=' * 50);
  
  await testHealthCheck();
  await testGetCallCount();
  await testGetTMCcount();
  await testGetDashboardData();
  await testErrorSimulation();
  
  console.log('\n' + '=' * 50);
  console.log('✅ All tests completed!');
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /TELEMANAS/rest/v0/getCallCount');
  console.log('   GET  /TELEMANAS/rest/v0/getTMCcount/TMC');
  console.log('   GET  /TELEMANAS/rest/v0/getDashboardData');
  console.log('   GET  /TELEMANAS/rest/v0/simulateError');
  console.log('   POST /admin/updateData');
  console.log('   GET  /admin/data');
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
  testGetDashboardData,
  testErrorSimulation,
  testUpdateData,
  runTests
};
