#!/usr/bin/env node

/**
 * Integration Example: Using the extracted API calling logic
 * 
 * This example shows how to integrate the API calling logic
 * with your existing applications and workflows.
 */

const TeleManasScraper = require('../scraper');
const TeleManasAPIClient = require('../api-client');

class TeleManasDataService {
  constructor(options = {}) {
    this.scraper = new TeleManasScraper(options);
    this.apiClient = new TeleManasAPIClient(options);
    this.dataCache = new Map();
    this.cacheTimeout = options.cacheTimeout || 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get latest data with caching
   */
  async getLatestData(useCache = true) {
    const cacheKey = 'latestData';
    
    if (useCache) {
      const cached = this.dataCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log('📦 Returning cached data');
        return cached.data;
      }
    }

    console.log('🔄 Fetching fresh data...');
    const result = await this.scraper.scrape();
    
    if (result.success) {
      this.dataCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }

  /**
   * Get data with specific method preference
   */
  async getDataWithMethod(preferredMethod = 'api') {
    const methods = {
      api: () => this.scraper._scrapeWithAPI(),
      web: () => this.scraper._scrapeWithWebScraping()
    };

    if (methods[preferredMethod]) {
      try {
        console.log(`🎯 Trying preferred method: ${preferredMethod}`);
        const data = await methods[preferredMethod]();
        if (data && this.scraper._hasValidData(data)) {
          return {
            success: true,
            data,
            method: preferredMethod,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.log(`⚠️ Preferred method failed: ${error.message}`);
      }
    }

    // Fallback to full scraping
    console.log('🔄 Falling back to full scraping...');
    return await this.scraper.scrape();
  }

  /**
   * Monitor data changes over time
   */
  async startMonitoring(intervalMs = 60000) {
    console.log(`🔍 Starting data monitoring (interval: ${intervalMs}ms)`);
    
    let lastData = null;
    
    const monitor = async () => {
      try {
        const result = await this.getLatestData(false);
        
        if (result.success && lastData) {
          const changes = this._detectChanges(lastData.data, result.data);
          if (changes.length > 0) {
            console.log('📈 Data changes detected:');
            changes.forEach(change => {
              console.log(`   ${change.field}: ${change.oldValue} → ${change.newValue}`);
            });
          } else {
            console.log('📊 No data changes detected');
          }
        }
        
        lastData = result;
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    };

    // Run immediately
    await monitor();
    
    // Set up interval
    return setInterval(monitor, intervalMs);
  }

  /**
   * Detect changes between two data sets
   */
  _detectChanges(oldData, newData) {
    const changes = [];
    const fields = ['totalCalls', 'teleManasCells', 'mentoringInstitutes', 'regionalCoordinatingCenters'];
    
    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field]
        });
      }
    });
    
    return changes;
  }

  /**
   * Export data in different formats
   */
  exportData(data, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        const fields = ['totalCalls', 'teleManasCells', 'mentoringInstitutes', 'regionalCoordinatingCenters'];
        const headers = fields.join(',');
        const values = fields.map(field => data[field] || '0').join(',');
        return `${headers}\n${values}`;
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<telemanas-data>
  <total-calls>${data.totalCalls}</total-calls>
  <tele-manas-cells>${data.teleManasCells}</tele-manas-cells>
  <mentoring-institutes>${data.mentoringInstitutes}</mentoring-institutes>
  <regional-coordinating-centers>${data.regionalCoordinatingCenters}</regional-coordinating-centers>
  <timestamp>${data.timestamp || new Date().toISOString()}</timestamp>
</telemanas-data>`;
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

// Example usage
async function demonstrateIntegration() {
  console.log('🔧 Tele MANAS Data Service Integration Example');
  console.log('='.repeat(60));

  const service = new TeleManasDataService({
    baseUrl: 'https://telemanas.mohfw.gov.in',
    timeout: 8000,
    maxRetries: 2,
    enableLogging: true,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  });

  try {
    // Example 1: Get latest data with caching
    console.log('\n📊 Example 1: Get Latest Data');
    const latestData = await service.getLatestData();
    console.log('Latest data:', latestData);

    // Example 2: Get data with preferred method
    console.log('\n🎯 Example 2: Get Data with Preferred Method');
    const apiData = await service.getDataWithMethod('api');
    console.log('API data:', apiData);

    // Example 3: Export data in different formats
    console.log('\n📤 Example 3: Export Data');
    if (latestData.success) {
      console.log('JSON format:');
      console.log(service.exportData(latestData.data, 'json'));
      
      console.log('\nCSV format:');
      console.log(service.exportData(latestData.data, 'csv'));
    }

    // Example 4: Start monitoring (run for 30 seconds)
    console.log('\n🔍 Example 4: Data Monitoring');
    const monitoringInterval = await service.startMonitoring(10000); // 10 seconds
    
    // Stop monitoring after 30 seconds
    setTimeout(() => {
      clearInterval(monitoringInterval);
      console.log('\n✅ Monitoring stopped');
    }, 30000);

  } catch (error) {
    console.error('❌ Integration example failed:', error.message);
  }
}

// Run the integration example
if (require.main === module) {
  demonstrateIntegration().catch(console.error);
}

module.exports = {
  TeleManasDataService,
  demonstrateIntegration
};
