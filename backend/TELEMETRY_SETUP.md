# Real-Time Edge AI Telemetry Integration Guide

## Overview
This backend now supports real-time streaming of YOLO detection data from NVIDIA Jetson Orin Nano devices via HTTP POST requests and broadcasts to connected React clients via WebSocket (Socket.io).

## 📦 Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```

The server will start on `http://localhost:5000` with WebSocket support.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.

## 🔌 API Endpoints

### 1. **POST /api/telemetry** - Receive Jetson Telemetry
**Purpose**: Receive YOLO detection data from Jetson Orin Nano and broadcast to all connected clients.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body** (Exact format from Jetson):
```json
{
  "timestamp": "2026-02-17 14:05:00",
  "gps_location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "hazards": [
    {
      "class": 0,
      "name": "Pothole",
      "confidence": 0.92,
      "xmin": 120,
      "ymin": 40,
      "xmax": 200,
      "ymax": 150
    }
  ],
  "image_stream": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Telemetry received and broadcasted",
  "hazardCount": 1
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2026-02-17 14:05:00",
    "gps_location": {"lat": 28.6139, "lon": 77.2090},
    "hazards": [{"class": 0, "name": "Pothole", "confidence": 0.92, "xmin": 120, "ymin": 40, "xmax": 200, "ymax": 150}],
    "image_stream": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

### 2. **GET /api/telemetry/recent** - Get Recent Telemetry
**Purpose**: Retrieve recent telemetry records from MongoDB.

**Query Parameters**:
- `limit` (optional): Number of records to return (default: 10, max: 100)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
[
  {
    "_id": "...",
    "timestamp": "2026-02-17 14:05:00",
    "gps_location": {"lat": 28.6139, "lon": 77.2090},
    "hazards": [...],
    "image_stream": "...",
    "createdAt": "2026-02-17T14:05:00.000Z"
  }
]
```

### 3. **GET /api/telemetry/hazards** - Get Hazard Detections Only
**Purpose**: Retrieve only records where hazards were detected.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**: Same as `/api/telemetry/recent` but filtered to hazard detections only.

## 📡 WebSocket Events

### Client → Server
- **`request-latest-telemetry`**: Request the most recent telemetry snapshot
  ```javascript
  socket.emit('request-latest-telemetry');
  ```

### Server → Client
- **`telemetry-update`**: Real-time telemetry broadcast (auto-emitted when POST /api/telemetry is called)
  ```javascript
  socket.on('telemetry-update', (data) => {
    console.log(data); // Contains timestamp, gps_location, hazards, image_stream
  });
  ```

- **`connection-status`**: Connection confirmation
  ```javascript
  socket.on('connection-status', (data) => {
    console.log(data.clientId, data.status);
  });
  ```

- **`latest-telemetry`**: Response to `request-latest-telemetry`
  ```javascript
  socket.on('latest-telemetry', (data) => {
    console.log(data);
  });
  ```

## 🚀 Jetson Orin Nano Integration

### Sample Python Script for Jetson (jetson_client.py)

```python
import requests
import cv2
import base64
import json
from datetime import datetime
from pathlib import Path

# Configuration
BACKEND_URL = "http://<YOUR_BACKEND_IP>:5000/api/telemetry"
GPS_LATITUDE = 28.6139
GPS_LONGITUDE = 77.2090

def encode_image_to_base64(image):
    """Encode OpenCV image to base64"""
    _, buffer = cv2.imencode('.jpg', image)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_telemetry(frame, detections):
    """
    Send telemetry data to the backend
    
    Args:
        frame: OpenCV image frame
        detections: List of YOLO detections
            [{
                'class': int,
                'name': str,
                'confidence': float (0-1),
                'xmin': int,
                'ymin': int,
                'xmax': int,
                'ymax': int
            }]
    """
    try:
        payload = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "gps_location": {
                "lat": GPS_LATITUDE,
                "lon": GPS_LONGITUDE
            },
            "hazards": detections,
            "image_stream": encode_image_to_base64(frame)
        }
        
        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print(f"✅ Telemetry sent: {len(detections)} hazards detected")
        else:
            print(f"❌ Error sending telemetry: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection error: {e}")

def yolo_detection_callback(frame, results):
    """
    This gets called by your YOLO detection pipeline
    Convert YOLO results to the required format
    """
    detections = []
    
    # Parse YOLO results (adapt based on your YOLOv5 output format)
    for result in results:
        detections.append({
            "class": int(result['class_id']),
            "name": result['class_name'],  # e.g., "Pothole", "Crack"
            "confidence": float(result['confidence']),
            "xmin": int(result['x1']),
            "ymin": int(result['y1']),
            "xmax": int(result['x2']),
            "ymax": int(result['y2'])
        })
    
    # Send to backend
    send_telemetry(frame, detections)

# Main loop (integrate into your YOLO pipeline)
if __name__ == "__main__":
    cap = cv2.VideoCapture(0)  # Or your video source
    
    # Load YOLOv5 model (your existing setup)
    # model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Your YOLO inference code here
        # results = model(frame)
        # detections = parse_yolo_results(results)
        
        # For demo, create sample detection
        detections = [
            {
                "class": 0,
                "name": "Pothole",
                "confidence": 0.92,
                "xmin": 120,
                "ymin": 40,
                "xmax": 200,
                "ymax": 150
            }
        ]
        
        # Send telemetry
        yolo_detection_callback(frame, detections)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
```

## 📊 MongoDB Persistence

**Collection**: `telemetries`

**Auto-deletion**: Records expire after 1 hour (`TTL index` set to 3600 seconds) to manage storage.

**Query Examples**:
```javascript
// Get all hazard detections from last 24 hours with high confidence
db.telemetries.find({
  hazards: { $ne: [] },
  "hazards.confidence": { $gte: 0.85 },
  createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
}).sort({ createdAt: -1 })
```

## 🔐 Security Considerations

1. **Large Payload Handling**: Backend configured to accept up to 10MB payloads
2. **CORS Configuration**: WebSocket accepts from localhost:5173, localhost:3000, and Vercel domains
3. **JWT Token**: Protected endpoints require authentication
4. **Data Validation**: Fields validated before MongoDB insertion

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### WebSocket connection fails
- Ensure backend is running: `npm start`
- Check CORS configuration in server.js matches your frontend URL
- Browser console should show WebSocket connection attempts

### Image not displaying
- Verify Base64 encoding: Image string must start with `data:image/jpeg;base64,`
- Check browser console for base64 decode errors

### MongoDB connection errors
- Ensure MongoDB is running: `mongod`
- Verify `MONGO_URI` in `.env` file

## 📋 Environment Variables (.env)
```
PORT=5000
JWT_SECRET=rail_rakshak_secure_secret_key_2024
MONGO_URI=mongodb://localhost:27017/rail-rakshak
```

## 🚢 Vercel Deployment

For Vercel deployment of the React frontend:

1. Install `socket.io-client` in frontend dependencies
2. Set environment variable in Vercel:
   ```
   VITE_SOCKET_URL=https://your-backend-domain.com
   ```
3. Ensure backend is deployed (e.g., Railway, Render, Heroku)
4. Update CORS in `server.js` to allow Vercel domain

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintainer**: Rail Rakshak Development Team
