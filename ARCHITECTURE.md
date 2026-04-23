# Hand Pose Game - Architecture & Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     HAND POSE GAME SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐                                     ┌──────────────┐
│   PLAYER 1   │                                     │   PLAYER 2   │
│              │                                     │              │
│ • Camera     │                                     │ • Camera     │
│ • Ready Btn  │                                     │ • Ready Btn  │
│ • Score      │                                     │ • Score      │
│ • Timer      │                                     │ • Timer      │
└──────┬───────┘                                     └──────┬───────┘
       │                                                    │
       ├─────────────────────────┬────────────────────────┤
       │                         │                        │
       ▼                         ▼                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   WEB BROWSER                               │
│  (HTML/CSS/JavaScript - WebSocket polling every 500ms)     │
└──────────────────────────────────────────────────────────────┘
       │                         │                        │
       │                         ▼                        │
       │              ┌──────────────────────┐            │
       │              │  SPECTATOR VIEW      │            │
       │              │  (Read-only monitor) │            │
       │              └──────────────────────┘            │
       │                                                   │
       │              ┌──────────────────────┐            │
       │              │   DEBUG CONSOLE      │            │
       │              │  (Game control)      │            │
       │              └──────────────────────┘            │
       │                                                   │
       └─────────────────────────┬─────────────────────────┘
                                 │ HTTP REST API (JSON)
                                 ▼
                    ┌──────────────────────────┐
                    │  NODE.JS/EXPRESS SERVER  │
                    │  (localhost:3000)        │
                    └──────────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │  GAME STATE MANAGER  │   │  GAME LOGIC ENGINE   │
        │                      │   │                      │
        │ • Player ready flags │   │ • Pose matching      │
        │ • Scores             │   │ • Scoring rules      │
        │ • Current task       │   │ • Timer management   │
        │ • Predictions        │   │ • Winner detection   │
        │ • Timer value        │   │                      │
        └──────────────────────┘   └──────────────────────┘

                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │  PYTHON CLIENT 1     │   │  PYTHON CLIENT 2     │
        │ (Hand detection)     │   │ (Hand detection)     │
        │                      │   │                      │
        │ • Webcam capture     │   │ • Webcam capture     │
        │ • MediaPipe pose     │   │ • MediaPipe pose     │
        │ • Classification     │   │ • Classification     │
        │ • Send to server     │   │ • Send to server     │
        └──────────────────────┘   └──────────────────────┘
```

## Component Breakdown

### 1. Frontend (Browser - HTML/CSS/JavaScript)

#### Player Pages (`player1.html`, `player2.html`)
- **Camera Display**: Real-time video feed from webcam
- **Ready Button**: Toggle player ready status
- **Score Display**: Current round score
- **Timer Display**: Countdown from game start
- **Prediction Display**: Current hand pose prediction
- **Status Messages**: Feedback to player

**Files**:
- `player1.html` - Player 1 interface
- `player2.html` - Player 2 interface
- `player.js` - Shared logic for both
- `styles.css` - Styling

**Polling Interval**: Every 500ms updates game state

#### Spectator View (`spectator.html`)
- **Task Display**: Shows current hand pose task
- **Timer Display**: Large countdown
- **Player Panels**: Score, prediction, confidence for each
- **Winner Announcement**: Displays winner when round ends
- **Status**: Game state description

**Features**:
- Real-time updates every 1000ms
- VS layout comparing both players
- Color-coded feedback

#### Debug Console (`debug.html`)
- **Game Control**: Start/Reset/Complete round buttons
- **Timer Control**: Set, start, stop timer
- **Player Control**: Set ready/unready for both players
- **State Monitor**: View all game variables
- **Pose Simulator**: Send test poses without Python
- **Activity Log**: Timestamped action log

**Features**:
- Real-time state monitoring every 500ms
- Manual pose simulation for testing
- Complete game control
- Error logging

### 2. Backend (Node.js/Express)

#### Server File: `server.js`

**Game State Object**:
```javascript
{
  player1: {
    id: 'player1',
    ready: boolean,          // Is player ready?
    score: number,           // Points this match
    prediction: string,      // Last detected pose
    poseConfidence: number,  // Confidence 0-1
    cameraFrame: null        // Optional: base64 frame
  },
  player2: { ... },          // Same structure
  gameActive: boolean,       // Is game running?
  currentTask: object,       // Current task { name, image, description }
  timer: number,            // Seconds remaining
  timerRunning: boolean,    // Is countdown active?
  taskImage: string,        // Task image URL
  winner: string,           // 'player1', 'player2', 'tie', or null
  roundComplete: boolean    // Did round finish?
}
```

**Key Functions**:
- `initializeGame()` - Reset game to initial state
- `startGameRound()` - Start new round with new task
- `getNextTask()` - Get next task from task list
- `predictionMatches()` - Check if prediction matches task
- Timer interval - Decrements every 1 second

**API Routes**:
```
POST /api/player1/ready          - Set player 1 ready
POST /api/player1/pose           - Send pose prediction
POST /api/player2/ready          - Set player 2 ready
POST /api/player2/pose           - Send pose prediction

GET  /api/debug/state            - Get full game state
GET  /api/spectator/state        - Get spectator view
POST /api/debug/game/start       - Start game
POST /api/debug/game/reset       - Reset game
POST /api/debug/round/complete   - End round
POST /api/debug/timer/set        - Set timer duration
POST /api/debug/timer/start      - Start countdown
POST /api/debug/timer/stop       - Stop countdown
POST /api/debug/player/ready/:id - Toggle player ready
```

### 3. Python Pose Detection (`pose_detection_client.py`)

**Class: `HandPoseDetector`**

**Methods**:
- `__init__()` - Initialize MediaPipe hand detector
- `detect_pose(frame)` - Process frame, return prediction
- `_classify_pose(landmarks)` - Classify landmarks to pose
- `_encode_frame(frame)` - Convert frame to base64
- `send_pose_to_server()` - POST prediction to server
- `run_detection_client()` - Main loop for specific player

**Detection Flow**:
```
1. Capture frame from webcam
2. Convert BGR → RGB
3. Process with MediaPipe hands
4. Extract landmarks (21 points per hand)
5. Classify pose from landmarks
6. Send to server: {prediction, confidence, frame}
7. Repeat every 100ms
```

**Pose Classification** (simplified):
- Detects which fingers are "up" (above palm)
- Counts extended fingers
- Checks finger distances for specific poses
- Returns pose name + confidence

## Game Flow Diagram

```
START
  │
  ▼
┌─────────────────────────────────────┐
│  WAITING STATE                      │
│  - Player 1: Not Ready              │
│  - Player 2: Not Ready              │
│  - Timer: 0                         │
│  - Game: Inactive                   │
└────────────────┬────────────────────┘
                 │
         Player clicks Ready
                 │
                 ▼
┌─────────────────────────────────────┐
│  ONE PLAYER READY                   │
│  - Waiting for opponent              │
│  - First player is marked Ready      │
└────────────────┬────────────────────┘
                 │
         Other Player clicks Ready
                 │
                 ▼
┌─────────────────────────────────────┐
│  BOTH READY → AUTO START GAME       │
│  - New task assigned                │
│  - Timer starts (30s)               │
│  - Game Active = true               │
└────────────────┬────────────────────┘
                 │
         Both players see:
         • Task name & image
         • Countdown timer
         • "Perform this pose!"
                 │
                 ▼
┌─────────────────────────────────────┐
│  GAME ACTIVE - AWAITING POSE        │
│  - Python sends pose predictions    │
│  - Server checks match              │
│  - Timer counting down              │
└────────────────┬────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
Player 1 matches        Player 2 matches
    │                         │
    ▼                         ▼
Player 1 score++         Player 2 score++
                 │
                 ▼
┌─────────────────────────────────────┐
│  ROUND COMPLETE                     │
│  - Show winner announcement         │
│  - Show score update                │
│  - Spectator sees result            │
│  - Wait 2-3 seconds                 │
└────────────────┬────────────────────┘
                 │
         Back to WAITING STATE
                 │
              or GAME OVER
```

## Data Flow Example

### Successful Pose Match:

```
1. Player 1 performs "Peace Sign"
   ↓
2. Python script captures video frame
   ↓
3. MediaPipe detects hand landmarks
   ↓
4. Classification: "Peace Sign" (confidence: 0.92)
   ↓
5. POST /api/player1/pose
   {
     "prediction": "Peace Sign",
     "confidence": 0.92,
     "cameraFrame": "base64data..."
   }
   ↓
6. Server receives request
   ↓
7. Current task = "Peace Sign" ✓ MATCH!
   ↓
8. player1.score++
   ↓
9. Game stops
   ↓
10. Front-end polls /api/debug/state
    ↓
11. Player 1 page shows: "🎉 You Won This Round!"
    ↓
12. Spectator page shows: "Player 1 Wins This Round! 🎉"
```

## API Request/Response Flow

### Player Sends Pose:

**Request**:
```
POST /api/player1/pose
Content-Type: application/json

{
  "prediction": "Peace Sign",
  "confidence": 0.92,
  "cameraFrame": null
}
```

**Response**:
```json
{
  "success": true
}
```

### Client Polls for State:

**Request**:
```
GET /api/debug/state
```

**Response**:
```json
{
  "player1": {
    "id": "player1",
    "ready": true,
    "score": 2,
    "prediction": "Peace Sign",
    "poseConfidence": 0.92,
    "cameraFrame": null
  },
  "player2": {
    "id": "player2",
    "ready": true,
    "score": 1,
    "prediction": null,
    "poseConfidence": 0,
    "cameraFrame": null
  },
  "gameActive": false,
  "currentTask": {
    "id": 1,
    "name": "Peace Sign",
    "image": "/images/peace-sign.png",
    "description": "Two fingers up, peace gesture"
  },
  "timer": 0,
  "timerRunning": false,
  "taskImage": null,
  "winner": "player1",
  "roundComplete": true
}
```

## Performance Considerations

### Polling Strategy
- **Frontend**: 500ms update interval (not too fast, not too slow)
- **Game Loop**: 1000ms read + 1000ms timer tick
- **Python**: 100ms frame capture → 100-200ms pose detection

### Optimization
- Base64 encoding is optional (can be disabled)
- JSON payloads are small (< 1KB)
- Server is stateless (single game state object)
- No database required

### Scalability Limits
- Current design: 1 game instance per server
- Can support ~100+ concurrent browsers polling
- Python clients can run on separate machines

## Security Notes

⚠️ **Current Design is NOT production-ready**:
- No authentication
- No rate limiting
- No input validation
- Accessible to anyone on network

**To make production-ready**:
1. Add JWT authentication
2. Add request rate limiting
3. Validate all inputs
4. Implement HTTPS
5. Add CORS restrictions
6. Add logging & monitoring

## Customization Points

1. **Add Tasks**: Modify `tasks` array in `server.js`
2. **Change Rules**: Edit `predictionMatches()` function
3. **Adjust Timer**: Change `gameState.timer = 30` in `startGameRound()`
4. **New Poses**: Add classification logic to `_classify_pose()` in Python
5. **Scoring**: Modify player score increment logic
6. **Confidence Threshold**: Change `if (confidence < 0.7)` check

## Testing Strategy

### Unit Test (Debug Console):
1. Manually set players ready
2. Use pose simulator
3. Verify scoring
4. Test timer
5. Check state changes

### Integration Test:
1. Run real Python clients
2. Test with actual hand poses
3. Verify API calls
4. Check broadcaster updates

### Load Test:
1. Open multiple spectator windows
2. Monitor response times
3. Check server logs
4. Verify no lag

## Deployment

### Local Development:
```bash
npm start
python pose_detection_client.py --player player1
python pose_detection_client.py --player player2
```

### Same Network:
1. Find server machine IP: `ipconfig`
2. Run server on that machine
3. Access from other machines: `http://<ip>:3000`

### Internet/Cloud:
1. Deploy Node.js to cloud (Heroku, AWS, DigitalOcean)
2. Update Python client server URL
3. Add security (authentication, HTTPS)
4. Consider using WebSocket instead of polling

## Troubleshooting Guide

### Server Issues
- Check port 3000 not in use
- Verify Node.js installed
- Check for errors in console

### Browser Issues
- Clear cache (Ctrl+Shift+Delete)
- Try incognito mode
- Check console for errors (F12)
- Verify server URL accessible

### Python Issues
- Check MediaPipe installed
- Check camera permissions
- Verify server URL is correct
- Look for connection errors

### Game Logic Issues
- Use debug console to inspect state
- Check pose matching threshold
- Verify timer is running
- Check predictions are being sent
