#!/usr/bin/env node

/**
 * Advanced Tele MANAS Scraper Test
 * 
 * This example demonstrates advanced usage including:
 * - Testing all scraping methods
 * - Custom configuration
 * - Error handling
 * - Performance monitoring
 */

const TeleManasScraper = require('../scraper');
const TeleManasAPIClient = require('../api-client');

async function testAllMethods() {
  console.log('🧪 Testing All Scraping Methods');
  console.log('='.repeat(50));

  const scraper = new TeleManasScraper({
    baseUrl: 'https://telemanas.mohfw.gov.in',
    timeout: 5000,
    maxRetries: 2,
    enableLogging: true
  });

  try {
    const results = await scraper.testAllMethods();
    
    console.log('\n📊 Test Results:');
    Object.entries(results).forEach(([method, result]) => {
      if (result.success) {
        console.log(`✅ ${method}: Success`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   Data: ${JSON.stringify(result.data)}`);
        }
      } else {
        console.log(`❌ ${method}: ${result.error}`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testAPIClientDirectly() {
  console.log('\n🔌 Testing API Client Directly');
  console.log('='.repeat(50));

  const apiClient = new TeleManasAPIClient({
    baseUrl: 'https://telemanas.mohfw.gov.in',
    timeout: 8000,
    maxRetries: 3,
    enableLogging: true
  });

  try {
    // Test individual endpoints
    console.log('\n📞 Testing getCallCount...');
    const callCount = await apiClient.getCallCount();
    console.log(`Total Calls: ${callCount}`);

    console.log('\n🏥 Testing getTMCData...');
    const tmcData = await apiClient.getTMCData();
    console.log(`TMC Data:`, tmcData);

    console.log('\n📊 Testing getAllData...');
    const allData = await apiClient.getAllData();
    console.log(`All Data:`, allData);

  } catch (error) {
    console.error('❌ API Client test failed:', error.message);
  }
}

async function testWithMockAPI() {
  console.log('\n🎭 Testing with Mock API');
  console.log('='.repeat(50));

  // Test against local mock API
  const scraper = new TeleManasScraper({
    baseUrl: 'http://localhost:3000',
    timeout: 3000,
    maxRetries: 1,
    enableLogging: true
  });

  try {
    console.log('📊 Testing against mock API...');
    const result = await scraper.scrape();

    if (result.success) {
      console.log('✅ Mock API test successful!');
      console.log('📋 Mock data retrieved:');
      console.log(`   Total Calls: ${result.data.totalCalls}`);
      console.log(`   Tele MANAS Cells: ${result.data.teleManasCells}`);
      console.log(`   Mentoring Institutes: ${result.data.mentoringInstitutes}`);
      console.log(`   Regional Coordinating Centers: ${result.data.regionalCoordinatingCenters}`);
    } else {
      console.log('❌ Mock API test failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Mock API test error:', error.message);
    console.log('💡 Make sure the mock API server is running: npm start');
  }
}

async function performanceTest() {
  console.log('\n⚡ Performance Test');
  console.log('='.repeat(50));

  const scraper = new TeleManasScraper({
    baseUrl: 'https://telemanas.mohfw.gov.in',
    timeout: 10000,
    maxRetries: 2,
    enableLogging: false // Disable logging for cleaner performance output
  });

  const iterations = 3;
  const times = [];

  for (let i = 1; i <= iterations; i++) {
    console.log(`🔄 Running iteration ${i}/${iterations}...`);
    
    const startTime = Date.now();
    try {
      const result = await scraper.scrape();
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);
      
      console.log(`   ✅ Iteration ${i}: ${duration}ms (${result.method})`);
    } catch (error) {
      console.log(`   ❌ Iteration ${i}: Failed (${error.message})`);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n📊 Performance Summary:');
    console.log(`   Average time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min time: ${minTime}ms`);
    console.log(`   Max time: ${maxTime}ms`);
    console.log(`   Success rate: ${times.length}/${iterations} (${((times.length/iterations)*100).toFixed(1)}%)`);
  }
}

async function main() {
  console.log('🚀 Advanced Tele MANAS Scraper Test Suite');
  console.log('='.repeat(60));
  
  try {
    await testAllMethods();
    await testAPIClientDirectly();
    await testWithMockAPI();
    await performanceTest();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the mock API server: npm start');
    console.log('2. Run basic scraper: npm run scrape');
    console.log('3. Test API endpoints: npm run test-api');
    console.log('4. Run this advanced test: npm run test-scraper');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the test suite
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAllMethods,
  testAPIClientDirectly,
  testWithMockAPI,
  performanceTest,
  main
};
