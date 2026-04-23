@echo off
set "VENV_PYTHON=%~dp0.venv\Scripts\python.exe"
cd /d "%~dp0puteyourhandsign\Put-Your-Hand-Sign"
echo Starting YOLO Inference for Player 2...
"%VENV_PYTHON%" inferance_Yolo.py --player player2 --camera 0
pause
