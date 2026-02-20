"""
jetson_detection.py — Rail Rakshak Live Detection Script
Run this on the Jetson Nano Orin to start streaming.

This script streams EVERY camera frame to the backend (whether or not a
pothole/crack is detected), so the dashboard always shows a live feed.

Usage:
    python3 jetson_detection.py

Requirements:
    pip install torch torchvision opencv-python requests
    (YOLOv5 installed — see https://github.com/ultralytics/yolov5)
"""

import cv2
import torch
from rail_rakshak_uploader import TelemetryUploader

# ─── CONFIGURATION ───────────────────────────────────────────────────────────
BACKEND_URL  = "https://your-backend.onrender.com/api/telemetry"  # ← your Render URL
MODEL_PATH   = "best.pt"          # Path to your trained YOLOv5 weights
CAMERA_INDEX = 0                  # 0 = first camera (CSI or USB)
GPS_LAT      = 28.6139            # ← Your GPS latitude
GPS_LON      = 77.2090            # ← Your GPS longitude
SEND_EVERY_N = 1                  # 1 = stream every frame; 2 = every 2nd frame, etc.
JPEG_QUALITY = 65                 # Lower = smaller payload, less bandwidth used
# ─────────────────────────────────────────────────────────────────────────────


def main():
    # Step 1: Load YOLOv5 model
    print("🔍 Loading YOLOv5 model...")
    model = torch.hub.load('ultralytics/yolov5', 'custom',
                           path=MODEL_PATH, force_reload=False)
    model.conf = 0.4   # Confidence threshold — adjust as needed
    print("✅ Model loaded.")

    # Step 2: Setup uploader (async so inference loop isn't slowed down)
    uploader = TelemetryUploader(
        backend_url=BACKEND_URL,
        gps_lat=GPS_LAT,
        gps_lon=GPS_LON,
        send_interval=SEND_EVERY_N,
        jpeg_quality=JPEG_QUALITY,
        async_mode=True,      # Non-blocking: sends in background thread
        buffer_size=5         # Keep last 5 frames queued
    )

    # Step 3: Wake the Render backend before starting (handles cold-start delay)
    uploader.wake_backend(max_wait=45)

    # Step 4: Open camera
    print(f"📷 Opening camera {CAMERA_INDEX}...")
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("❌ Could not open camera. Check CAMERA_INDEX.")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    print("🚀 Streaming started. Press Q to quit.\n")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️  Frame read failed — camera disconnected?")
                break

            # Run detection
            results = model(frame)

            # Send frame + detections to backend (every frame, regardless of detections)
            uploader.send(frame, results)

            # Optional: show local preview with bounding boxes
            annotated = results.render()[0]       # frame with boxes drawn
            cv2.imshow("Rail Rakshak - Jetson Live Feed", annotated)

            # Quit on Q key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        uploader.print_stats()
        print("✅ Detection script stopped.")


if __name__ == "__main__":
    main()
