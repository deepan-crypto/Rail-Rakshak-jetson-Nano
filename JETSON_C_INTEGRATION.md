# 🚀 Jetson Integration: Connecting c.py to Backend

## Overview
Your `c.py` runs YOLOv5 on live USB/CSI camera stream. You need to extract detections and send them to the backend API.

---

## Option A: Minimal Changes to c.py (RECOMMENDED)

Add these imports and function to your existing `c.py`:

```python
import requests
import base64
import cv2
from datetime import datetime
import json

# ============================================================
# ADD THESE TO YOUR c.py
# ============================================================

# Configuration - CHANGE THESE FOR YOUR SETUP
BACKEND_URL = "http://192.168.1.100:5000/api/telemetry"  # Change IP to your backend
GPS_LATITUDE = 28.6139   # Your location latitude
GPS_LONGITUDE = 77.2090  # Your location longitude
SEND_INTERVAL = 2  # Send every 2 frames (adjust for frequency)

frame_counter = 0

def encode_frame_to_base64(frame):
    """Convert OpenCV frame to Base64 JPEG"""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_to_backend(frame, detections):
    """
    Send detection data to Rail Rakshak backend
    
    Args:
        frame: OpenCV image frame (BGR format)
        detections: YOLOv5 results object or list of detections
    """
    global frame_counter
    frame_counter += 1
    
    # Only send every N frames to reduce bandwidth
    if frame_counter % SEND_INTERVAL != 0:
        return
    
    try:
        # Parse YOLOv5 detections into required format
        hazards = []
        
        # If detections is a YOLOv5 Results object:
        if hasattr(detections, 'xyxy'):  # YOLOv5 detection object
            for det in detections.xyxy[0]:  # xyxy[0] contains detections in frame 0
                x1, y1, x2, y2, conf, cls = det.tolist()
                
                hazard = {
                    "class": int(cls),
                    "name": detections.names[int(cls)],  # Get class name
                    "confidence": float(conf),
                    "xmin": int(x1),
                    "ymin": int(y1),
                    "xmax": int(x2),
                    "ymax": int(y2)
                }
                hazards.append(hazard)
        
        # Prepare payload
        payload = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "gps_location": {
                "lat": GPS_LATITUDE,
                "lon": GPS_LONGITUDE
            },
            "hazards": hazards,
            "image_stream": encode_frame_to_base64(frame)
        }
        
        # Send HTTP POST
        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=5,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print(f"✅ Sent: {len(hazards)} hazards detected")
        else:
            print(f"⚠️  Status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend not reachable: {BACKEND_URL}")
    except Exception as e:
        print(f"❌ Error: {e}")

# ============================================================
# IN YOUR MAIN INFERENCE LOOP:
# ============================================================
# After you get results from YOLOv5, add this:

# results = model(frame)  # Your existing YOLOv5 inference
# send_to_backend(frame, results)  # ADD THIS LINE

```

---

## Typical c.py Integration Example

Here's a complete minimal example of how it fits into a typical YOLOv5 setup:

```python
import cv2
import torch
import requests
import base64
from datetime import datetime

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
model.to('cuda')  # Jetson GPU acceleration

# Configuration
BACKEND_URL = "http://192.168.1.100:5000/api/telemetry"
GPS_LATITUDE = 28.6139
GPS_LONGITUDE = 77.2090
SEND_INTERVAL = 2

# Open camera (0 = default USB camera, or adjust for CSI)
cap = cv2.VideoCapture(0)
frame_counter = 0

def encode_frame_to_base64(frame):
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_to_backend(frame, results):
    global frame_counter
    frame_counter += 1
    
    if frame_counter % SEND_INTERVAL != 0:
        return
    
    try:
        hazards = []
        for det in results.xyxy[0]:
            x1, y1, x2, y2, conf, cls = det.tolist()
            hazards.append({
                "class": int(cls),
                "name": results.names[int(cls)],
                "confidence": float(conf),
                "xmin": int(x1), "ymin": int(y1),
                "xmax": int(x2), "ymax": int(y2)
            })
        
        payload = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "gps_location": {"lat": GPS_LATITUDE, "lon": GPS_LONGITUDE},
            "hazards": hazards,
            "image_stream": encode_frame_to_base64(frame)
        }
        
        response = requests.post(BACKEND_URL, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✅ Sent: {len(hazards)} hazards")
    except Exception as e:
        print(f"❌ Error: {e}")

# Main loop
while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # YOLOv5 inference
    results = model(frame, size=640)
    
    # SEND TO BACKEND
    send_to_backend(frame, results)
    
    # Your existing visualization (optional)
    annotated_frame = results.render()[0]
    
    # Display results
    cv2.imshow('YOLOv5 Detection', annotated_frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

---

## ✅ What You Need to Change in c.py

### 1. **Add Required Imports** (at top)
```python
import requests
import base64
from datetime import datetime
```

### 2. **Add Configuration** (near top, after imports)
```python
BACKEND_URL = "http://192.168.1.100:5000/api/telemetry"  # ⭐ Change this IP!
GPS_LATITUDE = 28.6139
GPS_LONGITUDE = 77.2090
SEND_INTERVAL = 2  # Send every 2 frames
```

### 3. **Add Helper Functions**
```python
def encode_frame_to_base64(frame):
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_to_backend(frame, results):
    # [Copy from example above]
```

### 4. **Call in Main Loop** (after inference)
```python
results = model(frame)  # Your existing code
send_to_backend(frame, results)  # ADD THIS LINE
```

---

## 🔧 Finding Your BACKEND_URL

### On Jetson, run this to find your backend IP:
```bash
# If backend is on same local network
ping 192.168.1.100  # Change to your router's subnet

# Or ask the backend machine its IP:
# On backend machine:
hostname -I

# Then use that IP, e.g.:
BACKEND_URL = "http://192.168.1.105:5000/api/telemetry"
```

### Or if backend is on Raspberry Pi/Laptop on same network:
```bash
# Find it via network scan
nmap -sn 192.168.1.0/24

# Look for the device running your backend
```

---

## 📍 GPS Location Setup

**Option 1: Hard-coded** (simple, for fixed route)
```python
GPS_LATITUDE = 28.6139   # Your test area
GPS_LONGITUDE = 77.2090
```

**Option 2: With GPS module** (for mobile RC car)
```python
import gps
gpsd = gps.gps(mode=gps.WATCH_ENABLE)

def get_gps():
    gpsd.next()
    return {
        "lat": gpsd.fix.latitude,
        "lon": gpsd.fix.longitude
    }

# In send_to_backend:
gps_location = get_gps()
payload["gps_location"] = gps_location
```

**Option 3: Simulate moving** (for testing)
```python
import random
GPS_LATITUDE = 28.6139 + random.random() * 0.001
GPS_LONGITUDE = 77.2090 + random.random() * 0.001
```

---

## 🎥 Camera Configuration

### USB Webcam (default)
```python
cap = cv2.VideoCapture(0)  # /dev/video0
```

### CSI Camera (Jetson native)
```python
import subprocess

# Install GStreamer support first:
# sudo apt-get install libcamera-tools opencv-python

cap = cv2.VideoCapture("nvarguscamerasrc ! video/x-raw(memory:NVMM),width=1280,height=720,framerate=30/1 ! nvvidconv ! video/x-raw,format=BGRx ! appsink")
```

### Multiple USB Cameras
```python
cap = cv2.VideoCapture(0)  # Primary
cap2 = cv2.VideoCapture(1) # Secondary
```

---

## ⚙️ Performance Tuning

### Reduce Bandwidth (quality vs size)
```python
# Lower quality = smaller payload, faster transmission
_, buffer = cv2.imencode('.jpg', frame, 
    [cv2.IMWRITE_JPEG_QUALITY, 60])  # 0-100, default 95

# Or resize before encoding
frame_small = cv2.resize(frame, (640, 480))
_, buffer = cv2.imencode('.jpg', frame_small)
```

### Send Less Frequently
```python
SEND_INTERVAL = 5  # Send every 5th frame (30fps → 6fps data)
```

### Skip Empty Detections
```python
if len(results.xyxy[0]) == 0:  # No detections
    return  # Don't send
```

### Example: Optimized for Jetson
```python
SEND_INTERVAL = 3          # Every 3 frames
JPEG_QUALITY = 70          # Lower quality
INFERENCE_SIZE = (416, 416) # Smaller model input
```

---

## 🧪 Testing Your Modified c.py

### 1. **Test Connection**
```bash
curl http://192.168.1.100:5000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"test","gps_location":{"lat":0,"lon":0},"hazards":[],"image_stream":"data:image/jpeg;base64,/9j..."}'

# Should return: {"success": true}
```

### 2. **Run with Debug Output**
```bash
python c.py 2>&1 | tee jetson_output.log
```

Look for:
```
✅ Sent: 2 hazards detected
✅ Sent: 1 hazards detected
```

### 3. **Watch Dashboard in Real-Time**
While c.py is running, open http://localhost:5173 on your dashboard machine.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` | Backend IP wrong, use `hostname -I` on backend machine |
| `No module named requests` | `pip install requests` on Jetson |
| `Timeout` | Backend might be down, test: `curl http://ip:5000` |
| `Large image` | Reduce JPEG_QUALITY or frame size |
| `No hazards sending` | Add `print()` to verify detections: `print(results.xyxy[0])` |
| `Frame encoding error` | Frame might be None, check: `if frame is None: return` |

---

## 📦 Required Packages

```bash
# On your Jetson, install:
pip install requests opencv-python

# Already have these for YOLOv5:
# torch, torchvision, numpy
```

---

## 🎬 Complete Working Example

Save this as `c_integrated.py`:

```python
#!/usr/bin/env python3
"""
YOLOv5 Detection + Rail Rakshak Backend Integration
Runs on Jetson Orin Nano with USB/CSI camera
"""

import cv2
import torch
import requests
import base64
from datetime import datetime
import time

# ============================================================
# CONFIGURATION
# ============================================================
BACKEND_URL = "http://192.168.1.100:5000/api/telemetry"  # ⭐ Change to your backend IP
GPS_LATITUDE = 28.6139
GPS_LONGITUDE = 77.2090
SEND_INTERVAL = 2      # Send every 2 frames
JPEG_QUALITY = 80      # 0-100
CAMERA_INDEX = 0       # 0 for USB, or CSI string
MODEL_PATH = "best.pt" # Your YOLOv5 model

# ============================================================
# INITIALIZATION
# ============================================================
print("🚀 Loading YOLOv5 model...")
model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH)
model.to('cuda')  # GPU acceleration on Jetson

print("📹 Opening camera...")
cap = cv2.VideoCapture(CAMERA_INDEX)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)

frame_counter = 0
start_time = time.time()

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def encode_frame(frame):
    """Frame to Base64 JPEG"""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_detections(frame, results):
    """Send to backend"""
    global frame_counter
    frame_counter += 1
    
    if frame_counter % SEND_INTERVAL != 0:
        return
    
    try:
        # Parse detections
        hazards = []
        if len(results.xyxy[0]) > 0:
            for det in results.xyxy[0]:
                x1, y1, x2, y2, conf, cls = det.tolist()
                hazards.append({
                    "class": int(cls),
                    "name": results.names[int(cls)],
                    "confidence": float(conf),
                    "xmin": int(x1), "ymin": int(y1),
                    "xmax": int(x2), "ymax": int(y2)
                })
        
        # Send
        payload = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "gps_location": {"lat": GPS_LATITUDE, "lon": GPS_LONGITUDE},
            "hazards": hazards,
            "image_stream": encode_frame(frame)
        }
        
        r = requests.post(BACKEND_URL, json=payload, timeout=5)
        if r.status_code == 200:
            elapsed = time.time() - start_time
            print(f"[{elapsed:.1f}s] ✅ {len(hazards)} hazards → dashboard")
        else:
            print(f"⚠️ Backend returned {r.status_code}")
            
    except requests.ConnectionError:
        print(f"❌ Can't reach {BACKEND_URL}")
    except Exception as e:
        print(f"❌ Error: {e}")

# ============================================================
# MAIN LOOP
# ============================================================
print("\n🎯 Running inference... Press 'q' to quit\n")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to read frame")
            break
        
        # Inference
        results = model(frame, size=640)
        
        # Send to backend
        send_detections(frame, results)
        
        # Display locally (optional)
        annotated = results.render()[0]
        cv2.imshow('Jetson YOLOv5', annotated)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("\n⏹️ Stopped by user")

finally:
    print("🔌 Cleaning up...")
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Done")
```

Run it:
```bash
python c_integrated.py
```

---

## 🎯 Summary

1. **Copy the 3 functions** to your c.py (encode, send, plus imports & config)
2. **Change BACKEND_URL** to your backend IP
3. **Add one line** in your inference loop: `send_to_backend(frame, results)`
4. **Install requests**: `pip install requests`
5. **Run it**: `python c.py`
6. **Watch dashboard**: Open http://localhost:5173

**That's it!** Your Jetson is now streaming detections to your dashboard. 🚀

---

**Questions?** Check [backend/TELEMETRY_SETUP.md](../backend/TELEMETRY_SETUP.md) for more details.
