# 🎯 Quick Integration: c.py → Backend (5 Minutes)

## ⚡ TL;DR - Minimal Steps

### Step 1️⃣: Add to Top of c.py
```python
from rail_rakshak_uploader import TelemetryUploader

uploader = TelemetryUploader(
    backend_url="http://192.168.1.100:5000/api/telemetry",  # ⭐ Change IP
    gps_lat=28.6139,
    gps_lon=77.2090
)
```

### Step 2️⃣: Add ONE Line in Your Loop
```python
while True:
    ret, frame = cap.read()
    results = model(frame)
    
    uploader.send(frame, results)  # ← ADD THIS ONE LINE
    
   
```

### Step 3️⃣: Copy Module to Jetson
```bash
# Copy this file to your Jetson project:
cp rail_rakshak_uploader.py /path/to/your/jetson/project/
```

### Step 4️⃣: Install requests (if not already)
```bash
pip install requests
```

### Step 5️⃣: Run!
```bash
python c.py
```

**That's it!** 🎉

---

## 🔍 Configuration Details

| Setting | Where | What To Change |
|---------|-------|---------|
| Backend IP | `backend_url="http://192.168.1.100:5000/api/telemetry"` | Your backend machine IP |
| GPS Location | `gps_lat=28.6139, gps_lon=77.2090` | Your test location |
| Send Frequency | `send_interval=2` | Lower = more frequent (1=every frame, 5=every 5 frames) |
| Image Quality | `jpeg_quality=80` | 1-100 (higher = bigger file, slower) |
| Async Sending | `async_mode=False` | Set `True` if you want non-blocking |

---

## 🐛 Finding Backend IP

On your **backend machine** (Laptop/PC running the server):
```bash
hostname -I
```

Example output:
```
192.168.1.105
```

Use that IP:
```python
backend_url="http://192.168.1.105:5000/api/telemetry"
```

---

## ✅ How to Know It's Working

### On Jetson Console:
```
✅ Backend reachable: http://192.168.1.100:5000/api/telemetry
[0.5s] ✅ 2 hazards → dashboard
[1.2s] ✅ 1 hazards → dashboard
```

### On Dashboard:
- Opens http://localhost:5173
- See live video feed from Jetson
- See detection log updating in real-time

---

## 🎬 Two Integration Methods

### Method A: Easy (Copy-Paste)
```python
from rail_rakshak_uploader import TelemetryUploader

uploader = TelemetryUploader(backend_url="http://192.168.1.100:5000/api/telemetry")

# In loop:
uploader.send(frame, results)
```

**Pros**: Simplest, non-blocking with async_mode=True  
**Cons**: Need to copy `.py` file

---

### Method B: Manual (If you prefer no dependencies)
Add these 3 things directly to c.py:

**A. Imports:**
```python
import requests
import base64
from datetime import datetime
```

**B. Function:**
```python
def send_to_backend(frame, results):
    try:
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        image_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode()
        
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
            "gps_location": {"lat": 28.6139, "lon": 77.2090},
            "hazards": hazards,
            "image_stream": image_b64
        }
        
        requests.post("http://192.168.1.100:5000/api/telemetry", json=payload, timeout=5)
    except Exception as e:
        print(f"Error: {e}")
```

**C. Call in loop:**
```python
send_to_backend(frame, results)
```

**Pros**: No external module  
**Cons**: Longer code, blocking

---

## 🚀 Advanced: Async Mode (Non-Blocking)

If your inference is slow, use `async_mode=True`:

```python
uploader = TelemetryUploader(
    backend_url="http://192.168.1.100:5000/api/telemetry",
    async_mode=True  # ← Sends in background thread
)
```

Benefits:
- Inference loop doesn't wait for network
- Faster fps on Jetson
- Your `uploader.send()` call returns instantly

---

## 📊 Monitor Sending

```python
# During run:
stats = uploader.get_stats()
print(stats)
# {'frames_processed': 150, 'frames_sent': 50, 'errors': 0, 'success_rate': '100.0%'}

# At end:
uploader.print_stats()
```

---

## 🔊 Debug Output

### Full Output (see everything):
```python
uploader = TelemetryUploader(backend_url="http://...")
```
Shows: `✅ Backend reachable` + `⚠️` for errors

### Silent Mode (production):
Errors still print, but no success messages. This is the default.

---

## 🛑 Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `ConnectionError` | Backend IP wrong. Check with `hostname -I` on backend machine |
| `ModuleNotFoundError: requests` | `pip install requests` on Jetson |
| `Timeout` | Backend too slow, increase timeout: `timeout=10` |
| `Memory error` | Reduce `jpeg_quality=60` or increase `send_interval=5` |
| `Frame is None` | Check camera: `ret` should be True |

---

## 🧪 Pre-Flight Check

Before running c.py on Jetson:

```bash
# 1. Test backend is reachable
ping 192.168.1.100

# 2. Test web API
curl http://192.168.1.100:5000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"test","gps_location":{"lat":0,"lon":0},"hazards":[],"image_stream":"data:image/jpeg;base64,test"}'
# Should return: {"success": true, "message": "Telemetry received and broadcasted", ...}

# 3. Check requests module
python -c "import requests; print('✅ requests OK')"

# 4. Check camera
python -c "import cv2; cap = cv2.VideoCapture(0); ret = cap.read()[0]; print('✅ Camera OK' if ret else '❌ Camera failed')"

# 5. Test module
python -c "from rail_rakshak_uploader import TelemetryUploader; print('✅ Module OK')"
```

All green? You're good to go! 🚀

---

## 📱 For Different Scenarios

### Jetson Running on Battery (Performance-Critical)
```python
uploader = TelemetryUploader(
    backend_url="http://...",
    send_interval=5,        # Every 5 frames (less bandwidth)
    jpeg_quality=60,        # Lower quality
    async_mode=True         # Non-blocking
)
```

### Jetson on Wired Network (Everything)
```python
uploader = TelemetryUploader(
    backend_url="http://...",
    send_interval=1,        # Every frame
    jpeg_quality=95,        # High quality
    async_mode=True         # Still non-blocking
)
```

### Testing/Demo
```python
uploader = TelemetryUploader(
    backend_url="http://...",
    send_interval=2,        # Default
    jpeg_quality=80,        # Default
    async_mode=False        # See errors immediately
)
```

---

## 📚 More Info

See full documentation in:
- [JETSON_C_INTEGRATION.md](JETSON_C_INTEGRATION.md) - Detailed guide
- [backend/TELEMETRY_SETUP.md](backend/TELEMETRY_SETUP.md) - API reference
- [EXAMPLE_c_with_uploader.py](EXAMPLE_c_with_uploader.py) - Full example

---

**Ready?** Copy the 2 files (`rail_rakshak_uploader.py` and your modified `c.py`) to your Jetson and run! 🚀
