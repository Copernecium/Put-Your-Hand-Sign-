import cv2
import numpy as np

# --- ตั้งค่า Index กล้อง (ของนายคือ 2) ---
CAMERA_INDEX = 2

def nothing(x):
    pass

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

# เพิ่มบรรทัดนี้เพื่อเปิดหน้าต่างตั้งค่ากล้อง
cap.set(cv2.CAP_PROP_SETTINGS, 1)

# สร้างหน้าต่างและแถบเลื่อนปรับค่า Threshold (0-255)
cv2.namedWindow('Vision_Test')
cv2.createTrackbar('Threshold_Value', 'Vision_Test', 127, 255, nothing)

print("📸 Vision Test Started!")
print("⌨️ กด 'q' เพื่อปิด")

while True:
    ret, frame = cap.read()
    if not ret: break

    # 1. แปลงเป็น Grayscale (สีเทา)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # 2. แปลงเป็น Black & White (Binary Threshold)
    # อ่านค่าจากแถบเลื่อนเพื่อกำหนดจุดตัดขาว-ดำ
    thresh_val = cv2.getTrackbarPos('Threshold_Value', 'Vision_Test')
    _, binary = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY)

    # 3. รวมภาพเพื่อเปรียบเทียบ (Stacking)
    # ต้องแปลงภาพ Gray และ Binary ให้มี 3 Channel ก่อนถึงจะต่อกับภาพสีได้
    gray_3ch = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    binary_3ch = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)

    # รวมภาพแบบ 3 ช่อง: Original | Gray | Binary
    combined = np.hstack((frame, gray_3ch, binary_3ch))

    # ย่อขนาดลงหน่อยเพื่อให้เห็นครบทุกภาพในจอเดียว
    display_res = cv2.resize(combined, (1200, 400))

    cv2.putText(display_res, "Original", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(display_res, "Grayscale", (410, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(display_res, "Black & White (Binary)", (810, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow('Vision_Test', display_res)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()