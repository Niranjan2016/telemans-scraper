# Tele MANAS Scraper with Advanced API Calling Logic

This project contains extracted and enhanced API calling logic from the source Tele MANAS scraper, featuring robust error handling, retry mechanisms, and multiple fallback strategies.

## 🚀 Features

- **Advanced API Client** with retry logic and exponential backoff
- **Simplified Fallback Strategies** (API calls → Web scraping → 0 values)
- **Comprehensive Error Handling** with timeout management
- **Request/Response Logging** for debugging and monitoring
- **Mock API Server** with essential endpoints only
- **Performance Monitoring** and testing utilities

## 📁 Project Structure

```
├── api-client.js          # Advanced API client with retry logic
├── scraper.js            # Main scraper with fallback strategies
├── server.js             # Mock API server
├── test-api.js           # API testing utilities
├── examples/             # Usage examples and integration tests
│   ├── basic-scraper.js  # Basic usage example
│   ├── test-scraper.js   # Advanced testing suite
│   └── integration-example.js # Integration patterns
├── package.json          # Project dependencies and scripts
└── README.md            # This file
```

## 🛠️ Installation

```bash
# Clone or download the project
cd telemans-scraper

# Install dependencies
npm install

# Start the mock API server (optional, for testing)
npm start
```

## 📖 Usage

### Basic Usage

```javascript
const TeleManasScraper = require('./scraper');

const scraper = new TeleManasScraper({
  baseUrl: 'https://telemanas.mohfw.gov.in',
  timeout: 10000,
  maxRetries: 3,
  enableLogging: true
});

// Scrape data with automatic fallback strategies
const result = await scraper.scrape();

if (result.success) {
  console.log('Data retrieved:', result.data);
  console.log('Method used:', result.method);
} else {
  console.log('Scraping failed:', result.error);
}
```

### Advanced API Client Usage

```javascript
const TeleManasAPIClient = require('./api-client');

const apiClient = new TeleManasAPIClient({
  baseUrl: 'https://telemanas.mohfw.gov.in',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: true
});

// Test connection
const isConnected = await apiClient.testConnection();

// Get specific data
const callCount = await apiClient.getCallCount();
const tmcData = await apiClient.getTMCData();

// Get all data at once
const allData = await apiClient.getAllData();
```

### Integration Service Example

```javascript
const { TeleManasDataService } = require('./examples/integration-example');

const service = new TeleManasDataService({
  baseUrl: 'https://telemanas.mohfw.gov.in',
  cacheTimeout: 10 * 60 * 1000, // 10 minutes
  enableLogging: true
});

// Get latest data with caching
const data = await service.getLatestData();

// Export in different formats
const jsonData = service.exportData(data.data, 'json');
const csvData = service.exportData(data.data, 'csv');

// Start monitoring for changes
const monitoringInterval = await service.startMonitoring(60000); // 1 minute
```

## 🔧 Configuration Options

### TeleManasAPIClient Options

```javascript
{
  baseUrl: 'https://telemanas.mohfw.gov.in',  // Base URL for API calls
  timeout: 15000,                             // Request timeout in ms
  maxRetries: 3,                              // Maximum retry attempts
  retryDelay: 1000,                           // Initial retry delay in ms
  enableLogging: true                         // Enable request/response logging
}
```

### TeleManasScraper Options

```javascript
{
  baseUrl: 'https://telemanas.mohfw.gov.in',  // Base URL for API calls
  timeout: 15000,                             // Request timeout in ms
  maxRetries: 3,                              // Maximum retry attempts
  enableLogging: true,                        // Enable logging
  cacheTimeout: 5 * 60 * 1000                // Cache timeout in ms
}
```

## 🧪 Testing

### Run Basic Tests

```bash
# Test the mock API server
npm run test-api

# Test the scraper
npm run test-scraper

# Run basic scraper example
npm run scrape
```

### Test Against Mock API

```bash
# Start mock API server
npm start

# In another terminal, test against mock API
node examples/test-scraper.js
```

### Test Against Real API

```bash
# Test against real Tele MANAS API
node examples/basic-scraper.js
```

## 📊 API Endpoints

The scraper API server provides the following live scraping endpoints:

- `GET /getCallCount` - Get total calls count (live scraping)
- `GET /getTMCcount` - Get TMC, MI, RCC counts (live scraping)
- `GET /health` - Health check

## 🔄 Fallback Strategies

The scraper implements simplified fallback strategies in order:

1. **Direct API Calls** - Primary method using REST API endpoints
2. **Web Scraping** - Fallback using HTML parsing
3. **Zero Values** - Returns all zeros if all methods fail

## 🚨 Error Handling

The API client includes comprehensive error handling:

- **Retry Logic** with exponential backoff
- **Timeout Management** to prevent hanging requests
- **Non-retryable Error Detection** (connection refused, DNS errors)
- **Graceful Degradation** with fallback strategies
- **Detailed Logging** for debugging

## 📈 Performance Features

- **Request Caching** to reduce API calls
- **Parallel Requests** for multiple endpoints
- **Performance Monitoring** utilities
- **Connection Pooling** (via Node.js built-in modules)

## 🔍 Monitoring and Logging

Enable detailed logging to monitor API calls:

```javascript
const scraper = new TeleManasScraper({
  enableLogging: true  // Shows detailed request/response logs
});
```

Example log output:
```
[APIClient] Attempt 1/3 - GET https://telemanas.mohfw.gov.in/TELEMANAS/rest/v0/getCallCount
[APIClient] ✅ Success on attempt 1
[Scraper] ✅ Direct API Calls successful: { totalCalls: "2821889", ... }
```

## 🛡️ Security Features

- **Request Headers** matching real browser requests
- **User-Agent Spoofing** to avoid detection
- **Referer Headers** for proper request context
- **Cookie Support** for session management

## 📝 Examples

### Example 1: Basic Scraping

```bash
node examples/basic-scraper.js
```

### Example 2: Advanced Testing

```bash
node examples/test-scraper.js
```

### Example 3: Integration Patterns

```bash
node examples/integration-example.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Increase timeout value in configuration
   - Check network connectivity
   - Verify API endpoint availability

2. **All Methods Failing**
   - Check if the target API is accessible
   - Verify request headers and user agent
   - Try using mock API for testing

3. **Rate Limiting**
   - Implement delays between requests
   - Use caching to reduce API calls
   - Consider using different IP addresses

### Debug Mode

Enable detailed logging to debug issues:

```javascript
const scraper = new TeleManasScraper({
  enableLogging: true,
  timeout: 30000,
  maxRetries: 5
});
```

## 📞 Support

For issues and questions:
1. Check the examples in the `examples/` directory
2. Review the test files for usage patterns
3. Enable logging to debug API calls
4. Test against the mock API first

---

**Note**: This project extracts and enhances API calling logic from the original Tele MANAS scraper. It includes robust error handling, retry mechanisms, and multiple fallback strategies to ensure reliable data retrieval.