@echo off
set "VENV_PYTHON=%~dp0.venv\Scripts\python.exe"
cd /d "%~dp0puteyourhandsign\Put-Your-Hand-Sign"
echo Starting YOLO Inference for Player 1...
"%VENV_PYTHON%" inferance_Yolo.py --player player1 --camera 1
pause
