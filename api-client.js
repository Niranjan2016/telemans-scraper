/**
 * Advanced API Client for Tele MANAS Scraper
 * 
 * Extracted and enhanced from the source project with:
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Timeout management
 * - Multiple fallback strategies
 * - Request/response logging
 */

const https = require('https');
const http = require('http');

class TeleManasAPIClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://telemanas.mohfw.gov.in';
    this.timeout = options.timeout || 15000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.enableLogging = options.enableLogging !== false;
    
    // Default headers extracted from source project
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Referer': 'https://telemanas.mohfw.gov.in/telemanas-dashboard/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Cookie': '_gcl_au=1.1.1553982654.1761285178',
    };
  }

  /**
   * Make HTTP request with retry logic and comprehensive error handling
   */
  async makeRequest(url, options = {}) {
    const requestOptions = {
      method: options.method || 'GET',
      headers: { ...this.defaultHeaders, ...options.headers },
      timeout: options.timeout || this.timeout,
      ...options
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.log(`Attempt ${attempt}/${this.maxRetries} - ${requestOptions.method} ${url}`);
        
        const response = await this._executeRequest(url, requestOptions);
        
        if (response.ok) {
          this.log(`✅ Success on attempt ${attempt}`);
          return response;
        }
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          this.log(`❌ Client error ${response.status}, not retrying`);
          return response;
        }
        
        this.log(`⚠️ Server error ${response.status} on attempt ${attempt}`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        
      } catch (error) {
        this.log(`❌ Request failed on attempt ${attempt}: ${error.message}`);
        lastError = error;
        
        // Don't retry on certain errors
        if (this._isNonRetryableError(error)) {
          break;
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.log(`⏳ Waiting ${delay}ms before retry...`);
        await this._sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Execute the actual HTTP request
   */
  async _executeRequest(url, options) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const controller = new AbortController();
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Request timeout'));
      }, options.timeout);

      const req = client.request(url, {
        method: options.method,
        headers: options.headers,
        signal: controller.signal
      }, (res) => {
        clearTimeout(timeoutId);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              data: jsonData,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  /**
   * Check if error should not be retried
   */
  _isNonRetryableError(error) {
    const nonRetryableErrors = [
      'ENOTFOUND',
      'ECONNREFUSED',
      'ECONNRESET',
      'Request timeout'
    ];
    
    return nonRetryableErrors.some(errType => 
      error.message.includes(errType) || error.code === errType
    );
  }

  /**
   * Sleep utility for retry delays
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log messages if logging is enabled
   */
  log(message) {
    if (this.enableLogging) {
      console.log(`[APIClient] ${message}`);
    }
  }

  /**
   * Get total calls count
   */
  async getCallCount() {
    const url = `${this.baseUrl}/getCallCount`;
    const response = await this.makeRequest(url);
    
    if (response.ok) {
      return response.data?.Total_Calls || "0";
    }
    
    throw new Error(`Failed to get call count: ${response.status}`);
  }

  /**
   * Get TMC, MI, and RCC counts
   */
  async getTMCData() {
    const url = `${this.baseUrl}/getTMCcount`;
    const response = await this.makeRequest(url);
    
    if (response.ok) {
      return {
        teleManasCells: response.data?.TMC || "0",
        mentoringInstitutes: response.data?.MI || "0",
        regionalCoordinatingCenters: response.data?.RCC || "0"
      };
    }
    
    throw new Error(`Failed to get TMC data: ${response.status}`);
  }

  /**
   * Get all dashboard data in one call
   */
  async getAllData() {
    try {
      this.log('🔌 Fetching all Tele MANAS data...');
      
      const [totalCalls, tmcData] = await Promise.allSettled([
        this.getCallCount(),
        this.getTMCData()
      ]);

      const result = {
        totalCalls: totalCalls.status === 'fulfilled' ? totalCalls.value : "0",
        teleManasCells: tmcData.status === 'fulfilled' ? tmcData.value.teleManasCells : "0",
        mentoringInstitutes: tmcData.status === 'fulfilled' ? tmcData.value.mentoringInstitutes : "0",
        regionalCoordinatingCenters: tmcData.status === 'fulfilled' ? tmcData.value.regionalCoordinatingCenters : "0"
      };

      // Check if we got any real data
      const hasData = Object.values(result).some(v => v !== "0");
      
      if (hasData) {
        this.log('✅ Successfully retrieved data:', result);
      } else {
        this.log('⚠️ No data retrieved (all zeros)');
      }

      return result;

    } catch (error) {
      this.log(`❌ Error fetching all data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      this.log('🧪 Testing API connection...');
      const response = await this.makeRequest(`${this.baseUrl}/getCallCount`);
      
      if (response.ok) {
        this.log('✅ API connection successful');
        return true;
      } else {
        this.log(`❌ API connection failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ API connection test failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = TeleManasAPIClient;
