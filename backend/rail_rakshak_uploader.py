"""
Rail Rakshak Backend Integration Module
Drop this module into your Jetson project and import it in c.py

Usage:
    from rail_rakshak_uploader import TelemetryUploader
    
    uploader = TelemetryUploader(backend_url="http://192.168.1.100:5000")
    
    # In your inference loop:
    uploader.send(frame, yolov5_results)
"""

import requests
import base64
import cv2
from datetime import datetime
from threading import Thread
import queue
import json


class TelemetryUploader:
    """
    Sends YOLOv5 detections to Rail Rakshak backend in real-time
    """
    
    def __init__(self, backend_url="http://localhost:5000/api/telemetry", 
                 gps_lat=28.6139, gps_lon=77.2090,
                 send_interval=2, jpeg_quality=80, 
                 async_mode=False, buffer_size=10):
        """
        Initialize uploader
        
        Args:
            backend_url: Full URL to /api/telemetry endpoint
            gps_lat: GPS latitude (default: New Delhi)
            gps_lon: GPS longitude
            send_interval: Send every N frames (2 = 30fps → 15fps data)
            jpeg_quality: JPEG compression (0-100)
            async_mode: Send in background thread (doesn't block inference)
            buffer_size: Queue size for async mode
        """
        self.backend_url = backend_url
        self.gps_lat = gps_lat
        self.gps_lon = gps_lon
        self.send_interval = send_interval
        self.jpeg_quality = jpeg_quality
        self.async_mode = async_mode
        self.frame_counter = 0
        self.sent_count = 0
        self.error_count = 0
        
        # For async mode
        if async_mode:
            self.queue = queue.Queue(maxsize=buffer_size)
            self.worker_thread = Thread(target=self._worker, daemon=True)
            self.worker_thread.start()
        
        # Test connection
        try:
            r = requests.get(backend_url.replace('/api/telemetry', ''), timeout=2)
            print(f"✅ Backend reachable: {self.backend_url}")
        except:
            print(f"⚠️ Warning: Backend might not be running at {backend_url}")
    
    def _encode_frame(self, frame):
        """Convert OpenCV frame to Base64 JPEG"""
        _, buffer = cv2.imencode('.jpg', frame, 
                                  [cv2.IMWRITE_JPEG_QUALITY, self.jpeg_quality])
        return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()
    
    def _parse_detections(self, results):
        """Convert YOLOv5 results to hazard format"""
        hazards = []
        
        if hasattr(results, 'xyxy') and len(results.xyxy[0]) > 0:
            for det in results.xyxy[0]:
                x1, y1, x2, y2, conf, cls = det.tolist()
                hazards.append({
                    "class": int(cls),
                    "name": results.names[int(cls)],
                    "confidence": float(conf),
                    "xmin": int(x1),
                    "ymin": int(y1),
                    "xmax": int(x2),
                    "ymax": int(y2)
                })
        
        return hazards
    
    def _build_payload(self, frame, detections):
        """Build JSON payload"""
        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "gps_location": {
                "lat": self.gps_lat,
                "lon": self.gps_lon
            },
            "hazards": detections,
            "image_stream": self._encode_frame(frame)
        }
    
    def _send_sync(self, payload):
        """Send synchronously (blocks until done or timeout)"""
        try:
            response = requests.post(
                self.backend_url,
                json=payload,
                timeout=3,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.sent_count += 1
                return True
            else:
                print(f"⚠️ Backend returned {response.status_code}")
                self.error_count += 1
                return False
                
        except requests.exceptions.Timeout:
            print("⚠️ Request timeout (backend slow?)")
            self.error_count += 1
            return False
        except requests.exceptions.ConnectionError:
            self.error_count += 1
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            self.error_count += 1
            return False
    
    def _worker(self):
        """Background thread for async sending"""
        while True:
            try:
                payload = self.queue.get(timeout=1)
                self._send_sync(payload)
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Worker error: {e}")
    
    def send(self, frame, yolov5_results):
        """
        Send frame + detections to backend
        
        Args:
            frame: OpenCV image (BGR)
            yolov5_results: YOLOv5 results object from model(frame)
        
        Returns:
            True if sent, False otherwise
        """
        self.frame_counter += 1
        
        # Skip frames based on interval
        if self.frame_counter % self.send_interval != 0:
            return False
        
        try:
            # Parse detections
            detections = self._parse_detections(yolov5_results)
            
            # Build payload
            payload = self._build_payload(frame, detections)
            
            # Send
            if self.async_mode:
                try:
                    self.queue.put(payload, block=False)
                    return True
                except queue.Full:
                    # Queue full, skip this frame
                    return False
            else:
                return self._send_sync(payload)
        
        except Exception as e:
            print(f"❌ Error in send(): {e}")
            return False
    
    def get_stats(self):
        """Get upload statistics"""
        return {
            "frames_processed": self.frame_counter,
            "frames_sent": self.sent_count,
            "errors": self.error_count,
            "success_rate": f"{100*self.sent_count/max(self.frame_counter,1):.1f}%"
        }
    
    def print_stats(self):
        """Print statistics"""
        stats = self.get_stats()
        print(f"\n📊 Telemetry Stats:")
        print(f"   Frames: {stats['frames_processed']}")
        print(f"   Sent: {stats['frames_sent']}")
        print(f"   Errors: {stats['errors']}")
        print(f"   Success: {stats['success_rate']}")


# ============================================================
# SIMPLE WRAPPER FOR EVEN EASIER USE
# ============================================================

def create_uploader(backend_ip="192.168.1.100", backend_port=5000, **kwargs):
    """
    Quick setup function
    
    Usage:
        uploader = create_uploader("192.168.1.100")
    """
    backend_url = f"http://{backend_ip}:{backend_port}/api/telemetry"
    return TelemetryUploader(backend_url, **kwargs)
