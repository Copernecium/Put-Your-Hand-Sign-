# Running YOLO Hand Pose Detection with Game Server

This guide explains how to run the hand pose detection system using YOLO and send the predictions to the game server.

## System Architecture

```
┌─────────────────────────────────────┐
│  Computer 1: Game Server (Node.js)  │
│  Port 3000                          │
│  - Main game logic                  │
│  - Receives predictions & frames    │
│  - Serves web interfaces            │
└──────────────┬──────────────────────┘
               │
        HTTP API (port 3000)
               │
      ┌────────┴────────┐
      │                 │
┌─────▼──────────┐  ┌──▼──────────────┐
│   Computer 1   │  │   Computer 2    │
│ Player 1 YOLO  │  │ Player 2 YOLO   │
│ + Camera       │  │ + Camera        │
└────────────────┘  └─────────────────┘
```

## Prerequisites

- Node.js 20+ installed
- Python 3.12+ installed
- Both packages installed:
  ```
  npm install
  pip install mediapipe opencv-python requests ultralytics
  ```

## Quick Start (3 Steps)

### Step 1: Start the Game Server
```powershell
node server.js
```
You should see:
```
Game server running on port 3000
✓ Ready to receive poses from players
```

### Step 2A: Start Player 1 YOLO Detection
Run the batch file (easiest):
```
run-player1-yolo.bat
```

Or manually in PowerShell:
```powershell
cd D:\3year3\HRI\PutYourHandSign\puteyourhandsign\Put-Your-Hand-Sign
python inferance_Yolo.py --player player1 --camera 1
```

### Step 2B: Start Player 2 YOLO Detection
Run the batch file:
```
run-player2-yolo.bat
```

Or manually:
```powershell
cd D:\3year3\HRI\PutYourHandSign\puteyourhandsign\Put-Your-Hand-Sign
python inferance_Yolo.py --player player2 --camera 0
```

### Step 3: Open the Game Pages
- **Spectator View** (main display): http://localhost:3000/spectator.html
- **Player 1 Page**: http://localhost:3000/player1.html
- **Player 2 Page**: http://localhost:3000/player2.html
- **Debug Console**: http://localhost:3000/debug.html

## Command-Line Options

The YOLO inference script supports these arguments:

```bash
python inferance_Yolo.py [OPTIONS]
```

**Options:**
- `--player {player1, player2}` - Set which player this is (default: player1)
- `--camera N` - Camera index to use (default: 1)
  - Use `0` for first camera
  - Use `1` for second camera
- `--server URL` - Server URL (default: http://localhost:3000)

**Examples:**
```bash
# Player 1 on camera 1
python inferance_Yolo.py --player player1 --camera 1

# Player 2 on camera 0
python inferance_Yolo.py --player player2 --camera 0

# Custom server
python inferance_Yolo.py --player player1 --server http://192.168.1.100:3000
```

## Troubleshooting

### Camera Not Showing on Spectator Page

1. **Check server console for logs:**
   - Look for messages like: `✓ Player 1: Peace Sign (98%) - Frame: 25.5KB`
   - If you don't see these, frames aren't being received

2. **Check Python console:**
   - Look for errors or connection messages
   - Verify it says: `📡 Server: http://localhost:3000`

3. **Open browser console (F12):**
   - Go to Spectator page
   - Press F12 → Console
   - Look for "Camera frames received:" messages
   - Should show `player1Frame: 'has data'`

4. **Verify server is running:**
   ```powershell
   curl http://localhost:3000/api/spectator/state
   ```
   Should return JSON data

### Python Connection Error

If you see: `❌ Cannot connect to server`

1. Make sure Node.js server is running: `node server.js`
2. Check firewall isn't blocking port 3000
3. If on different computers:
   - Update `--server` argument to the server's IP:
   ```bash
   python inferance_Yolo.py --player player1 --server http://192.168.1.X:3000
   ```

### Camera Not Found

If you see: `OpenCV error: can't open camera`

1. Check which cameras are available
2. Try different camera indices: 0, 1, 2, etc.
3. Make sure no other application is using the camera
4. Try: `python inferance_Yolo.py --player player1 --camera 0`

## How Data Flows

1. **YOLO Script:**
   - Captures frame from camera
   - Processes with binary threshold (THRESHOLD_VAL = 240)
   - Runs YOLO inference
   - Encodes frame to base64 (JPEG, 70% quality)
   - Sends to server via `/api/player1/pose` or `/api/player2/pose`

2. **Server:**
   - Receives predictions and frames
   - Stores the latest frame for each player
   - Logs reception to console
   - Serves frames via `/api/spectator/camera-frames`

3. **Spectator Page:**
   - Polls `/api/spectator/state` every 1 second (game state)
   - Polls `/api/spectator/camera-frames` every 1 second (camera frames)
   - Displays frames as base64-encoded JPEG images
   - Updates predictions and confidence scores

## Performance Notes

- Frame compression: JPEG at 70% quality reduces size to ~25KB per frame
- Send interval: 0.1 seconds (10 FPS)
- Update interval: 1 second for spectator page
- Typical network bandwidth: ~2.5 Mbps per stream

## File Locations

- Game Server: `server.js`
- YOLO Inference: `puteyourhandsign/Put-Your-Hand-Sign/inferance_Yolo.py`
- Batch Files: `run-player1-yolo.bat` and `run-player2-yolo.bat`
- Spectator Page: `public/spectator.html`

## Next Steps

Once everything is working:
1. Adjust `THRESHOLD_VAL` in inferance_Yolo.py if hand detection improves
2. Customize pose matching in `server.js` predictionMatches() function
3. Fine-tune YOLO confidence threshold (CONF_THRESHOLD)
4. Run on separate computers as needed
