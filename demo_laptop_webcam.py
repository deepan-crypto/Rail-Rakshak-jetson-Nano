"""
demo_laptop_webcam.py — Rail Rakshak Live Feed Demo (Laptop Webcam)
===================================================================
Uses YOLOv5 with best.pt model for real-time animal/hazard detection.

Requirements:
    pip install opencv-python requests torch torchvision

Run:
    python demo_laptop_webcam.py

What it does:
  1. Loads YOLOv5 model (best.pt) for real detection
  2. Wakes the Render backend (handles Render free-tier cold-start delay)
  3. Opens your laptop webcam (camera index 0)
  4. Runs detection on each frame and sends results to backend
  5. Shows a local preview window with bounding boxes — press Q to quit
"""

import cv2
import sys
import time
import base64
import requests
import torch
from datetime import datetime

# ─── CONFIG — ONLY EDIT THESE ────────────────────────────────────────────────
BACKEND_URL  = "https://rail-rakshak-jetson-nano.onrender.com/api/telemetry"  # ← REPLACE THIS
HEALTH_URL   = BACKEND_URL.replace("/api/telemetry", "/health")
MODEL_PATH   = "model/best.pt"  # Path to YOLOv5 weights
CONFIDENCE   = 0.4       # Detection confidence threshold
GPS_LAT      = 28.6139   # fake GPS (change if you like)
GPS_LON      = 77.2090
CAMERA_INDEX = 0         # 0 = built-in webcam; try 1 if it doesn't open
SEND_EVERY_N = 2         # send every 2nd frame (saves bandwidth on wifi)
JPEG_QUALITY = 60        # 0-100, lower = smaller payload
# ─────────────────────────────────────────────────────────────────────────────


# ── Helpers ───────────────────────────────────────────────────────────────────

def encode_frame(frame):
    """Encode an OpenCV frame to a base64 data-URI string."""
    _, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    b64 = base64.b64encode(buf).decode('utf-8')
    return "data:image/jpeg;base64," + b64


def wake_backend(max_wait=45):
    """Ping /health until it responds — handles Render cold-start delay."""
    print(f"🔔 Waking backend at {HEALTH_URL} ...")
    start = time.time()
    while time.time() - start < max_wait:
        try:
            r = requests.get(HEALTH_URL, timeout=10)
            if r.status_code == 200:
                print(f"✅ Backend awake! ({time.time()-start:.1f}s)")
                return True
        except Exception:
            pass
        print(f"   ⏳ Still waking... ({int(time.time()-start)}s elapsed)")
        time.sleep(3)
    print(f"❌ Backend did not respond in {max_wait}s — check your BACKEND_URL.")
    return False


def send_frame(frame, hazards=None):
    """POST a single frame + optional hazard list to the backend."""
    if hazards is None:
        hazards = []
    payload = {
        "timestamp":    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "gps_location": {"lat": GPS_LAT, "lon": GPS_LON},
        "hazards":      hazards,
        "image_stream": encode_frame(frame)
    }
    try:
        r = requests.post(BACKEND_URL, json=payload,
                          timeout=15,
                          headers={"Content-Type": "application/json"})
        return r.status_code == 200, r.status_code
    except requests.exceptions.Timeout:
        return False, "timeout"
    except Exception as e:
        return False, str(e)


# ── Main ──────────────────────────────────────────────────────────────────────

def load_model():
    """Load YOLOv5 model from best.pt"""
    print("🔍 Loading YOLOv5 model...")
    model = torch.hub.load('ultralytics/yolov5', 'custom',
                           path=MODEL_PATH, force_reload=False)
    model.conf = CONFIDENCE
    
    # Rename class labels from pothole to Track Crack
    for idx, name in model.names.items():
        if name.lower() == "pothole":
            model.names[idx] = "Track Crack"
    
    print("✅ Model loaded.")
    return model


# Map model class names to display names
LABEL_MAP = {
    "pothole": "Track Crack",
    "Pothole": "Track Crack",
}


def parse_detections(results):
    """Convert YOLO results to hazards list for backend."""
    hazards = []
    detections = results.xyxy[0]  # [x1, y1, x2, y2, conf, class]
    names = results.names
    
    for det in detections:
        x1, y1, x2, y2, conf, cls = det.tolist()
        original_label = names[int(cls)]
        label = LABEL_MAP.get(original_label, original_label)
        hazards.append({
            "type": label,
            "confidence": round(conf * 100, 1),
            "xmin": int(x1),
            "ymin": int(y1),
            "xmax": int(x2),
            "ymax": int(y2)
        })
    return hazards


def main():
    print("=" * 55)
    print("  Rail Rakshak — Laptop Webcam Demo (Real Detection)")
    print("=" * 55)

    if "your-backend" in BACKEND_URL:
        print("\n⚠️  ERROR: You haven't set BACKEND_URL yet!")
        print("   Edit demo_laptop_webcam.py and replace:")
        print('   BACKEND_URL = "https://your-backend.onrender.com/api/telemetry"')
        print("   with your actual Render backend URL.\n")
        sys.exit(1)

    # Load YOLO model
    model = load_model()

    # Wake Render backend
    wake_backend(max_wait=45)

    # Open webcam
    print(f"\n📷 Opening webcam (index {CAMERA_INDEX})...")
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print(f"❌ Could not open camera {CAMERA_INDEX}.")
        print("   Try changing CAMERA_INDEX to 1 at the top of this file.")
        sys.exit(1)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"✅ Webcam opened: {frame_w}×{frame_h}")
    print("\n🚀 Streaming started with real-time detection.")
    print("   Open your Vercel dashboard and log in.")
    print("   Press  Q  in the preview window to quit.\n")

    frame_count  = 0
    sent_count   = 0
    error_count  = 0
    start_time   = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️  Frame read failed — camera disconnected?")
                break

            frame_count += 1
            elapsed = time.time() - start_time

            # Run YOLO detection
            results = model(frame)
            hazards = parse_detections(results)

            # ── Send to backend every Nth frame ──
            if frame_count % SEND_EVERY_N == 0:
                ok, status = send_frame(frame, hazards)
                if ok:
                    sent_count += 1
                else:
                    error_count += 1
                    print(f"⚠️  Send failed: {status}")

            # ── Draw local preview with detections ──
            display = results.render()[0]  # Frame with YOLO bounding boxes

            # Draw status bar
            det_count = len(hazards)
            bar = (f"Frame {frame_count} | Sent {sent_count} | "
                   f"Err {error_count} | Det {det_count} | {elapsed:.0f}s")
            cv2.rectangle(display, (0, 0), (frame_w, 28), (30, 30, 30), -1)
            cv2.putText(display, bar, (6, 19),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.46, (200, 200, 200), 1)

            # Green dot = no detection, Red dot = detection active
            dot_color = (0, 0, 255) if det_count > 0 else (0, 220, 0)
            cv2.circle(display, (frame_w - 16, 14), 7, dot_color, -1)

            cv2.imshow("Rail Rakshak — Webcam Demo (Q to quit)", display)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\n🛑 Interrupted.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"\n📊 Stats: {frame_count} frames | {sent_count} sent | {error_count} errors")
        print("✅ Demo stopped.")


if __name__ == "__main__":
    main()
