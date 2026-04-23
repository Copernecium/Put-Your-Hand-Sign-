import cv2
from ultralytics import YOLO
import base64
import requests
import json
import time
import sys
import argparse

import os

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# --- Configuration ---
MODEL_PATH = os.path.join(script_dir, "yolo26_ob_results", "runs", "detect", "yolo26_ob_experiment", "weights", "best.pt")
CAMERA_INDEX = 1
THRESHOLD_VAL = 240
CONF_THRESHOLD = 0.5

# Parse command-line arguments
parser = argparse.ArgumentParser(description='YOLO Hand Pose Detection with Server Integration')
parser.add_argument('--player', type=str, default='player1', choices=['player1', 'player2'],
                    help='Player ID (player1 or player2)')
parser.add_argument('--camera', type=int, default=1, help='Camera index (default: 1)')
parser.add_argument('--server', type=str, default='http://localhost:3000', help='Server URL')
args = parser.parse_args()

# Server configuration
SERVER_URL = args.server
PLAYER_ID = args.player
CAMERA_INDEX = args.camera
SEND_INTERVAL = 0.5  # Slow down to 2 frames per second for ngrok stability

# Create a persistent session to speed up requests and bypass ngrok warning
session = requests.Session()
session.headers.update({'ngrok-skip-browser-warning': 'true'})

# 1. Load YOLO model
print(f"Loading YOLO model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
cap.set(cv2.CAP_PROP_SETTINGS, 1)

print("🚀 AI Shadow Predictor Started!")
print(f"📡 Server: {SERVER_URL}")
print(f"👤 Player: {PLAYER_ID}")
print(f"📹 Camera Index: {CAMERA_INDEX}")
print("⌨️ Press 'q' to close program")

last_send_time = time.time()

def encode_frame_to_base64(frame):
    """Encode frame to base64 string"""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def send_pose_to_server(prediction, confidence, frame):
    """Send prediction and camera frame to server using persistent session"""
    try:
        endpoint = f"{SERVER_URL}/api/{PLAYER_ID}/pose"
        frame_base64 = encode_frame_to_base64(frame)
        
        payload = {
            'prediction': prediction,
            'confidence': confidence,
            'cameraFrame': frame_base64
        }
        
        # Use the session instead of requests.post for better performance
        response = session.post(endpoint, json=payload, timeout=3)
        
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Server error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - make sure it's running on port 3000")
        return False
    except Exception as e:
        print(f"❌ Error sending to server: {str(e)}")
        return False

while True:
    ret, frame = cap.read()
    if not ret: 
        break

    # --- Pre-processing ---
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, THRESHOLD_VAL, 255, cv2.THRESH_BINARY)
    
    # Convert to 3 channels for YOLO
    input_frame = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)

    # 2. Run inference
    results = model.predict(source=input_frame, conf=CONF_THRESHOLD, verbose=False)

    # Extract and send results
    display_text = "Finding..."
    prediction = "Unknown"
    confidence = 0.0
    
    for r in results:
        if len(r.boxes) > 0:
            top_box = r.boxes[0]
            class_id = int(top_box.cls[0])
            confidence = float(top_box.conf[0])
            prediction = model.names[class_id]
            
            display_text = f"Result: {prediction} ({confidence:.2f})"

    # 3. Send to server periodically
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        send_pose_to_server(prediction, confidence, input_frame)
        last_send_time = current_time

    # Display results
    cv2.rectangle(input_frame, (0, 0), (450, 60), (0, 0, 0), -1)
    cv2.putText(input_frame, display_text, (20, 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow('Shadow AI Classification (YOLO26n-OB)', input_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()