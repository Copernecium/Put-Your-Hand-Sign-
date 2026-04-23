# Hand Pose Game - Complete Setup Guide

A competitive hand pose recognition game where two players race to perform hand gestures faster and more accurately than their opponent!

## 🎮 Features

- **Player Pages**: Each player has their own interface with camera display, ready button, score, and timer
- **Spectator View**: Real-time monitoring of both players' performance and predictions
- **Debug Console**: Game control panel for testing, managing player states, and monitoring game logic
- **Real-time Updates**: WebSocket-style polling for synchronized game state
- **Python Integration**: Easy integration with your hand pose detection system

## 📋 Project Structure

```
PutYourHandSign/
├── server.js                      # Node.js/Express backend
├── package.json                   # Dependencies
├── pose_detection_client.py       # Python hand pose detection client
├── public/
│   ├── index.html                # Home page (navigation hub)
│   ├── player1.html              # Player 1 interface
│   ├── player2.html              # Player 2 interface
│   ├── spectator.html            # Spectator view
│   ├── debug.html                # Debug console
│   ├── player.js                 # Player page logic
│   ├── styles.css                # All styling
│   └── images/                   # Placeholder for task images
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.7+ (for pose detection)
- Modern web browser
- Webcam

### 1. Setup Node.js Server

```bash
# Navigate to project directory
cd d:\3year3\HRI\PutYourHandSign

# Install Node dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000`

### 2. Setup Python Pose Detection

```bash
# Install Python dependencies
pip install mediapipe opencv-python requests

# Run pose detection for Player 1 (in separate terminal)
python pose_detection_client.py --player player1

# OR run for Player 2
python pose_detection_client.py --player player2
```

### 3. Access the Game

Open these URLs in your browser:
- **Main Hub**: http://localhost:3000
- **Player 1**: http://localhost:3000/player1
- **Player 2**: http://localhost:3000/player2
- **Spectator**: http://localhost:3000/spectator
- **Debug**: http://localhost:3000/debug

## 🎯 How to Play

### For Players

1. **Open player page** (Player 1 or Player 2)
2. **Start Camera** - Click "Start Camera" to enable webcam
3. **Ready Up** - Click "Ready To Play" when you're ready
4. **Perform Poses** - Once both players are ready, a task will be assigned
5. **Match the Pose** - Quickly perform the hand pose shown in the task
6. The Python script will detect your pose and send predictions
7. **First correct match wins** - The player who completes the pose correctly first gets the point
8. **New rounds continue** - After each round, a new task is given

### For Spectators

- Open the Spectator view to watch both players compete
- See real-time predictions and confidence scores
- Watch scores update in real-time
- See who wins each round with colored announcements

### For Debugging/Testing

1. Open the Debug Console
2. **Manually set player ready status** - Use buttons to mark players as ready
3. **Simulate poses** - Use the pose simulator to test without Python
4. **Control timer** - Set, start, and stop the timer manually
5. **Monitor game state** - View all game variables in real-time
6. **View activity log** - See all actions with timestamps

## 🔌 How to Integrate Your Hand Pose Detection

### Option 1: Using the Provided Python Script

The `pose_detection_client.py` includes hand pose detection using MediaPipe. Modify the `_classify_pose()` method to implement your own detection logic:

```python
def _classify_pose(self, landmarks):
    # Your custom pose classification logic here
    # Return one of: 'Peace Sign', 'Thumbs Up', 'Rock Sign', etc.
    pass
```

### Option 2: Custom Python Backend

If you have your own pose detection model:

```python
import requests

# Send pose prediction to game server
response = requests.post(
    'http://localhost:3000/api/player1/pose',
    json={
        'prediction': 'Peace Sign',      # Pose name
        'confidence': 0.95,               # Confidence 0-1
        'cameraFrame': frame_base64       # Optional: base64 encoded frame
    }
)
```

### Option 3: JavaScript Integration

You can also add detection directly in the browser using TensorFlow.js:

```javascript
// In player.js, replace the sendFrameToServer() method
async sendFrameToServer(frameData) {
    // Use your detection model to get predictions
    const prediction = await detectPose(frameData);
    
    const endpoint = `/api/${this.playerId}/pose`;
    await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prediction: prediction.name,
            confidence: prediction.confidence,
            cameraFrame: frameData
        })
    });
}
```

## 🎮 Game Logic

### How Poses Are Matched

The game uses simple text matching with confidence thresholds:
1. Python/your system sends pose prediction + confidence score
2. Server checks if prediction matches current task (fuzzy matching allowed)
3. Requires minimum 70% confidence to count
4. First player to match correctly wins the round

### Task Rotation

Tasks cycle through a predefined list:
- Peace Sign
- Thumbs Up
- Rock Sign
- OK Sign
- Open Hand
- Fist
- Point
- Victory

### Timer

- Default: 30 seconds per round
- Adjustable in debug console
- When timer reaches 0, the round ends
- Winner determined by who scored the most in that round

## 📡 API Endpoints

### Player Endpoints

**Send Pose (Player 1)**
```
POST /api/player1/pose
{
  "prediction": "Peace Sign",
  "confidence": 0.95,
  "cameraFrame": "base64_encoded_image"  // optional
}
```

**Set Ready Status (Player 1)**
```
POST /api/player1/ready
{
  "ready": true
}
```

Similar endpoints exist for `player2`.

### Spectator/Debug Endpoints

**Get Game State**
```
GET /api/debug/state
Returns: Complete game state object
```

**Get Spectator View**
```
GET /api/spectator/state
Returns: Game state visible to spectators
```

**Control Game**
```
POST /api/debug/game/start      // Start game (players must be ready)
POST /api/debug/game/reset      // Reset game
POST /api/debug/round/complete  // End current round
```

**Timer Control**
```
POST /api/debug/timer/set       // Set timer duration
POST /api/debug/timer/start     // Start timer
POST /api/debug/timer/stop      // Stop timer
```

**Player Control**
```
POST /api/debug/player/ready/:playerNum  // Set player ready status
```

## 🛠️ Configuration

### Server Port

Change in `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Or set environment variable:
```bash
set PORT=5000  # Windows
# or
export PORT=5000  # Linux/Mac
```

### Timer Duration

Change in `server.js` function `startGameRound()`:
```javascript
gameState.timer = 30; // Change this value (in seconds)
```

### Add New Tasks

Edit the `tasks` array in `server.js`:
```javascript
const tasks = [
  { id: 1, name: 'My Custom Pose', image: '/images/custom.png', description: '...' },
  // ... more tasks
];
```

## 📊 Monitoring

### Activity Log (Debug Console)

The debug console shows timestamped logs of:
- Game state changes
- Player ready status changes
- Timer events
- Pose simulator actions
- Errors and warnings

### Game State Variables

View in Debug Console:
- `gameActive`: Is game currently running?
- `timerRunning`: Is the countdown active?
- `currentTask`: What pose should players perform?
- `player1/2.score`: Current scores
- `player1/2.prediction`: Last detected pose
- `roundComplete`: Did the round finish?
- `winner`: Who won the last round?

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use different port
set PORT=3001
npm start
```

### Camera access denied
- Check browser permissions
- Try incognito/private window
- Ensure camera is not used by other apps

### Poses not being detected
1. Check Python script is running (`python pose_detection_client.py`)
2. Verify server URL matches (default: http://localhost:3000)
3. Check console logs for API errors
4. Ensure good lighting for hand detection

### Predictions not matching tasks
- Increase confidence threshold (currently 0.7)
- Modify `predictionMatches()` function in server.js
- Improve pose classification in Python script

### Timer not working
- Open debug console
- Manually test timer controls
- Check browser console for JavaScript errors

## 📱 Multi-Device Setup

To run players and spectator on different devices:

1. Start server on main machine
2. On other machines, access via network IP:
   ```
   http://<server-ip>:3000/player1
   http://<server-ip>:3000/player2
   http://<server-ip>:3000/spectator
   ```

3. Run Python pose detection clients as needed:
   ```bash
   python pose_detection_client.py --player player1 --server http://<server-ip>:3000
   ```

## 🔒 Security Notes

- This is a demo application - not production-ready
- API has no authentication
- Ensure you run on a trusted network only
- Don't expose publicly without security measures

## 📝 Example Usage Scenario

### Setup
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Player 1 detection
python pose_detection_client.py --player player1

# Terminal 3: Player 2 detection  
python pose_detection_client.py --player player2
```

### Browser Windows
```
Window 1: http://localhost:3000/            (Home/navigation)
Window 2: http://localhost:3000/player1     (Player 1)
Window 3: http://localhost:3000/player2     (Player 2)
Window 4: http://localhost:3000/spectator   (Spectator view)
Window 5: http://localhost:3000/debug       (Debug console)
```

### Play
1. In Player 1 window: Click "Start Camera" → "Ready To Play"
2. In Player 2 window: Click "Start Camera" → "Ready To Play"
3. Game automatically starts when both are ready
4. Both players perform the assigned hand pose
5. First one to match correctly wins
6. Watch scores update in spectator view

## 🔄 Game Loop

```
1. Waiting State
   ↓
2. Players click Ready
   ↓
3. Both ready → Timer starts, Task assigned
   ↓
4. Players perform pose
   ↓
5. First correct match → Score increases
   ↓
6. Round completes → Back to step 1
```

## 🎨 Customization

### Change Colors/Styling
Edit `public/styles.css` - all colors use CSS variables at the top

### Change Task Images
Place images in `public/images/` and update task definitions

### Modify Game Rules
Edit game logic in `server.js`:
- `predictionMatches()` - Change how poses are matched
- `startGameRound()` - Change timer duration
- Task definitions - Add more poses

## 📚 Dependencies

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- No external libraries

### Backend
- Node.js
- Express.js
- CORS middleware
- Body Parser

### Python
- MediaPipe (hand detection)
- OpenCV (video capture)
- Requests (HTTP client)

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't connect to server | Check server is running on port 3000 |
| Camera not showing | Check browser permissions, try incognito mode |
| Poses not detected | Ensure Python client is running |
| Predictions don't match | Adjust confidence threshold (0.7 minimum) |
| Timer not counting | Check if `timerRunning` is true in debug console |
| Spectator shows wrong info | Refresh page every 30 seconds |

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console for errors (F12)
3. Check server console output
4. Use Debug Console to inspect game state

## 📄 License

This project is for educational purposes.

---

**Happy gaming! 🎮🖐️**
