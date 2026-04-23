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

# Parse command-line arguments
parser = argparse.ArgumentParser(description='YOLO Hand Pose Detection with Server Integration')
parser.add_argument('--player', type=str, default='player1', choices=['player1', 'player2'],
                    help='Player ID (player1 or player2)')
parser.add_argument('--camera', type=int, default=1, help='Camera index (default: 1)')
parser.add_argument('--server', type=str, default='http://localhost:3000', help='Server URL')
parser.add_argument('--show-time', action='store_true', help='Display inference time on frame')
parser.add_argument('--no-settings', action='store_true', help='Skip camera settings UI')
args = parser.parse_args()

# Configuration
MODEL_PATH = os.path.join(script_dir, "yolo26_ob_results", "runs", "detect", "yolo26_ob_experiment", "weights", "best.pt")
SERVER_URL = args.server
PLAYER_ID = args.player
CAMERA_INDEX = args.camera
THRESHOLD_VAL = 240
CONF_THRESHOLD = 0.5

# Create a persistent session to speed up requests
session = requests.Session()
session.headers.update({'ngrok-skip-browser-warning': 'true'})

# Load YOLO model
print(f"Loading YOLO model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)

# Rate limiting variables
last_send_time = 0
SEND_INTERVAL = 0.1 # 100ms (10 times per second)

# Initialize camera with DSHOW for Windows settings support
cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

# Show camera settings UI (the "pop up" with sliders) unless --no-settings is used
if not args.no_settings:
    print("Opening camera settings UI...")
    cap.set(cv2.CAP_PROP_SETTINGS, 1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

print("🚀 AI Shadow Predictor Started!")
print(f"📡 Server: {SERVER_URL}")
print(f"👤 Player: {PLAYER_ID}")
print("⌨️ Press 'q' to close program")

def encode_frame_to_base64(frame):
    """Encode frame to base64 string with heavy optimization for speed"""
    small_frame = cv2.resize(frame, (240, 180))
    _, buffer = cv2.imencode('.jpg', small_frame, [cv2.IMWRITE_JPEG_QUALITY, 35])
    return base64.b64encode(buffer).decode('utf-8')

def send_pose_to_server(prediction, confidence, frame_base64, inference_time):
    """Send prediction, camera frame, and inference time to server"""
    try:
        endpoint = f"{SERVER_URL}/api/{PLAYER_ID}/pose"
        payload = {
            'prediction': prediction,
            'confidence': confidence,
            'cameraFrame': frame_base64,
            'inferenceTime': inference_time
        }
        session.post(endpoint, json=payload, timeout=0.1)
        return True
    except:
        return False

while True:
    ret, frame = cap.read()
    if not ret: break

    # Pre-processing
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, THRESHOLD_VAL, 255, cv2.THRESH_BINARY)
    input_frame = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)

    # Run inference and measure time
    start_time = time.time()
    results = model.predict(source=input_frame, conf=CONF_THRESHOLD, verbose=False)
    end_time = time.time()
    inference_ms = (end_time - start_time) * 1000

    prediction = "Unknown"
    confidence = 0.0
    for r in results:
        if len(r.boxes) > 0:
            top_box = r.boxes[0]
            class_id = int(top_box.cls[0])
            confidence = float(top_box.conf[0])
            prediction = model.names[class_id]
            break

    # Encode and send (Rate Limited)
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        frame_b64 = encode_frame_to_base64(input_frame)
        send_pose_to_server(prediction, confidence, frame_b64, inference_ms)
        last_send_time = current_time

    # Display
    info_text = f"{prediction} ({confidence:.2f})"
    if args.show_time:
        info_text += f" | {inference_ms:.1f}ms"
    
    cv2.putText(input_frame, info_text, (20, 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.imshow(f'Shadow AI - {PLAYER_ID}', input_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
