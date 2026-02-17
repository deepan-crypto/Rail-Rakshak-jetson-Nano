# 🎯 Jetson c.py Integration - Complete Summary

## 📋 What You Have vs What You Need

### ✅ You Already Have:
- `c.py` running YOLOv5 on Jetson
- Live USB/CSI camera stream
- YOLOv5 model (best.pt)
- Detection results (class, bbox, confidence)

### 🎁 You Now Get (No Model Changes!):
- ✅ Backend `/api/telemetry` endpoint (ready)
- ✅ WebSocket real-time broadcasting (ready)
- ✅ React dashboard component (ready)
- ✅ Python uploader module (ready)
- ✅ Complete integration examples (ready)

---

## 🚀 Integration Workflow

```
Your Jetson c.py
    ↓
    ├─ Read frame from camera
    ├─ Run YOLOv5 inference → results
    ├─ [NEW] Extract detections from results
    ├─ [NEW] Encode frame as Base64
    ├─ [NEW] Send to backend via HTTP POST
    ↓
Backend Server (Node.js)
    ├─ Validate payload
    ├─ Save to MongoDB
    ├─ Broadcast via WebSocket
    ↓
React Dashboard (Browser)
    ├─ Receive 'telemetry-update'
    ├─ Display live video
    ├─ Show detection log
    ↓
🎉 User sees real-time hazard detection!
```

---

## 📦 3 Ways to Integrate

### OPTION 1️⃣: Easiest (Recommended) - Use Module

**Setup** (2 minutes):
```bash
# On Jetson, copy file:
cp rail_rakshak_uploader.py ~/my_yolo_project/

# Edit c.py:
from rail_rakshak_uploader import TelemetryUploader

uploader = TelemetryUploader(backend_url="http://YOUR_IP:5000/api/telemetry")

# In loop:
uploader.send(frame, results)
```

**Pros**
- ✅ Cleanest code
- ✅ Built-in async support
- ✅ Error handling
- ✅ Statistics tracking

**Code Changes: 3 lines total**

---

### OPTION 2️⃣: Manual - Embed Code

**Setup** (3 minutes):
Add 3 functions directly to existing c.py:
```python
import requests, base64
from datetime import datetime

def encode_frame(frame):
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def send_detections(frame, results):
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
        "image_stream": encode_frame(frame)
    }
    requests.post("http://YOUR_IP:5000/api/telemetry", json=payload, timeout=5)

# In loop:
send_detections(frame, results)
```

**Pros**
- ✅ No external module
- ✅ Full control
- ✅ Easy to debug

**Code Changes: ~30 lines**

---

### OPTION 3️⃣: Minimal - Inline

```python
# One ugly block in your loop:
import requests, base64, cv2
_, buf = cv2.imencode('.jpg', frame); img = "data:image/jpeg;base64," + base64.b64encode(buf[1]).decode()
hazards = [{"class": int(det[5]), "name": results.names[int(det[5])], "confidence": float(det[4]), "xmin": int(det[0]), "ymin": int(det[1]), "xmax": int(det[2]), "ymax": int(det[3])} for det in results.xyxy[0]]
requests.post("http://YOUR_IP:5000/api/telemetry", json={"timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "gps_location": {"lat": 28.6, "lon": 77.2}, "hazards": hazards, "image_stream": img}, timeout=5)
```

**Pros**
- ✅ Minimal code

**Cons**
- ❌ Ugly
- ❌ No error handling

---

## ✅ Step-by-Step Checklist

### Phase 1: Setup Backend (Already Done ✅)
- [x] Backend has Socket.io
- [x] POST /api/telemetry endpoint exists
- [x] MongoDB TTL configured
- [x] CORS enabled
- [x] 10MB payload support

### Phase 2: Setup Frontend (Already Done ✅)
- [x] LiveDashcam component created
- [x] WebSocket client connected
- [x] Real-time rendering works
- [x] Detection log displays

### Phase 3: Integration (YOU DO THIS NOW) 👈

**On Jetson:**
- [ ] Copy `rail_rakshak_uploader.py` to project (or use manual method)
- [ ] Modify `c.py` to import + use uploader
- [ ] Update Backend IP in code
- [ ] Test with `python c.py`

**Verification:**
- [ ] See console output: `✅ Backend reachable`
- [ ] See detections: `✅ 2 hazards → dashboard`
- [ ] Check dashboard: http://localhost:5173 shows live feed
- [ ] See detection log updates

---

## 🔧 Find Your Backend IP

**On the machine running the backend:**
```bash
# Linux/Jetson
hostname -I
# Output: 192.168.1.100

# Windows
ipconfig
# Look for IPv4 Address

# Mac
ifconfig | grep inet
```

**Then use it:**
```python
backend_url="http://192.168.1.100:5000/api/telemetry"  # ← Copy from above
```

---

## 🎯 Common Questions

### Q: Do I need to change my YOLOv5 model?
**A:** No! You use results as-is. Just extract detections and convert format.

### Q: What if my model output is different?
**A:** Adjust the parsing code:
```python
# Standard YOLOv5
for det in results.xyxy[0]:
    x1, y1, x2, y2, conf, cls = det.tolist()

# If different, adjust accordingly
```

### Q: Will it slow down my inference?
**A:** No, especially with `async_mode=True`. Sending happens in background.

### Q: How much bandwidth?
**A:** ~100KB per frame at quality=80. With `send_interval=2`, that's ~1-2 MB/s for 30fps.

### Q: What if backend is slow?
**A:** Use `async_mode=True` and increase `send_interval=5`.

### Q: Can I run both locally and on Jetson?
**A:** Yes! Just point each to correct backend URL.

---

## 🗂️ What You Get in This Integration

```
rail-rakshak/
├── JETSON_QUICK_START.md .............. This summary
├── JETSON_C_INTEGRATION.md ............ Detailed guide with examples
├── backend/
│   ├── rail_rakshak_uploader.py ....... Drop-in module (COPY THIS)
│   ├── EXAMPLE_c_with_uploader.py .... Full example to copy from
│   └── TELEMETRY_SETUP.md ............ API reference
├── frontend/
│   └── src/components/LiveDashcam.jsx . Receives your data
└── QUICK_REFERENCE.md ................ One-page cheat sheet
```

---

## 🚀 Execution Timeline

### Day 1 (Setup)
```bash
# 1. Copy module to Jetson
scp backend/rail_rakshak_uploader.py user@jetson:~/yolo_project/

# 2. Start backend (your laptop)
cd backend && npm start

# 3. Start frontend (your laptop)
cd frontend && npm run dev

# 4. Open dashboard
http://localhost:5173
```

### Day 2 (Integration)
```bash
# 1. Edit c.py (5 minutes)
# Add: from rail_rakshak_uploader import TelemetryUploader
# Add: uploader = TelemetryUploader(...)
# Add: uploader.send(frame, results)

# 2. Run on Jetson
python c.py

# 3. Watch dashboard update in real-time!
```

---

## 💯 Success Indicators

✅ **Backend console shows:**
```
📹 [TELEMETRY RECEIVED] Time: 2026-02-17 14:05:00 | Hazards: 2
   ⚠️  Pothole (Confidence: 92.00%)
   ⚠️  Crack (Confidence: 87.50%)
```

✅ **Dashboard shows:**
- Live video from Jetson camera
- Real-time detection log on right sidebar
- GPS coordinates overlay
- Timestamp
- Detection badges (Pothole, Crack, etc.)

✅ **Jetson console shows:**
```
✅ Backend reachable: http://192.168.1.100:5000/api/telemetry
[0.5s] ✅ 2 hazards → dashboard
[1.2s] ✅ 1 hazards → dashboard
```

---

## 🐛 Troubleshooting Fast

**Issue: "Connection refused"**
- [ ] Backend IP is wrong
- [ ] Backend not running: `npm start` in backend folder

**Issue: Module import fails**
- [ ] Copy `rail_rakshak_uploader.py` to same folder as c.py
- [ ] Check: `ls -la rail_rakshak_uploader.py`

**Issue: No data on dashboard**
- [ ] Check backend console for `[TELEMETRY RECEIVED]`
- [ ] Check Jetson console for `✅ Sent` messages
- [ ] Try test: `cd backend && npm run test:telemetry`

**Issue: Model slower than before**
- [ ] Use `async_mode=True`
- [ ] Increase `send_interval=3`
- [ ] Reduce `jpeg_quality=60`

---

## 📚 Documentation Map

```
START HERE:
JETSON_QUICK_START.md (you are here) ← 5-min overview

DETAILED:
├── JETSON_C_INTEGRATION.md ........... Full integration guide
├── backend/rail_rakshak_uploader.py . Module source code
├── EXAMPLE_c_with_uploader.py ....... Runnable example
└── QUICK_REFERENCE.md ............... Cheat sheet
```

---

## ✨ That's It!

Your model doesn't change. Just add 2-3 lines to c.py and you're streaming live detections to a professional dashboard!

```python
# Your c.py already has this:
results = model(frame)

# Just add this:
from rail_rakshak_uploader import TelemetryUploader
uploader = TelemetryUploader(backend_url="http://YOUR_IP:5000/api/telemetry")
uploader.send(frame, results)

# Done! 🎉
```

---

**Questions?** Check the detailed guides listed above or the code comments in `rail_rakshak_uploader.py`.

**Ready to integrate?** Start with [JETSON_C_INTEGRATION.md](JETSON_C_INTEGRATION.md) or [QUICK_REFERENCE.md](QUICK_REFERENCE.md).
