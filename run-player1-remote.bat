@echo off
set /p SERVER_URL="Enter ngrok URL (e.g., https://xyz.ngrok-free.app): "

:: Check if .venv exists locally
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    :: Fallback to system python
    set "PYTHON_EXE=python"
)

:: Check if the directory exists
if not exist "%~dp0puteyourhandsign\Put-Your-Hand-Sign" (
    echo [ERROR] Could not find the folder: puteyourhandsign\Put-Your-Hand-Sign
    echo Please make sure you copied the entire project folder.
    pause
    exit /b
)

cd /d "%~dp0puteyourhandsign\Put-Your-Hand-Sign"

echo Starting YOLO Inference for Player 1...
echo Connecting to %SERVER_URL%
echo Using: %PYTHON_EXE%

"%PYTHON_EXE%" inferance_Yolo.py --player player1 --server %SERVER_URL% --camera 1

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The AI script failed to start. 
    echo Please make sure you have installed the requirements:
    echo pip install ultralytics opencv-python requests
)

pause
