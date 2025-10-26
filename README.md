# Tele MANAS Mock API

A Node.js API server that mimics the Tele MANAS dashboard endpoints for testing and development purposes.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or start in development mode with auto-restart
npm run dev
```

## 📋 Available Endpoints

### Core Tele MANAS Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/TELEMANAS/rest/v0/getCallCount` | Get total calls count |
| `GET` | `/TELEMANAS/rest/v0/getTMCcount/TMC` | Get TMC, MI, RCC counts |
| `GET` | `/TELEMANAS/rest/v0/getDashboardData` | Get all dashboard data |

### Testing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/TELEMANAS/rest/v0/simulateError` | Simulate API errors |
| `GET` | `/health` | Health check |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/updateData` | Update mock data |
| `GET` | `/admin/data` | Get current mock data |

## 🧪 Testing the API

### Test Basic Endpoints

```bash
# Get total calls count
curl http://localhost:3000/TELEMANAS/rest/v0/getCallCount

# Get TMC counts
curl http://localhost:3000/TELEMANAS/rest/v0/getTMCcount/TMC

# Get all dashboard data
curl http://localhost:3000/TELEMANAS/rest/v0/getDashboardData
```

### Test Error Simulation

```bash
# Simulate API errors (random error types)
curl http://localhost:3000/TELEMANAS/rest/v0/simulateError
```

### Update Mock Data

```bash
# Update mock data
curl -X POST http://localhost:3000/admin/updateData \
  -H "Content-Type: application/json" \
  -d '{
    "totalCalls": "3000000",
    "teleManasCells": "60",
    "mentoringInstitutes": "25",
    "regionalCoordinatingCenters": "6"
  }'
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

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)

### Mock Data

The server starts with realistic mock data that simulates the real Tele MANAS dashboard:

- **Total Calls**: 2,821,889 (with time-based variations)
- **Tele MANAS Cells**: 53
- **Mentoring Institutes**: 23
- **Regional Coordinating Centers**: 5

## 🎯 Use Cases

1. **Development Testing**: Test your Tele MANAS scraper without hitting the real API
2. **Error Handling**: Test error scenarios with the `/simulateError` endpoint
3. **Load Testing**: Test your application's behavior with consistent API responses
4. **Offline Development**: Develop and test without internet connectivity

## 🛠️ Integration with Tele MANAS Scraper

To use this mock API with your Tele MANAS scraper:

1. Start this mock API server
2. Update your scraper's environment variables:
   ```bash
   TELEMANAS_DASHBOARD_URL=http://localhost:3000
   ```
3. Test your scraper against the mock API

## 📝 Notes

- The server simulates realistic response times (100-300ms)
- Mock data updates every 5 minutes with slight variations
- CORS is configured to allow requests from Tele MANAS domains
- All endpoints include proper error handling and logging
- The server gracefully handles shutdown signals

## 🚀 Production Considerations

This is a **development/testing tool only**. For production use:

- Add authentication/authorization
- Implement rate limiting
- Add request validation
- Use proper logging
- Add monitoring and metrics
