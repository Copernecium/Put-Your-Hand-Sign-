@echo off
set /p SERVER_URL="Enter Tunnel URL (e.g., https://xyz.trycloudflare.com or https://xyz.ngrok-free.app): "
set /p CAMERA_ID="Enter Camera Index (0 for default, 1 for external): "

:: Check if .venv exists locally
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

:: Check if the directory exists
if not exist "%~dp0puteyourhandsign\Put-Your-Hand-Sign" (
    echo [ERROR] Could not find the folder: puteyourhandsign\Put-Your-Hand-Sign
    pause
    exit /b
)

cd /d "%~dp0puteyourhandsign\Put-Your-Hand-Sign"

echo Starting YOLO Inference for Player 1...
echo Connecting to %SERVER_URL%
echo Using Camera: %CAMERA_ID%

"%PYTHON_EXE%" inferance_Yolo.py --player player1 --server %SERVER_URL% --camera %CAMERA_ID%

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The AI script failed to start. 
    echo pip install ultralytics opencv-python requests
)

pause
