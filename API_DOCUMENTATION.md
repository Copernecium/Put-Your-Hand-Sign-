# Hand Pose Game - Complete API Documentation

## Base URL
```
http://localhost:3000
```

## Protocol
All requests use HTTP POST/GET with JSON bodies and responses.

---

## 📤 Player Endpoints - Sending Data

### 1. Send Pose Prediction (Player 1)

**Endpoint**: `POST /api/player1/pose`

**Description**: Send hand pose prediction from detection system to server

**Request Body**:
```json
{
  "prediction": "Peace Sign",
  "confidence": 0.95,
  "cameraFrame": null
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prediction | string | Yes | Name of detected pose (e.g., "Peace Sign", "Thumbs Up") |
| confidence | number | Yes | Confidence score (0.0 to 1.0) |
| cameraFrame | string | No | Base64-encoded image frame for debugging |

**Response**:
```json
{
  "success": true
}
```

**Example (Python)**:
```python
import requests

response = requests.post(
    'http://localhost:3000/api/player1/pose',
    json={
        'prediction': 'Peace Sign',
        'confidence': 0.92,
        'cameraFrame': None
    }
)
print(response.json())  # {'success': True}
```

**Example (JavaScript)**:
```javascript
fetch('/api/player1/pose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prediction: 'Peace Sign',
        confidence: 0.92,
        cameraFrame: null
    })
}).then(r => r.json()).then(data => console.log(data));
```

---

### 2. Send Pose Prediction (Player 2)

**Endpoint**: `POST /api/player2/pose`

Same as Player 1, but for Player 2. See above.

---

### 3. Set Ready Status (Player 1)

**Endpoint**: `POST /api/player1/ready`

**Description**: Indicate if Player 1 is ready to play

**Request Body**:
```json
{
  "ready": true
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ready | boolean | Yes | true = ready, false = not ready |

**Response**:
```json
{
  "success": true,
  "gameActive": false
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether request succeeded |
| gameActive | boolean | Is game currently running? |

**Notes**:
- When both players are ready AND game is not active, game automatically starts
- Timer begins and task is assigned

**Example (Python)**:
```python
requests.post(
    'http://localhost:3000/api/player1/ready',
    json={'ready': True}
)
```

---

### 4. Set Ready Status (Player 2)

**Endpoint**: `POST /api/player2/ready`

Same as Player 1, but for Player 2. See above.

---

## 📥 Read/Monitor Endpoints

### 5. Get Complete Game State

**Endpoint**: `GET /api/debug/state`

**Description**: Get the complete current game state (all data)

**Request**: No body required

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
    "ready": false,
    "score": 1,
    "prediction": null,
    "poseConfidence": 0,
    "cameraFrame": null
  },
  "gameActive": true,
  "currentTask": {
    "id": 1,
    "name": "Peace Sign",
    "image": "/images/peace-sign.png",
    "description": "Two fingers up, peace gesture"
  },
  "timer": 15,
  "timerRunning": true,
  "taskImage": null,
  "winner": null,
  "roundComplete": false
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| player1 | object | Player 1 state |
| player2 | object | Player 2 state |
| gameActive | boolean | Is game currently active? |
| currentTask | object | Current task to perform |
| timer | number | Seconds remaining |
| timerRunning | boolean | Is timer counting down? |
| winner | string | 'player1', 'player2', 'tie', or null |
| roundComplete | boolean | Did round finish? |

**Example (JavaScript)**:
```javascript
async function getGameState() {
    const response = await fetch('/api/debug/state');
    const state = await response.json();
    console.log('Player 1 Score:', state.player1.score);
    console.log('Current Task:', state.currentTask.name);
    console.log('Timer:', state.timer);
}
```

---

### 6. Get Spectator View (Read-Only)

**Endpoint**: `GET /api/spectator/state`

**Description**: Get game state visible to spectators (no sensitive data)

**Request**: No body required

**Response**:
```json
{
  "player1": {
    "score": 2,
    "prediction": "Peace Sign",
    "poseConfidence": 0.92,
    "ready": true
  },
  "player2": {
    "score": 1,
    "prediction": null,
    "poseConfidence": 0,
    "ready": false
  },
  "gameActive": true,
  "currentTask": {
    "id": 1,
    "name": "Peace Sign",
    "image": "/images/peace-sign.png",
    "description": "Two fingers up, peace gesture"
  },
  "timer": 15,
  "timerRunning": true,
  "roundComplete": false,
  "winner": null
}
```

**Notes**:
- Subset of full game state
- Safe to expose publicly
- Used by spectator.html

---

### 7. Get Available Tasks (Debug)

**Endpoint**: `GET /api/debug/tasks`

**Description**: Get list of all available hand pose tasks

**Request**: No body required

**Response**:
```json
[
  {
    "id": 1,
    "name": "Peace Sign",
    "image": "/images/peace-sign.png",
    "description": "Two fingers up, peace gesture"
  },
  {
    "id": 2,
    "name": "Thumbs Up",
    "image": "/images/thumbs-up.png",
    "description": "Thumb pointing upward"
  },
  ...
]
```

---

## ⚙️ Control Endpoints - Game Control

### 8. Start Game

**Endpoint**: `POST /api/debug/game/start`

**Description**: Start a new game round (both players must be ready)

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true
}
```

Or if players not ready:
```json
{
  "success": false,
  "error": "Both players must be ready"
}
```

**Notes**:
- Requires both players to have `ready: true`
- Automatically assigns task and starts timer
- Usually called automatically when both players click ready
- Can be called manually from debug console

**Example (JavaScript)**:
```javascript
fetch('/api/debug/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
}).then(r => r.json()).then(data => {
    if (data.success) console.log('Game started!');
    else console.log('Error:', data.error);
});
```

---

### 9. Reset Game

**Endpoint**: `POST /api/debug/game/reset`

**Description**: Reset game to initial state

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true
}
```

**What it resets**:
- Both players: ready = false, score = 0
- Game: gameActive = false
- Timer: timer = 0, timerRunning = false
- Task: currentTask = null
- Round: roundComplete = false, winner = null

**Example (JavaScript)**:
```javascript
fetch('/api/debug/game/reset', { method: 'POST' });
```

---

### 10. Complete Round Manually

**Endpoint**: `POST /api/debug/round/complete`

**Description**: Force current round to end

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true
}
```

**Effects**:
- gameActive = false
- timerRunning = false
- roundComplete = true
- Shows winner announcement

---

## ⏱️ Timer Control Endpoints

### 11. Set Timer Duration

**Endpoint**: `POST /api/debug/timer/set`

**Description**: Set countdown timer duration

**Request Body**:
```json
{
  "seconds": 45
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| seconds | number | Yes | Duration in seconds (0-300) |

**Response**:
```json
{
  "success": true
}
```

**Example (JavaScript)**:
```javascript
fetch('/api/debug/timer/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds: 30 })
});
```

---

### 12. Start Timer

**Endpoint**: `POST /api/debug/timer/start`

**Description**: Start the countdown timer

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true
}
```

**Notes**:
- Timer decrements every second
- Usually starts automatically with game
- Can be started manually for testing

---

### 13. Stop Timer

**Endpoint**: `POST /api/debug/timer/stop`

**Description**: Pause the countdown timer

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "success": true
}
```

---

## 👤 Player Management Endpoints

### 14. Set Player Ready Status (Debug)

**Endpoint**: `POST /api/debug/player/ready/:playerNum`

**Description**: Manually set player ready status without player clicking button

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| playerNum | string | "1" or "2" |

**Request Body**:
```json
{
  "ready": true
}
```

**Response**:
```json
{
  "success": true
}
```

**Example (JavaScript)**:
```javascript
// Set Player 1 to ready
fetch('/api/debug/player/ready/1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ready: true })
});

// Set Player 2 to not ready
fetch('/api/debug/player/ready/2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ready: false })
});
```

---

## 📚 Complete Usage Example

```javascript
// Example: Simulate a complete game session

async function playGame() {
    const server = 'http://localhost:3000';
    
    // 1. Set both players ready
    await fetch(`${server}/api/debug/player/ready/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready: true })
    });
    
    await fetch(`${server}/api/debug/player/ready/2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready: true })
    });
    
    // 2. Start game
    await fetch(`${server}/api/debug/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    });
    
    // 3. Get current state
    let response = await fetch(`${server}/api/debug/state`);
    let state = await response.json();
    console.log('Task:', state.currentTask.name);
    console.log('Timer:', state.timer);
    
    // 4. Send pose prediction for player 1
    await fetch(`${server}/api/player1/pose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prediction: state.currentTask.name,
            confidence: 0.95,
            cameraFrame: null
        })
    });
    
    // 5. Check result
    response = await fetch(`${server}/api/spectator/state`);
    state = await response.json();
    console.log('Player 1 Score:', state.player1.score);
    console.log('Winner:', state.winner);
}

playGame();
```

---

## 🔄 Polling Pattern (Recommended)

Most clients should poll the state endpoint periodically:

```javascript
// Poll every 500ms
const pollInterval = setInterval(async () => {
    try {
        const response = await fetch('/api/debug/state');
        const state = await response.json();
        
        // Update UI with new state
        updateUI(state);
    } catch (error) {
        console.error('Poll error:', error);
    }
}, 500);

// Stop polling
// clearInterval(pollInterval);
```

---

## ✅ Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Request processed |
| 400 | Bad Request - Invalid data |
| 404 | Not Found - Endpoint doesn't exist |
| 500 | Server Error - Internal error |

---

## ⚠️ Error Handling

Always check response:

```javascript
async function safeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        return { success: false, error: error.message };
    }
}

// Usage
const result = await safeRequest('/api/debug/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
});
```

---

## 🔌 Python Requests Examples

```python
import requests
import json

BASE_URL = 'http://localhost:3000'

# Send pose
def send_pose(player_id, pose_name, confidence):
    response = requests.post(
        f'{BASE_URL}/api/{player_id}/pose',
        json={
            'prediction': pose_name,
            'confidence': confidence,
            'cameraFrame': None
        }
    )
    return response.json()

# Get game state
def get_game_state():
    response = requests.get(f'{BASE_URL}/api/debug/state')
    return response.json()

# Set player ready
def set_player_ready(player_num, ready):
    response = requests.post(
        f'{BASE_URL}/api/debug/player/ready/{player_num}',
        json={'ready': ready}
    )
    return response.json()

# Start game
def start_game():
    response = requests.post(
        f'{BASE_URL}/api/debug/game/start',
        json={}
    )
    return response.json()

# Reset game
def reset_game():
    response = requests.post(
        f'{BASE_URL}/api/debug/game/reset',
        json={}
    )
    return response.json()

# Set timer
def set_timer(seconds):
    response = requests.post(
        f'{BASE_URL}/api/debug/timer/set',
        json={'seconds': seconds}
    )
    return response.json()

# Usage
if __name__ == '__main__':
    # Ready up
    print(set_player_ready(1, True))
    print(set_player_ready(2, True))
    
    # Start game
    print(start_game())
    
    # Get state
    state = get_game_state()
    print(f"Task: {state['currentTask']['name']}")
    print(f"Timer: {state['timer']}")
    
    # Send pose
    print(send_pose('player1', state['currentTask']['name'], 0.95))
```

---

## 📊 Rate Limiting

Currently **no rate limiting** - be respectful with requests.

Recommended:
- Player pose updates: 10-20 times per second
- State polling: 2 times per second (500ms interval)
- Debug operations: As needed (manual)

---

## 🔐 Security Notes

⚠️ **NO AUTHENTICATION** - Any client can:
- Start/stop game
- Modify timer
- Send arbitrary poses
- See all game state

For production:
1. Add JWT authentication
2. Add request rate limiting
3. Validate all inputs
4. Use HTTPS
5. Enable CORS restrictions

---

## 📞 API Support

For API issues:
1. Check browser console (F12)
2. Check server logs in terminal
3. Verify server running: `npm start`
4. Test with curl:
   ```bash
   curl -X GET http://localhost:3000/api/debug/state
   ```

---

## 📝 Summary of All Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/player1/pose | Send P1 pose prediction |
| POST | /api/player2/pose | Send P2 pose prediction |
| POST | /api/player1/ready | Set P1 ready status |
| POST | /api/player2/ready | Set P2 ready status |
| GET | /api/debug/state | Get full game state |
| GET | /api/spectator/state | Get spectator view |
| GET | /api/debug/tasks | Get task list |
| POST | /api/debug/game/start | Start game |
| POST | /api/debug/game/reset | Reset game |
| POST | /api/debug/round/complete | End round |
| POST | /api/debug/timer/set | Set timer duration |
| POST | /api/debug/timer/start | Start timer |
| POST | /api/debug/timer/stop | Stop timer |
| POST | /api/debug/player/ready/:id | Set player ready (debug) |
