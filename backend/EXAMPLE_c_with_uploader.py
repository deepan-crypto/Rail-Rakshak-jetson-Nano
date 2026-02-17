#!/usr/bin/env python3
"""
EXAMPLE: How to use rail_rakshak_uploader.py in your c.py

Just copy this pattern into your existing c.py!
"""

import cv2
import torch
from rail_rakshak_uploader import TelemetryUploader

# ============================================================
# YOUR EXISTING CODE
# ============================================================

# Load model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
model.to('cuda')

# Open camera
cap = cv2.VideoCapture(0)

# ============================================================
# NEW: Create uploader (1 line!)
# ============================================================
uploader = TelemetryUploader(
    backend_url="http://192.168.1.100:5000/api/telemetry",  # ⭐ Change IP!
    gps_lat=28.6139,        # Your latitude
    gps_lon=77.2090,        # Your longitude
    send_interval=2,        # Send every 2 frames
    jpeg_quality=80,        # Image quality (0-100)
    async_mode=False        # Set True for non-blocking (recommended)
)

# ============================================================
# MAIN LOOP (your existing code)
# ============================================================

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Your YOLOv5 inference
    results = model(frame, size=640)
    
    # ============================================================
    # NEW: Send to backend (1 line!)
    # ============================================================
    uploader.send(frame, results)
    
    # Your existing visualization
    annotated = results.render()[0]
    cv2.imshow('YOLOv5', annotated)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()

# ============================================================
# OPTIONAL: Print statistics at end
# ============================================================
print("\n" + "="*50)
uploader.print_stats()
print("="*50)
