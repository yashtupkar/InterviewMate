#!/usr/bin/env python3
"""
YOLO Detection Service for Interview Cheat Detection
Detects: phone, books, eye gaze, attire anomalies
"""

import sys
import json
import base64
import cv2
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
    import mediapipe as mp
    YOLO_AVAILABLE = True
except ImportError:
    logger.warning("YOLO or MediaPipe not installed. Using mock detections.")
    YOLO_AVAILABLE = False

class CheatDetector:
    def __init__(self):
        """Initialize YOLO models and MediaPipe"""
        self.pose = None
        self.object_model = None
        self.pose_model = None
        
        try:
            if YOLO_AVAILABLE:
                # Load models - will auto-download if not present
                self.object_model = YOLO("yolov8n.pt")  # Object detection (phone, book)
                self.pose_model = YOLO("yolov8n-pose.pt")  # Pose detection for gaze
                
                # Initialize MediaPipe for gaze
                mp_pose = mp.solutions.pose
                self.pose = mp_pose.Pose(
                    static_image_mode=True,
                    model_complexity=1,
                    min_detection_confidence=0.5
                )
                logger.info("YOLO models loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load models: {e}")
    
    def decode_frame(self, frame_data):
        """Decode base64 frame to OpenCV image"""
        try:
            if isinstance(frame_data, str):
                frame_bytes = base64.b64decode(frame_data)
            else:
                frame_bytes = frame_data
            
            frame = cv2.imdecode(
                np.frombuffer(frame_bytes, dtype=np.uint8),
                cv2.IMREAD_COLOR
            )
            return frame
        except Exception as e:
            logger.error(f"Frame decode error: {e}")
            return None
    
    def detect_objects(self, frame):
        """Detect phones, books, other objects, and multiple people"""
        if self.object_model is None:
            return self._mock_object_detection(frame)
        
        detections = {
            "phone": [],
            "book": [],
            "laptop": [],
            "monitor": [],
            "person": []
        }
        
        try:
            results = self.object_model(frame, conf=0.4, verbose=False)
            
            for result in results:
                for box, conf, cls_id in zip(
                    result.boxes.xyxy,
                    result.boxes.conf,
                    result.boxes.cls
                ):
                    class_name = result.names[int(cls_id)]
                    
                    if class_name == "cell phone":
                        detections["phone"].append({
                            "confidence": float(conf),
                            "bbox": box.tolist(),
                            "class": class_name
                        })
                    elif class_name in ["book", "notebook", "laptop"]:
                        obj_type = "book" if class_name in ["book", "notebook"] else class_name
                        detections[obj_type].append({
                            "confidence": float(conf),
                            "bbox": box.tolist(),
                            "class": class_name
                        })
                    elif class_name == "monitor":
                        detections["monitor"].append({
                            "confidence": float(conf),
                            "bbox": box.tolist(),
                            "class": class_name
                        })
                    elif class_name == "person":
                        detections["person"].append({
                            "confidence": float(conf),
                            "bbox": box.tolist(),
                            "class": class_name
                        })
        except Exception as e:
            logger.error(f"Object detection error: {e}")
        
        return detections
    
    def detect_gaze(self, frame):
        """Detect eye gaze direction and head pose"""
        gaze_data = {
            "gaze_direction": None,
            "head_pose": None,
            "eye_aspect_ratio": None,
            "confidence": 0.0
        }
        
        if self.pose is None:
            return self._mock_gaze_detection()
        
        try:
            # Convert to RGB for MediaPipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(frame_rgb)
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # Get eye landmarks (indices 2, 5, 7, 8, 33, 34, 35, 36, 42, 43)
                left_eye_inner = landmarks[33]
                left_eye_outer = landmarks[35]
                right_eye_inner = landmarks[34]
                right_eye_outer = landmarks[36]
                nose = landmarks[0]
                
                # Calculate gaze angle (simplified)
                # Check if looking away from camera
                eye_horizontal_mean = (left_eye_inner.x + right_eye_inner.x) / 2
                eye_vertical_mean = (left_eye_inner.y + right_eye_inner.y) / 2
                
                # Estimate gaze deviation from center (0.5, 0.5 is center)
                gaze_x_deviation = (eye_horizontal_mean - nose.x) * 180  # Convert to degrees
                gaze_y_deviation = (eye_vertical_mean - nose.y) * 180
                
                gaze_angle = int(np.sqrt(gaze_x_deviation**2 + gaze_y_deviation**2))
                
                gaze_data = {
                    "gaze_direction": {
                        "x": float(gaze_x_deviation),
                        "y": float(gaze_y_deviation),
                        "angle": gaze_angle
                    },
                    "head_pose": {
                        "pitch": float(nose.y * 90),  # Simplified
                        "yaw": float(nose.x * 90),
                        "roll": 0.0
                    },
                    "eye_aspect_ratio": float(
                        (left_eye_inner.y + right_eye_inner.y) / 
                        (left_eye_outer.y + right_eye_outer.y + 1e-6)
                    ),
                    "confidence": float(results.pose_world_landmarks[0].z if results.pose_world_landmarks else 0.0)
                }
        except Exception as e:
            logger.warning(f"Gaze detection error: {e}")
        
        return gaze_data
    
    def detect_attire(self, frame):
        """Detect suspicious attire items (earpieces, etc.)"""
        attire_data = {
            "suspicious_items": [],
            "earpiece_detected": False,
            "confidence": 0.0
        }
        
        try:
            # Simple heuristic: Look for dark circular objects near ears
            # (Would be improved with specific attire model)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            lower_black = np.array([0, 0, 0])
            upper_black = np.array([180, 255, 100])
            
            mask = cv2.inRange(hsv, lower_black, upper_black)
            contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            
            h, w = frame.shape[:2]
            for contour in contours:
                area = cv2.contourArea(contour)
                (x, y), radius = cv2.minEnclosingCircle(contour)
                
                # Look for small circular objects near ears (y < 30% of image, x near edges)
                if 50 < area < 500 and (x < w * 0.1 or x > w * 0.9) and y < h * 0.3:
                    attire_data["earpiece_detected"] = True
                    attire_data["suspicious_items"].append({
                        "type": "potential_earpiece",
                        "position": {"x": float(x), "y": float(y)},
                        "area": float(area),
                        "confidence": min(area / 500, 1.0)
                    })
        except Exception as e:
            logger.warning(f"Attire detection error: {e}")
        
        return attire_data
    
    def _mock_object_detection(self, frame):
        """Mock object detection for demo/testing"""
        return {
            "phone": [],
            "book": [],
            "laptop": [],
            "monitor": []
        }
    
    def _mock_gaze_detection(self):
        """Mock gaze detection for demo/testing"""
        return {
            "gaze_direction": {"x": 0, "y": 0, "angle": 0},
            "head_pose": {"pitch": 0, "yaw": 0, "roll": 0},
            "eye_aspect_ratio": 0.3,
            "confidence": 0.0
        }
    
    def process_frame(self, frame_data):
        """Main entry point: process a single frame"""
        result = {
            "success": False,
            "error": None,
            "detections": {
                "objects": None,
                "gaze": None,
                "attire": None
            },
            "risks": {
                "phone": 0,
                "book": 0,
                "gaze_deviation": 0,
                "attire": 0
            }
        }
        
        try:
            # Decode frame
            frame = self.decode_frame(frame_data)
            if frame is None:
                result["error"] = "Frame decode failed"
                return result
            
            # Run detections
            objects = self.detect_objects(frame)
            gaze = self.detect_gaze(frame)
            attire = self.detect_attire(frame)
            
            result["detections"]["objects"] = objects
            result["detections"]["gaze"] = gaze
            result["detections"]["attire"] = attire
            
            # Calculate risk scores (0-100)
            result["risks"]["phone"] = min(100, len(objects["phone"]) * 30)
            result["risks"]["book"] = min(100, len(objects["book"]) * 40)
            result["risks"]["gaze_deviation"] = min(
                100,
                gaze.get("gaze_direction", {}).get("angle", 0) * 2
            )
            result["risks"]["attire"] = min(
                100,
                len(attire["suspicious_items"]) * 50
            )
            
            # Calculate multi-person risk (HIGH PRIORITY - multiple people suspicious)
            person_count = len(objects["person"])
            # If more than 1 person detected, it's highly suspicious
            if person_count > 1:
                # Scale: 2 people = 85 risk, 3+ = 100 risk
                result["risks"]["multiple_people"] = min(100, 85 + (person_count - 2) * 15)
            else:
                result["risks"]["multiple_people"] = 0
            
            result["success"] = True
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Processing error: {e}")
        
        return result


def main():
    """CLI interface for the detector"""
    detector = CheatDetector()
    
    # Read from stdin or file
    input_data = sys.stdin.read()
    
    try:
        # Expect JSON with base64-encoded frame
        request = json.loads(input_data)
        frame_data = request.get("frame")
        
        if not frame_data:
            print(json.dumps({"error": "No frame data provided"}))
            sys.exit(1)
        
        result = detector.process_frame(frame_data)
        print(json.dumps(result, default=str))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
