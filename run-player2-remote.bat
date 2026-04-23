@echo off
set /p SERVER_URL="Enter ngrok URL (e.g., https://xyz.ngrok-free.app): "
set "VENV_PYTHON=%~dp0.venv\Scripts\python.exe"
cd /d "%~dp0puteyourhandsign\Put-Your-Hand-Sign"
echo Starting YOLO Inference for Player 2...
echo Connecting to %SERVER_URL%
"%VENV_PYTHON%" inferance_Yolo.py --player player2 --server %SERVER_URL% --camera 0
pause
