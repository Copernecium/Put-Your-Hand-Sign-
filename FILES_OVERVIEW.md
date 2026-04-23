# 📦 Hand Pose Game - Complete Project Files

## Project Summary

A complete hand pose recognition game system where two players compete to perform hand gestures faster and more accurately than their opponent. The system includes a web interface for players, spectators, and game debugging, plus Python integration for hand pose detection.

---

## 📁 File Structure

```
PutYourHandSign/
├── 📄 package.json                    # Node.js dependencies and scripts
├── 📄 server.js                       # Main game server (Express.js)
├── 📄 pose_detection_client.py        # Python hand pose detector with MediaPipe
├── 📄 custom_detection_examples.py    # Examples for custom detection methods
├── 📄 start-game.bat                  # Windows batch file to start server
├── 📄 run-detection.bat               # Windows batch file to run Python detection
├── 📄 .gitignore                      # Git ignore rules
│
├── 📚 Documentation Files:
├── 📄 README.md                       # Comprehensive setup and usage guide
├── 📄 QUICKSTART.md                   # Quick start (5 minute setup)
├── 📄 ARCHITECTURE.md                 # System design and architecture
├── 📄 API_DOCUMENTATION.md            # Complete API reference
│
└── 📁 public/                         # Web application files
    ├── 📄 index.html                  # Home page / navigation hub
    ├── 📄 player1.html                # Player 1 interface
    ├── 📄 player2.html                # Player 2 interface
    ├── 📄 spectator.html              # Spectator view
    ├── 📄 debug.html                  # Debug console / game control
    ├── 📄 player.js                   # Player page logic
    ├── 📄 styles.css                  # All styling and design
    │
    └── 📁 images/                     # Placeholder for task images
```

---

## 📋 File Details

### Core Server Files

#### `package.json`
- **Purpose**: Node.js project configuration and dependencies
- **Contains**: Express, CORS, body-parser packages
- **Run**: `npm install` to install dependencies, `npm start` to run server
- **Size**: ~300 bytes

#### `server.js`
- **Purpose**: Main game server with all game logic and API endpoints
- **Key Features**:
  - Game state management
  - All API endpoints (player poses, ready status, game control)
  - Timer management
  - Score calculation and winner detection
  - Task assignment
- **Listens on**: http://localhost:3000
- **Key Exports**: None (runs as main application)
- **Size**: ~8 KB

---

### Python/Detection Files

#### `pose_detection_client.py`
- **Purpose**: Hand pose detection using MediaPipe
- **Features**:
  - Real-time webcam capture
  - Hand landmark detection
  - Pose classification (8 predefined poses)
  - Sending predictions to server via API
  - Command-line interface
- **Dependencies**: mediapipe, opencv-python, requests
- **Usage**: `python pose_detection_client.py --player player1`
- **Size**: ~9 KB

#### `custom_detection_examples.py`
- **Purpose**: Examples for integrating custom pose detection systems
- **Contains Examples For**:
  1. Custom OpenCV models
  2. TensorFlow/Keras models
  3. PyTorch models
  4. External API-based detection
  5. ONNX models
  6. Rule-based detection
  7. Ensemble multi-model
- **For Reference**: Shows how to adapt your own detection system
- **Usage**: Reference code, not meant to be run directly
- **Size**: ~12 KB

---

### Windows Batch Files

#### `start-game.bat`
- **Purpose**: One-click startup script for Windows
- **Does**:
  1. Checks if Node.js is installed
  2. Installs npm dependencies if needed
  3. Displays server URLs
  4. Starts server on port 3000
- **Usage**: Double-click in Windows Explorer
- **Size**: ~1.5 KB

#### `run-detection.bat`
- **Purpose**: One-click startup for Python pose detection on Windows
- **Does**:
  1. Checks if Python is installed
  2. Installs Python dependencies
  3. Runs pose detection client
- **Usage**: `run-detection.bat player1` or `run-detection.bat player2`
- **Size**: ~1.5 KB

---

### Documentation Files

#### `README.md`
- **Purpose**: Complete project documentation
- **Sections**:
  - Features overview
  - Quick start (5 minutes)
  - Setup instructions
  - How to play (for players, spectators, debuggers)
  - Hand pose detection integration guide
  - Configuration and customization
  - Troubleshooting
  - Multi-device setup
- **Length**: ~600 lines
- **For**: Anyone setting up and using the system

#### `QUICKSTART.md`
- **Purpose**: Ultra-fast setup guide
- **Sections**:
  - 5-minute setup
  - How to play
  - File structure
  - Testing without camera
  - Troubleshooting
- **Length**: ~150 lines
- **For**: Getting started quickly

#### `ARCHITECTURE.md`
- **Purpose**: Deep-dive into system design
- **Sections**:
  - System overview diagram
  - Component breakdown
  - Game flow diagrams
  - Data flow examples
  - API request/response examples
  - Performance considerations
  - Security notes
  - Customization points
- **Length**: ~500 lines
- **For**: Developers understanding the system

#### `API_DOCUMENTATION.md`
- **Purpose**: Complete API reference
- **Covers**:
  - All 14 API endpoints
  - Request/response examples
  - Parameter descriptions
  - Error handling
  - Usage examples (JavaScript & Python)
  - Rate limiting notes
- **Length**: ~400 lines
- **For**: Integrating custom clients or detection

#### `.gitignore`
- **Purpose**: Git ignore rules
- **Excludes**:
  - node_modules/, __pycache__/
  - .venv/, .env files
  - IDE settings (.vscode/, .idea/)
  - Log files, cache files
- **Size**: ~20 lines

---

### Web Application Files (public/)

#### `index.html`
- **Purpose**: Home page and navigation hub
- **Features**:
  - Welcome message
  - Navigation cards to all 4 pages
  - Project description
- **Styling**: Responsive grid layout
- **Size**: ~2 KB

#### `player1.html` & `player2.html`
- **Purpose**: Player interface for each player
- **Features**:
  - Video camera display
  - Ready button
  - Score display
  - Timer display
  - Current task display
  - Status messages
- **JavaScript**: Uses `player.js` class
- **Styling**: Responsive, mobile-friendly
- **Size**: ~2 KB each

#### `spectator.html`
- **Purpose**: Real-time spectator view
- **Features**:
  - Current task display
  - Large timer countdown
  - Both players compared side-by-side
  - Live predictions and confidence scores
  - Winner announcement
  - Game status updates
- **Updates**: Every 1000ms (1 second)
- **Size**: ~3 KB

#### `debug.html`
- **Purpose**: Game control and debugging console
- **Features**:
  - Game control buttons (start, reset, complete round)
  - Timer control (set, start, stop)
  - Player ready status toggle
  - Live game state monitoring
  - Pose simulator (for testing)
  - Activity log with timestamps
- **Updates**: Every 500ms
- **Size**: ~5 KB

#### `player.js`
- **Purpose**: Shared logic for both player pages
- **Class**: `PlayerClient`
- **Features**:
  - Webcam access and video stream
  - Ready status management
  - Frame capture and sending to server
  - Game state polling
  - Status messages and feedback
  - Score and timer display updates
- **Methods**:
  - `toggleReady()` - Toggle ready status
  - `toggleCamera()` - Start/stop camera
  - `startFrameCapture()` - Capture frames
  - `updateGameState()` - Fetch and display current state
- **Size**: ~3 KB

#### `styles.css`
- **Purpose**: All styling and design for all pages
- **Features**:
  - Responsive grid layouts
  - Color gradients
  - Hover animations
  - Mobile-friendly breakpoints
  - Button styles
  - Status badges
  - Game cards
- **CSS Variables**: Color scheme defined at top
- **Media Queries**: Mobile, tablet, desktop
- **Size**: ~12 KB

#### `images/` directory
- **Purpose**: Placeholder for task images
- **Should contain**:
  - peace-sign.png
  - thumbs-up.png
  - rock-sign.png
  - ok-sign.png
  - open-hand.png
  - fist.png
  - point.png
  - victory.png
- **Current**: Empty placeholder
- **Note**: Images referenced in tasks array but not included

---

## 🚀 How Files Work Together

```
User Opens Browser
        │
        ▼
    index.html
    (Navigation Hub)
        │
    ┌───┼───┬────────┐
    │   │   │        │
    ▼   ▼   ▼        ▼
player1 player2 spectator debug
.html   .html   .html     .html
    │   │       │         │
    └───┴───────┴────┬────┘
                    │
            ┌───────▼──────────┐
            │   player.js      │
            │ (GameClient      │
            │  Logic)          │
            └───────┬──────────┘
                    │ (Polling every 500ms)
                    │
                    ▼
        ┌─────────────────────────┐
        │      server.js          │
        │  (Game Logic & State)   │
        │      (Node.js)          │
        └──────────┬──────────────┘
                   │ (HTTP REST API)
                   │
        ┌──────────┴─────────────┐
        │                        │
        ▼                        ▼
pose_detection_client.py   (Game State)
 (Python MediaPipe)         Database
```

---

## 📊 Statistics

| Category | Count |
|----------|-------|
| **Web Files** | 8 files |
| **Python Files** | 2 files |
| **Documentation** | 4 files |
| **Batch/Config** | 3 files |
| **Total Files** | 17 files |
| **Total Size** | ~90 KB |

| Component | Lines of Code |
|-----------|---------------|
| server.js | ~350 |
| styles.css | ~400 |
| player1.html | ~100 |
| player2.html | ~100 |
| spectator.html | ~150 |
| debug.html | ~200 |
| player.js | ~150 |
| pose_detection_client.py | ~300 |
| custom_detection_examples.py | ~400 |
| **Total** | **~2,150 lines** |

---

## 🔄 Development Workflow

### Setup Phase
1. Install Node.js
2. Install Python 3.7+
3. Run `npm install`
4. Run `pip install mediapipe opencv-python requests`

### Development Phase
**Terminal 1**: Start server
```bash
npm start
```

**Terminal 2**: Run Python detection (Player 1)
```bash
python pose_detection_client.py --player player1
```

**Terminal 3**: Run Python detection (Player 2)
```bash
python pose_detection_client.py --player player2
```

### Browser Phase
- Open 5 browser windows to each page
- Test game flow
- Monitor debug console

---

## ✅ Features Implemented

- ✅ Multi-page web application (4 pages)
- ✅ Real-time camera streaming
- ✅ Ready button for player synchronization
- ✅ Timer management (countdown)
- ✅ Score tracking
- ✅ Task assignment
- ✅ Pose matching logic
- ✅ Real-time spectator view
- ✅ Debug console with game control
- ✅ Python pose detection integration
- ✅ API endpoints for all features
- ✅ Responsive design
- ✅ State management
- ✅ Error handling
- ✅ Comprehensive documentation

---

## 🎯 Next Steps

After downloading, follow this order:

1. **Read** [QUICKSTART.md](QUICKSTART.md) (5 minutes)
2. **Install** dependencies (2 minutes)
3. **Start** the server (`npm start`)
4. **Open** http://localhost:3000 in browser
5. **Run** Python detection (`python pose_detection_client.py --player player1`)
6. **Play** the game!
7. **Reference** [API_DOCUMENTATION.md](API_DOCUMENTATION.md) as needed
8. **Customize** with your own detection system using [custom_detection_examples.py](custom_detection_examples.py)

---

## 📞 File Organization Tips

- **For Setup**: Read QUICKSTART.md
- **For Usage**: See README.md
- **For Development**: See ARCHITECTURE.md
- **For API Integration**: See API_DOCUMENTATION.md
- **For Custom Detection**: See custom_detection_examples.py
- **For Game Logic**: Read server.js

---

## ⚖️ License

Educational project - use freely for learning and research.

---

**Total Package Size**: ~90 KB
**Setup Time**: ~10 minutes
**Run Time**: Unlimited
**Players**: 2 + spectators
**Requirements**: Node.js, Python 3.7+, Webcam, Modern Browser

---

*Generated for Hand Pose Game Project - HRI*
