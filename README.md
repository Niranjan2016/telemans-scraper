# Tele MANAS API Proxy

A simple Node.js proxy server that forwards requests to Tele MANAS APIs with proper headers.

## 🚀 Features

- **Simple API Proxy** - Forwards requests to Tele MANAS APIs
- **Exact Headers** - Uses the exact headers from your curl commands
- **Two Endpoints** - Only exposes the essential endpoints you need
- **Error Handling** - Proper error handling and logging

## 📁 Project Structure

```
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## 📖 Usage

### Available Endpoints

- `GET /getCallCount` - Get total calls count from Tele MANAS API
- `GET /getTMCCount` - Get TMC organization data from Tele MANAS API  
- `GET /health` - Health check

### Example Requests

```bash
# Get call count
curl http://localhost:3000/getCallCount

# Get TMC count
curl http://localhost:3000/getTMCCount

# Health check
curl http://localhost:3000/health
```

## 🔧 Configuration

The server uses the exact headers from your curl commands:

- **getCallCount**: `https://telemanas.mohfw.gov.in/TELEMANAS/rest/v0/getCallCount`
- **getTMCCount**: `https://telemanas.mohfw.gov.in/TELEMANAS/rest/v0/getOrg/TMC`

## 🚨 Error Handling

- **Timeout**: 10 second timeout for all requests
- **SSL**: Disabled SSL verification for development
- **Logging**: Console logging for all requests and errors
- **Status Codes**: Proper HTTP status codes returned

## 📊 Response Format

### getCallCount Response
```json
{
  "Total_Calls": "2821889"
}
```

### getTMCCount Response
```json
{
  "TMC": "53",
  "MI": "23", 
  "RCC": "5"
}
```

## 🧪 Testing

```bash
# Start the server
npm start

# Test endpoints
curl http://localhost:3000/getCallCount
curl http://localhost:3000/getTMCCount
```

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This is a simple proxy server that forwards requests to Tele MANAS APIs with the exact headers you specified. No complex logic, no mock data, just clean API forwarding.