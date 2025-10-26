/**
 * Tele MANAS Scraper Module
 * 
 * Simplified scraper with only essential methods:
 * 1. Direct API calls (primary method)
 * 2. Web scraping fallback
 * 
 * Returns 0 values if all methods fail
 */

const TeleManasAPIClient = require('./api-client');
const https = require('https');
const http = require('http');

class TeleManasScraper {
  constructor(options = {}) {
    this.apiClient = new TeleManasAPIClient(options);
    this.enableLogging = options.enableLogging !== false;
  }

  /**
   * Main scraping method with simplified fallback strategies
   */
  async scrape(options = {}) {
    const strategies = [
      { name: 'Direct API Calls', method: () => this._scrapeWithAPI() },
      { name: 'Web Scraping', method: () => this._scrapeWithWebScraping() }
    ];

    for (const { name, method } of strategies) {
      try {
        this.log(`🌐 Trying ${name}...`);
        const data = await method();

        if (data && this._hasValidData(data)) {
          this.log(`✅ ${name} successful:`, data);
          
          return {
            success: true,
            data,
            method: name,
            timestamp: new Date().toISOString()
          };
        }
        
        this.log(`⚠️ ${name} found no valid data`);
      } catch (error) {
        this.log(`❌ ${name} failed: ${error.message}`);
      }
    }

    // All strategies failed - return 0 values
    this.log('❌ All scraping strategies failed, returning 0 values');
    return {
      success: false,
      error: 'All scraping strategies failed',
      data: this._getZeroData(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scrape using direct API calls
   */
  async _scrapeWithAPI() {
    try {
      const data = await this.apiClient.getAllData();
      return data;
    } catch (error) {
      this.log(`API scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape using web scraping (fallback method)
   */
  async _scrapeWithWebScraping() {
    const url = 'https://telemanas.mohfw.gov.in/telemanas-dashboard/#/';
    
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Referer': 'https://telemanas.mohfw.gov.in/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };

    try {
      const response = await this._makeWebRequest(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Web scraping failed with status: ${response.status}`);
      }

      return this._extractDataFromHTML(response.data);

    } catch (error) {
      this.log(`Web scraping error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make web request for HTML content
   */
  async _makeWebRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const controller = new AbortController();
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Web request timeout'));
      }, options.timeout || 15000);

      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers,
        signal: controller.signal
      }, (res) => {
        clearTimeout(timeoutId);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Extract data from HTML using multiple strategies
   */
  _extractDataFromHTML(html) {
    const extractedData = {
      totalCalls: "0",
      teleManasCells: "0",
      mentoringInstitutes: "0",
      regionalCoordinatingCenters: "0"
    };

    try {
      // Strategy 1: Look for JSON data in script tags
      const jsonMatches = html.match(/<script[^>]*>[\s\S]*?({[^}]*"Total_Calls"[^}]*})[\s\S]*?<\/script>/gi);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const jsonStr = match.match(/{[^}]*"Total_Calls"[^}]*}/i)?.[0];
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              if (data.Total_Calls) extractedData.totalCalls = String(data.Total_Calls);
              if (data.TMC) extractedData.teleManasCells = String(data.TMC);
              if (data.MI) extractedData.mentoringInstitutes = String(data.MI);
              if (data.RCC) extractedData.regionalCoordinatingCenters = String(data.RCC);
            }
          } catch (e) {
            // Continue trying other matches
          }
        }
      }

      // Strategy 2: Look for patterns in HTML
      const patterns = [
        { pattern: /Total[^>]*>([0-9,]+)</i, field: 'totalCalls' },
        { pattern: /Calls[^>]*>([0-9,]+)</i, field: 'totalCalls' },
        { pattern: /TMC[^>]*>([0-9,]+)</i, field: 'teleManasCells' },
        { pattern: /Cells[^>]*>([0-9,]+)</i, field: 'teleManasCells' },
        { pattern: /MI[^>]*>([0-9,]+)</i, field: 'mentoringInstitutes' },
        { pattern: /Institutes[^>]*>([0-9,]+)</i, field: 'mentoringInstitutes' },
        { pattern: /RCC[^>]*>([0-9,]+)</i, field: 'regionalCoordinatingCenters' },
        { pattern: /Centers[^>]*>([0-9,]+)</i, field: 'regionalCoordinatingCenters' },
      ];

      for (const { pattern, field } of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          const value = match[1].replace(/,/g, '');
          if (value && !Number.isNaN(Number(value))) {
            extractedData[field] = value;
          }
        }
      }

      this.log('🔍 Extracted data from HTML:', extractedData);
      return extractedData;

    } catch (error) {
      this.log(`Error parsing HTML: ${error.message}`);
      return null;
    }
  }


  /**
   * Check if data is valid (not all zeros)
   */
  _hasValidData(data) {
    return Object.values(data).some(v => v !== "0" && v !== 0);
  }

  /**
   * Get zero data for fallback
   */
  _getZeroData() {
    return {
      totalCalls: "0",
      teleManasCells: "0",
      mentoringInstitutes: "0",
      regionalCoordinatingCenters: "0"
    };
  }

  /**
   * Test all scraping methods
   */
  async testAllMethods() {
    this.log('🧪 Testing all scraping methods...');
    
    const methods = [
      { name: 'API Connection', method: () => this.apiClient.testConnection() },
      { name: 'Direct API Scraping', method: () => this._scrapeWithAPI() },
      { name: 'Web Scraping', method: () => this._scrapeWithWebScraping() }
    ];

    const results = {};
    
    for (const { name, method } of methods) {
      try {
        const result = await method();
        results[name] = { success: true, data: result };
        this.log(`✅ ${name}: Success`);
      } catch (error) {
        results[name] = { success: false, error: error.message };
        this.log(`❌ ${name}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Log messages if logging is enabled
   */
  log(message) {
    if (this.enableLogging) {
      console.log(`[Scraper] ${message}`);
    }
  }
}

module.exports = TeleManasScraper;
