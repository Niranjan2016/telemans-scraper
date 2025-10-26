# Tele MANAS Mock API - Integration Guide

## 🎯 Overview

This Node.js API server mimics the Tele MANAS dashboard endpoints, providing a reliable testing environment for your Tele MANAS scraper without hitting the real API.

## 🚀 Quick Start

```bash
# Navigate to the mock API directory
cd /d/Impactyaan/Kaya\ Guides/code/telemanas-mock-api

# Install dependencies
npm install

# Start the server
npm start
```

## 📋 Available Endpoints

### Core Tele MANAS Endpoints
- `GET /TELEMANAS/rest/v0/getCallCount` - Returns `{"Total_Calls": "2821889"}`
- `GET /TELEMANAS/rest/v0/getTMCcount/TMC` - Returns `{"TMC": "53", "MI": "23", "RCC": "5"}`
- `GET /TELEMANAS/rest/v0/getDashboardData` - Returns all data with timestamp

### Testing Endpoints
- `GET /TELEMANAS/rest/v0/simulateError` - Simulates random API errors
- `GET /health` - Health check endpoint

### Admin Endpoints
- `POST /admin/updateData` - Update mock data
- `GET /admin/data` - Get current mock data

## 🧪 Testing Your Scraper

### 1. Start the Mock API Server
```bash
cd /d/Impactyaan/Kaya\ Guides/code/telemanas-mock-api
npm start
```

### 2. Update Your Scraper Environment
Set the environment variable to point to the mock API:
```bash
export TELEMANAS_DASHBOARD_URL=http://localhost:3000
```

### 3. Test Your Scraper Endpoints
```bash
# Test scraping endpoint
curl http://localhost:8787/scrape

# Test data retrieval
curl http://localhost:8787/data

# Test manual data entry
curl -X POST http://localhost:8787/manual-data \
  -H "Content-Type: application/json" \
  -d '{
    "totalCalls": "3000000",
    "teleManasCells": "60",
    "mentoringInstitutes": "25",
    "regionalCoordinatingCenters": "6"
  }'
```

## 🔧 Mock Data Management

### Update Mock Data
```bash
curl -X POST http://localhost:3000/admin/updateData \
  -H "Content-Type: application/json" \
  -d '{
    "totalCalls": "3500000",
    "teleManasCells": "65",
    "mentoringInstitutes": "30",
    "regionalCoordinatingCenters": "8"
  }'
```

### Get Current Mock Data
```bash
curl http://localhost:3000/admin/data
```

### Simulate API Errors
```bash
curl http://localhost:3000/TELEMANAS/rest/v0/simulateError
```

## 📊 Response Formats

### getCallCount Response
```json
{
  "Total_Calls": "2821889"
}
```

### getTMCcount Response
```json
{
  "TMC": "53",
  "MI": "23",
  "RCC": "5"
}
```

### getDashboardData Response
```json
{
  "totalCalls": "2821889",
  "teleManasCells": "53",
  "mentoringInstitutes": "23",
  "regionalCoordinatingCenters": "5",
  "lastUpdated": "2025-01-15T12:30:00.000Z"
}
```

## 🎯 Use Cases

### 1. Development Testing
- Test your scraper without hitting the real Tele MANAS API
- Avoid rate limiting and IP blocking issues
- Develop offline without internet connectivity

### 2. Error Handling Testing
- Test how your scraper handles different error scenarios
- Simulate network failures and API errors
- Verify fallback mechanisms work correctly

### 3. Data Variation Testing
- Test with different data values
- Verify your scraper handles data changes correctly
- Test edge cases and boundary conditions

### 4. Load Testing
- Test your scraper's performance with consistent API responses
- Simulate high-frequency requests
- Verify your scraper's retry logic

## 🛠️ Integration with Your Scraper

### Method 1: Environment Variable
```bash
# Set environment variable
export TELEMANAS_DASHBOARD_URL=http://localhost:3000

# Start your scraper
cd /d/Impactyaan/Kaya\ Guides/code/kayaguides/package/telemanas-scraper
pnpm dev
```

### Method 2: Direct URL Modification
Update your scraper's configuration to use the mock API URL:
```typescript
const TELEMANAS_DASHBOARD_URL = 'http://localhost:3000';
```

### Method 3: Proxy Configuration
Use a proxy to redirect requests from the real Tele MANAS domain to your mock API.

## 🧪 Test Scripts

### Run Basic Tests
```bash
node test-api.js
```

### Run Integration Tests
```bash
node integration-example.js
```

## 📝 Notes

- **Realistic Response Times**: The mock API simulates realistic response times (100-300ms)
- **Data Variations**: Mock data updates every 5 minutes with slight variations
- **CORS Configuration**: CORS is configured to allow requests from Tele MANAS domains
- **Error Simulation**: The `/simulateError` endpoint returns random error types
- **Graceful Shutdown**: The server handles shutdown signals properly

## 🚀 Production Considerations

This is a **development/testing tool only**. For production use:

- Add authentication/authorization
- Implement rate limiting
- Add request validation
- Use proper logging
- Add monitoring and metrics
- Implement data persistence
- Add backup and recovery mechanisms

## 🔍 Troubleshooting

### Server Not Starting
```bash
# Check if port 3000 is available
netstat -an | grep :3000

# Try a different port
PORT=3001 npm start
```

### Connection Refused
```bash
# Check if server is running
curl http://localhost:3000/health

# Check server logs
# Look for error messages in the console output
```

### CORS Issues
The mock API is configured to allow requests from:
- `https://telemanas.mohfw.gov.in`
- `http://localhost:3000`
- `http://localhost:8787`

If you need to add more origins, update the CORS configuration in `server.js`.

## 📞 Support

For issues or questions:
1. Check the server logs for error messages
2. Verify the mock API is running on the correct port
3. Test the endpoints directly with curl
4. Check your scraper's configuration and environment variables
