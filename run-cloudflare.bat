@echo off
echo Starting Hand Pose Game Server...
start /b node server.js

echo.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Cloudflare Tunnel...
echo ------------------------------------------------------------
echo YOUR PUBLIC URL WILL APPEAR BELOW (look for .trycloudflare.com)
echo ------------------------------------------------------------
.\cloudflared.exe tunnel --url http://127.0.0.1:3000
pause
