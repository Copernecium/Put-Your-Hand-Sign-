import cv2, base64, asyncio, socketio, uvicorn
from fastapi import FastAPI
from ultralytics import YOLO

# --- Config ---
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app_asgi = socketio.ASGIApp(sio, app)

import os

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
# Define the path to the model relative to the script
model_path = os.path.join(script_dir, "yolo26_ob_results", "runs", "detect", "yolo26_ob_experiment", "weights", "best.pt")

# โหลด Model ที่คุณเทรนมา (YOLO26n)
model = YOLO(model_path)
THRESHOLD_VAL = 250 # ค่าตามที่คุณใช้สร้าง Dataset

async def run_ai():
    cap = cv2.VideoCapture(2, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_SETTINGS, 1)
    print("📸 Camera started. Local monitor enabled.")

    while True:
        ret, frame = cap.read()
        if not ret:
            await asyncio.sleep(0.1)
            continue

        # 1. Image Processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, THRESHOLD_VAL, 255, cv2.THRESH_BINARY)
        
        # 2. AI Inference
        input_img = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
        results = model.predict(input_img, conf=0.5, verbose=False)
        
        label = "Unknown"
        if len(results[0].boxes) > 0:
            label = model.names[int(results[0].boxes[0].cls[0])]
            # วาด Box ลงบนภาพ Local (ถ้าต้องการ)
            annotated_frame = results[0].plot() 
        else:
            annotated_frame = input_img

        # -------------------------------------------------------
        # 🖥️ เพิ่มส่วนนี้: แสดงผลบนหน้าจอเครื่องคอมพิวเตอร์
        # -------------------------------------------------------
        cv2.putText(annotated_frame, f"AI: {label}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        cv2.imshow('FIBO Shadow AI - Local Monitor', annotated_frame)
        
        # สำคัญมาก: ต้องมี waitKey(1) ไม่งั้นหน้าต่างจะค้าง (Not Responding)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        # -------------------------------------------------------

        # 3. Optimize & Encode (สำหรับส่งขึ้นเว็บ)
        small_frame = cv2.resize(binary, (320, 240)) # ย่อลงอีกเพื่อลดความหน่วงบนเว็บ
        _, buff = cv2.imencode('.jpg', small_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
        img_base64 = base64.b64encode(buff).decode('utf-8')

        # 4. ส่งออก Socket
        await sio.emit('shadow_data', {'img': img_base64, 'label': label})
        await asyncio.sleep(0.01) # ปรับ Delay ให้ลดลงเพื่อให้ลื่นขึ้น

    cap.release()
    cv2.destroyAllWindows()

@app.on_event("startup")
async def startup(): asyncio.create_task(run_ai())

if __name__ == "__main__":
    uvicorn.run(app_asgi, host="0.0.0.0", port=8000)