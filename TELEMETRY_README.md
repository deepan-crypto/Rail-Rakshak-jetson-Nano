# 🚀 Rail Rakshak - Real-Time Edge AI Telemetry Integration

Complete integration of NVIDIA Jetson Orin Nano YOLOv5 detection streaming with live dashcam visualization and hazard logging.

## 📋 Quick Start

### 1. Install Dependencies
```bash
npm run install  # Or manually: cd backend && npm install && cd ../frontend && npm install
```

### 2. Start Backend Server
```bash
cd backend
npm start
# 🚀 Server running on http://localhost:5000
# 📡 WebSocket (Socket.io) Server running on ws://localhost:5000
```

### 3. Start Frontend
In a new terminal:
```bash
cd frontend
npm run dev
# ➜ Local: http://localhost:5173
```

### 4. Integrate LiveDashcam Component
In your React app (e.g., `frontend/src/App.jsx`):

```jsx
import LiveDashcam from './components/LiveDashcam';

function App() {
  return <LiveDashcam />;
}

export default App;
```

### 5. Test with Sample Data
```bash
cd backend
npm run test:telemetry        # Single test message
npm run test:stream           # Continuous stream for 30s
npm run test:stream 60        # Continuous stream for 60s
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│         NVIDIA Jetson Orin Nano (Edge Device)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  YOLOv5 Running on RC Car                        │   │
│  │  - Road Hazard Detection (Pothole, Crack, etc)  │   │
│  │  - Real-time inference on video stream          │   │
│  └──────────────────────────────────┬───────────────┘   │
└─────────────────────────────────────┼───────────────────┘
                                      │
                    HTTP POST /api/telemetry
         (JSON Payload + Base64 Image)
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  /api/telemetry (POST)                           │   │
│  │  - Receives detection payload from Jetson       │   │
│  │  - Validates & stores in MongoDB                │   │
│  │  - Broadcasts via WebSocket in real-time        │   │
│  └──────────────┬──────────────────────────────────┘   │
│                 │ Socket.io WebSocket                   │
│  ┌──────────────▼──────────────────────────────────┐   │
│  │  MongoDB (Telemetry Storage)                    │   │
│  │  - 1-hour TTL on records                        │   │
│  │  - Query by hazard type, location, confidence  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────────┘
                  │ Real-time WebSocket Broadcast
                  │ (telemetry-update event)
                  ▼
┌─────────────────────────────────────────────────────────┐
│     React Frontend (Vercel Deployment Ready)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  LiveDashcam Component                           │   │
│  │  ┌────────────────────┐  ┌──────────────────┐   │   │
│  │  │   Live Video       │  │  Detection Log   │   │   │
│  │  │   Feed (Base64)    │  │  - Timestamp     │   │   │
│  │  │   + Status Info    │  │  - Hazard Type   │   │   │
│  │  │                    │  │  - GPS Location  │   │   │
│  │  │                    │  │  - Confidence %  │   │   │
│  │  └────────────────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Example

### From Jetson to Live Dashboard (< 1 second)

```
1. Jetson detects pothole in frame
   ↓
2. Encodes frame as Base64 JPEG
   ↓
3. Creates JSON payload with detection metadata + Base64 image
   ↓
4. HTTP POST to Backend: /api/telemetry
   ↓
5. Backend validates & saves to MongoDB
   ↓
6. Backend broadcasts via Socket.io: 'telemetry-update' event
   ↓
7. React component receives event (< 50ms latency)
   ↓
8. Updates live image, detection log, GPS overlay in real-time
   ↓
✅ User sees pothole detection + location + confidence on dashboard
```

## 🎯 Features

### Backend
✅ **Real-Time WebSocket Broadcasting** - Sub-second latency  
✅ **Large Payload Support** - Up to 10MB (for high-res images)  
✅ **MongoDB Persistence** - Auto-TTL cleanup after 1 hour  
✅ **JWT Authentication** - Secure API endpoints  
✅ **CORS Configuration** - Supports Vercel & localhost  
✅ **Error Handling** - Comprehensive logging & error responses  

### Frontend
✅ **Live Video Feed** - Real-time Base64 image rendering  
✅ **Detection Dashboard** - GPS, timestamp, hazard type, confidence  
✅ **Scrolling Log** - Up to 50 recent detections  
✅ **Dark-Mode UI** - Automotive telemetry theme with Tailwind CSS  
✅ **Connection Status** - Visual indicators (connected/disconnected)  
✅ **Responsive Design** - Mobile & desktop optimized  
✅ **Debug Panel** - Connection troubleshooting info  

## 🔌 Jetson Orin Nano Integration Example

### Python Script (jetson_client.py)
See [backend/TELEMETRY_SETUP.md](backend/TELEMETRY_SETUP.md#-jetson-orin-nano-integration) for complete example.

Basic workflow:
```python
from yolov5_runner import detect_hazards
import requests
import cv2
import base64
from datetime import datetime

# Your YOLO inference
detections = detect_hazards(frame)

# Format for backend
payload = {
    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "gps_location": {"lat": 28.6139, "lon": 77.2090},
    "hazards": [
        {
            "class": 0,
            "name": "Pothole",
            "confidence": 0.92,
            "xmin": 120, "ymin": 40,
            "xmax": 200, "ymax": 150
        }
    ],
    "image_stream": "data:image/jpeg;base64," + base64.b64encode(jpeg_bytes).decode()
}

# Send to backend
requests.post('http://<backend-ip>:5000/api/telemetry', json=payload)
```

## 📡 API Endpoints

### POST /api/telemetry
Receive detection data from Jetson.
```bash
curl -X POST http://localhost:5000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2026-02-17 14:05:00",
    "gps_location": {"lat": 28.6139, "lon": 77.2090},
    "hazards": [{"class": 0, "name": "Pothole", "confidence": 0.92, "xmin": 120, "ymin": 40, "xmax": 200, "ymax": 150}],
    "image_stream": "data:image/jpeg;base64,..."
  }'
```

### GET /api/telemetry/recent?limit=10
Get recent telemetry records (requires JWT auth).
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/telemetry/recent?limit=10
```

### GET /api/telemetry/hazards
Get only detection records with hazards (requires JWT auth).
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/telemetry/hazards
```

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `telemetry-update` | Server → Client | Real-time broadcast of detection data |
| `connection-status` | Server → Client | Connection confirmation |
| `latest-telemetry` | Server → Client | Response to telemetry request |
| `request-latest-telemetry` | Client → Server | Request latest data snapshot |

## 🔑 Default Credentials (for login)
```
Username    | Password
------------|-------------------
admin       | admin123
controller  | railsafe2024
supervisor  | track_secure
analyst     | data_insight
guest       | view_only
```

## 🌍 Vercel Deployment

### Frontend
1. Connect repo to Vercel
2. Set environment variable:
   ```
   VITE_SOCKET_URL=https://your-backend-domain.com
   ```
3. Deploy

### Backend (e.g., Railway or Render)
1. Ensure MongoDB Atlas URI is set in `.env`
2. Update CORS in `server.js` to allow Vercel domain
3. Deploy and note the URL

## 📦 File Structure
```
rail-rakshak/
├── backend/
│   ├── server.js                 # Main server with telemetry endpoints
│   ├── package.json              # Backend dependencies
│   ├── TELEMETRY_SETUP.md        # Detailed integration guide
│   └── test-telemetry.js         # Testing tool
├── frontend/
│   ├── src/
│   │   └── components/
│   │       └── LiveDashcam.jsx   # New telemetry dashboard component
│   ├── package.json              # Updated with socket.io-client
│   └── vite.config.js
├── model/
│   └── best.pt                   # YOLOv5 weights
├── .env                          # Environment variables
└── install.js                    # Installation helper
```

## 🧪 Testing

### Single Telemetry Test
```bash
cd backend
npm run test:telemetry
```
Sends one sample detection with a fake image.

### Stream Simulation (30 seconds)
```bash
npm run test:stream
```
Continuously sends random detections to simulate live Jetson data.

### Custom Duration
```bash
npm run test:stream 60  # 60 second stream
```

## 🐛 Troubleshooting

### "Cannot find module 'socket.io'" 
```bash
cd backend && npm install
```

### WebSocket connection fails
1. Ensure backend is running: `npm start`
2. Check backend logs for errors
3. Verify CORS allowed origins in `server.js`

### "ECONNREFUSED" in test script
Backend must be running at `http://localhost:5000`. Start it in a separate terminal.

### MongoDB connection error
```bash
# Check if MongoDB is running
mongod

# Or use MongoDB Atlas
# Update MONGO_URI in .env to your Atlas connection string
```

### Image not displaying in dashboard
- Verify Base64 string starts with `data:image/jpeg;base64,`
- Check browser console DevTools for decoding errors
- Ensure payload size is < 10MB

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [YOLOv5 on Jetson](https://github.com/ultralytics/yolov5/wiki/Jetson)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Hooks Reference](https://react.dev/reference/react/hooks)

## 🤝 Support

For issues or questions:
1. Check the logs in the terminal where the server is running
2. Review [backend/TELEMETRY_SETUP.md](backend/TELEMETRY_SETUP.md)
3. Test with `npm run test:telemetry` to isolate issues
4. Check browser console (F12 → Console tab)

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
