# 🚀 Quick Start Guide

## What This Is

A hand pose game where two players compete to perform hand gestures correctly and faster than their opponent!

## Setup (5 minutes)

### Step 1: Install Node Dependencies
```bash
npm install
```

### Step 2: Install Python Dependencies (Optional)
```bash
pip install mediapipe opencv-python requests
```

### Step 3: Start the Server
```bash
npm start
```
Server runs at `http://localhost:3000`

### Step 4: Open in Browser
- **Player 1**: http://localhost:3000/player1
- **Player 2**: http://localhost:3000/player2
- **Spectator**: http://localhost:3000/spectator
- **Debug**: http://localhost:3000/debug

### Step 5: Run Python Pose Detection (in separate terminal)
```bash
python pose_detection_client.py --player player1
```
Or for Player 2:
```bash
python pose_detection_client.py --player player2
```

## How to Play

1. **Player 1**: Click "Start Camera" → "Ready To Play"
2. **Player 2**: Click "Start Camera" → "Ready To Play"
3. Game starts automatically
4. A hand pose task appears (e.g., "Peace Sign")
5. Perform the pose as fast as possible
6. First player to match correctly wins the point
7. Scores track throughout the game

## Test Without Camera

Use the Debug Console:
1. Open http://localhost:3000/debug
2. Set both players to Ready
3. Start Game
4. Use "Pose Simulator" to send test poses
5. Watch game state update

## Key Pages

| Page | Purpose |
|------|---------|
| `http://localhost:3000/` | Navigation hub |
| `/player1` | Player 1 interface (camera, score, timer) |
| `/player2` | Player 2 interface (camera, score, timer) |
| `/spectator` | Spectator view (watch both players) |
| `/debug` | Control panel & game monitoring |

## File Structure

- `server.js` - Game server & logic
- `pose_detection_client.py` - Hand detection via Python
- `public/` - All website files
  - `player1.html`, `player2.html` - Player pages
  - `spectator.html` - Spectator page
  - `debug.html` - Debug console
  - `player.js` - Player page logic
  - `styles.css` - Design/styling

## API Integration

Your hand pose detector (Python/other) sends data to server:

```python
import requests

response = requests.post('http://localhost:3000/api/player1/pose', json={
    'prediction': 'Peace Sign',    # The pose you detected
    'confidence': 0.95,             # How confident (0-1)
    'cameraFrame': None             # Optional: base64 frame
})
```

Server checks if prediction matches current task → Score increases if correct!

## Customize Tasks

Edit `server.js` function `const tasks = [...]` to add more poses:

```javascript
{ id: 9, name: 'My Custom Pose', image: '/images/custom.png', description: 'Your description' }
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Port 3000 might be in use: `npm start` with `PORT=3001` |
| Camera access denied | Check browser permissions, try incognito window |
| Poses not detected | Run Python script: `python pose_detection_client.py` |
| Timer not working | Check debug console - look at game state |

## Advanced Usage

### Multi-Device
Run server on one machine, access from others:
```
http://<your-machine-ip>:3000/player1
http://<your-machine-ip>:3000/player2
```

### Custom Detection
Replace the pose detection in `pose_detection_client.py` with your own system.

### Modify Game Rules
All game logic in `server.js` - easy to tweak scoring, timer, etc.

## Need Help?

1. Open Debug Console: `/debug`
2. Check browser console: Press F12
3. Check server logs in terminal
4. See full README.md for detailed documentation

---

**Ready to play? Start the server and open `/player1`! 🎮**
