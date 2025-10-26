#!/usr/bin/env node

/**
 * Basic Tele MANAS Scraper Example
 * 
 * This example demonstrates how to use the extracted API calling logic
 * to scrape Tele MANAS data with multiple fallback strategies.
 */

const TeleManasScraper = require('../scraper');

async function main() {
  console.log('🚀 Tele MANAS Scraper Example');
  console.log('='.repeat(50));
  
  // Initialize scraper with custom options
  const scraper = new TeleManasScraper({
    baseUrl: 'https://telemanas.mohfw.gov.in',
    timeout: 10000,
    maxRetries: 3,
    enableLogging: true
  });

  try {
    // Test API connection first
    console.log('\n🧪 Testing API connection...');
    const isConnected = await scraper.apiClient.testConnection();
    console.log(`API Connection: ${isConnected ? '✅ Connected' : '❌ Failed'}`);

    // Perform scraping with fallback strategies
    console.log('\n📊 Starting data scraping...');
    const result = await scraper.scrape();

    if (result.success) {
      console.log('\n✅ Scraping successful!');
      console.log('📋 Data retrieved:');
      console.log(`   Total Calls: ${result.data.totalCalls}`);
      console.log(`   Tele MANAS Cells: ${result.data.teleManasCells}`);
      console.log(`   Mentoring Institutes: ${result.data.mentoringInstitutes}`);
      console.log(`   Regional Coordinating Centers: ${result.data.regionalCoordinatingCenters}`);
      console.log(`   Method used: ${result.method}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      console.log('\n❌ Scraping failed - returning 0 values');
      console.log(`Error: ${result.error}`);
      console.log('📋 Zero values returned:');
      console.log(`   Total Calls: ${result.data.totalCalls}`);
      console.log(`   Tele MANAS Cells: ${result.data.teleManasCells}`);
      console.log(`   Mentoring Institutes: ${result.data.mentoringInstitutes}`);
      console.log(`   Regional Coordinating Centers: ${result.data.regionalCoordinatingCenters}`);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
