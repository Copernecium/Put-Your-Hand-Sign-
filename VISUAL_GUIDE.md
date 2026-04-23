# Hand Pose Game - Visual System Overview

## 🎮 Game Flow Diagram

```
                            GAME START
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
              PLAYER 1      PLAYER 2    SPECTATOR
              (Ready)       (Ready)       (Watch)
                  │             │             │
                  └─────────────┼─────────────┘
                                │
                          Click "Ready"
                                │
                    ┌───────────┴───────────┐
                    │                       │
                 BOTH READY?
                 ├── NO: Waiting
                 └── YES: ▼
                        GAME STARTS
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    TASK ASSIGNED    TIMER BEGINS           SCORE: 0-0
    (Peace Sign)         30s                     │
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    PLAYER 1            PYTHON              PLAYER 2
   PERFORMS           DETECTS               PERFORMS
    (Camera)         (MediaPipe)             (Camera)
        │                   │                   │
        └─────► Detection ◄─┴─────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                MATCH?           (continues)
                ├── YES
                │    └──► SCORE UPDATE
                │         Player X: +1
                │              │
                │         ROUND ENDS
                │              │
                ├── NO
                └──► TIMER RUNS OUT?
                     │
                     ├── YES: Round Ends
                     └── NO: Back to "PERFORMS"


┌──────────────────────────────────────────────────┐
│         ROUND COMPLETE - SHOW RESULT             │
│                                                  │
│  SPECTATOR SEES:    🎉 Player 1 Wins! 🎉        │
│  SCORES:            Player 1: 3  Player 2: 2    │
│                                                  │
│  ◄── Back to Start for Next Round ──►           │
└──────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture Diagram

```
                    ╔════════════════════════════════╗
                    ║   BROWSER (CLIENT SIDE)        ║
                    ╚════════════════════════════════╝
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
        ┌───▼────┐       ┌───▼────┐       ┌───▼────┐
        │Player 1│       │Player 2│       │Spectator
        │ Page   │       │ Page   │       │ Page
        │(HTML)  │       │(HTML)  │       │(HTML)
        └───┬────┘       └───┬────┘       └───┬────┘
            │                 │                 │
            │ All use same JavaScript class     │
            │        (player.js)                │
            │                 │                 │
            │     ┌───────────┼───────────┐    │
            │     │      Debug Console     │    │
            │     │     (Full Control)     │    │
            │     └───────────┬───────────┘    │
            │                 │                 │
            ├─────────────────┼─────────────────┤
            │   HTTP REST API (JSON)            │
            │   Polling every 500ms             │
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                    ╔═════════▼═════════════════════╗
                    ║  NODE.JS/EXPRESS SERVER       ║
                    ║     (localhost:3000)          ║
                    ╚═════════╤═════════════════════╝
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            ┌───▼───┐     ┌───▼────┐   ┌───▼────┐
            │ Game  │     │  Game  │   │ Timer  │
            │ State │     │ Logic  │   │Manager │
            │Manager│     │Engine  │   └────────┘
            └───┬───┘     └─┬──────┘
                │          │
            ┌───▴──────────┴───┐
            │ Scoring, Pose    │
            │ Matching, Winner │
            │ Detection        │
            └────────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼────┐  ┌───▼────┐  ┌───▼─────┐
    │ Player1│  │ Player2│  │ Current │
    │ Score  │  │ Score  │  │ Task    │
    │ Ready  │  │ Ready  │  │ & Timer │
    │ Pred   │  │ Pred   │  │         │
    └────────┘  └────────┘  └─────────┘


                              │ HTTP POST
                              │ (Pose Prediction)
                              │
                    ╔═════════▼═════════════╗
                    ║   PYTHON DETECTION    ║
                    ║  (pose_detection_     ║
                    ║    client.py)         ║
                    ║                       ║
                    ║  Player 1 Instance:   ║
                    ║  • Webcam Capture     ║
                    ║  • MediaPipe Detect   ║
                    ║  • Classify Pose      ║
                    ║  • Send to Server     ║
                    ║                       ║
                    ║  Player 2 Instance:   ║
                    ║  (Same as Player 1)   ║
                    ╚═══════════════════════╝
```

---

## 📊 Data Flow Diagram

```
PLAYER PERFORMS HAND POSE
        │
        ▼ (Real-time)
┌──────────────────┐
│  Webcam Capture  │
│  (player.js)     │
└────────┬─────────┘
         │
         │ (every 100ms)
         ▼
┌──────────────────────────┐
│  Python Script Received  │
│  • Read webcam frame     │
│  • Process with MP       │
│  • Classify pose         │
└────────┬─────────────────┘
         │
         │ {"prediction": "Peace Sign", "confidence": 0.92}
         ▼
    HTTP POST
        │
        ▼
┌──────────────────────────┐
│  Server /api/player1/pose│
│  Received prediction     │
└────────┬─────────────────┘
         │
         │ Check if matches current task
         ▼
  ┌─────────────┐
  │   MATCH?    │
  └──┬──────┬──┘
     │      │
    YES    NO
     │      │
     │      └─→ (do nothing)
     │
     ▼
  Score++
  gameActive = false
  roundComplete = true
  winner = "player1"
     │
     ▼
  Client polls /api/debug/state
     │
     ▼
  Receive updated state
     │
     ├─→ Player 1 page: Shows "You won! 🎉"
     ├─→ Player 2 page: Shows "Opponent won 😢"
     └─→ Spectator: Shows "Player 1 Wins This Round! 🎉"
             │
             ▼
         Wait 2-3 seconds
             │
             ▼
         Reset for next round
```

---

## 🔄 State Lifecycle Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      GAME STATE LIFECYCLE                        │
└──────────────────────────────────────────────────────────────────┘

INITIAL STATE
    │
    ├─ player1.ready: false
    ├─ player2.ready: false
    ├─ gameActive: false
    ├─ timer: 0
    ├─ player1.score: 0
    ├─ player2.score: 0
    └─ currentTask: null
    │
    ▼
PLAYER 1 CLICKS READY
    │
    ├─ player1.ready: true ◄─
    ├─ player2.ready: false   │
    ├─ gameActive: false       │ Waiting
    ├─ Awaiting Player 2       │
    │
    ▼
BOTH PLAYERS CLICK READY
    │
    ├─ player1.ready: true
    ├─ player2.ready: true
    ├─ AUTO TRIGGER GAME START
    │
    ▼
GAME ACTIVE
    │
    ├─ gameActive: true ◄─
    ├─ timer: 30 (counting down)  │
    ├─ timerRunning: true         │ After ~3-30 seconds
    ├─ currentTask: { name, ... } │ depending on player
    ├─ Waiting for poses          │ performance
    │
    ▼
CORRECT MATCH DETECTED
    │
    ├─ First player to match correctly
    ├─ Winning player score++
    ├─ gameActive: false
    ├─ timerRunning: false
    ├─ roundComplete: true
    ├─ winner: "player1" OR "player2"
    │
    ▼
ROUND COMPLETE STATE (Show for 2-3 seconds)
    │
    ├─ Display winner announcement
    ├─ Show updated scores
    ├─ Spectator sees: "🎉 Player X Wins!"
    │
    ▼
RESET FOR NEXT ROUND
    │
    ├─ currentTask: new task
    ├─ timer: 30 (reset)
    ├─ timerRunning: false
    ├─ gameActive: false
    ├─ roundComplete: false
    ├─ winner: null
    ├─ player1.ready: false
    ├─ player2.ready: false ◄─ Back to INITIAL STATE
    │
    ▼
(Ready for next game)
```

---

## 📱 Page Layout Diagram

```
┌─────────────────────────────────────────────┐
│          PLAYER 1 / PLAYER 2 PAGE           │
├─────────────────────────────────────────────┤
│                                             │
│  ◀─ Back to Home       Player 1             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │                 │  │ Score: 0         │ │
│  │  CAMERA FEED    │  │ Timer: -         │ │
│  │                 │  │ Prediction: -    │ │
│  │ (640x480)       │  │                  │ │
│  │                 │  │ Current Task:    │ │
│  │                 │  │ Waiting...       │ │
│  └─────────────────┘  └──────────────────┘ │
│                                             │
│  [Ready To Play]  [Start Camera]            │
│                                             │
│  Status: Not ready                          │
│                                             │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│          SPECTATOR PAGE                     │
├─────────────────────────────────────────────┤
│                                             │
│  ◀─ Back to Home    Spectator View          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Current Task: Peace Sign           │   │
│  │  Description: Two fingers up...     │   │
│  │           VS  Timer: 0:15           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌────────────┐            ┌────────────┐  │
│  │ PLAYER 1   │     VS     │ PLAYER 2   │  │
│  │            │            │            │  │
│  │ ✓ Ready    │            │ ✗ Not Ready│  │
│  │ Score: 2   │            │ Score: 1   │  │
│  │ Pred: -    │            │ Pred: Fist │  │
│  │ Conf: -    │            │ Conf: 89%  │  │
│  └────────────┘            └────────────┘  │
│                                             │
│  Game Status: Active...                     │
│                                             │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│          DEBUG CONSOLE PAGE                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ◀─ Back to Home    Debug Console              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Game Control                                   │
│  [Start Game] [Reset Game] [Complete Round]     │
│                                                 │
│  Timer Control                                  │
│  Set: [30] [Set] | [Start Timer] [Stop Timer]   │
│                                                 │
│  Player Ready Status                            │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Player 1        │  │ Player 2        │      │
│  │ ✗ Not Ready     │  │ ✓ Ready         │      │
│  │[Set Ready]      │  │[Set Ready]      │      │
│  │[Set Not Ready]  │  │[Set Not Ready]  │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                 │
│  Game State Monitoring                          │
│  Game Active: ✗ No              Timer: 0        │
│  Current Task: None             Running: ✗ No   │
│  Player 1 Score: 0              P2 Score: 0     │
│  Winner: None                   Round: ✗ No     │
│                                                 │
│  Pose Simulator                                 │
│  [Peace Sign ▼] Conf: [0.85] [Send P1] [Send P2]
│                                                 │
│  Activity Log                                   │
│  [14:32:45] ✓ Player 1 set to Ready            │
│  [14:32:40] ✓ Game started                     │
│  ...                                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔌 API Request/Response Flow

```
CLIENT                              SERVER
  │                                    │
  │  GET /api/debug/state             │
  ├───────────────────────────────────►│
  │                                    │ Lookup game state
  │                                    │ Build JSON response
  │                                    │
  │  {gameActive, timer, player1, ...} │
  │◄───────────────────────────────────┤
  │  200 OK + JSON                     │
  │
  │  (500ms later)
  │
  │  GET /api/debug/state             │
  ├───────────────────────────────────►│
  │  ...
  │
  │
  │  POST /api/player1/pose           │
  ├───────────────────────────────────►│
  │  {prediction, confidence}          │
  │                                    │ Check prediction
  │                                    │ Match with task?
  │                                    │ Update score
  │  {success: true}                   │
  │◄───────────────────────────────────┤
  │  200 OK + JSON                     │
  │
  │  (500ms later)
  │
  │  GET /api/spectator/state         │
  ├───────────────────────────────────►│
  │  {minimal state}                   │
  │◄───────────────────────────────────┤
  │  200 OK + JSON                     │
  │  (Shows updated scores)            │
```

---

## ⏱️ Timeline Example (One Round)

```
TIME    PLAYER 1        SERVER              PLAYER 2        SPECTATOR
────────────────────────────────────────────────────────────────────────
0s      Start Camera    ─ ─ ─ ─ ─           Start Camera    Waiting...
        Ready! ──────────►
                        Both ready?
                        YES! → Start game
                        Task: "Peace Sign"   Ready! ←────────
1s                      Timer: 29s           (performing)    Task: Peace
                        (detecting...)       Pred: ?         Timer: 29s
                                                             P1: 0-0 :P2
3s      (performing)    Pred: "Fist"        (performing)    P1: Peace
        Peace!          Confidence: 0.5      Pred: "OK"      P2: ?
        ────────────►   NO MATCH             Confidence: 0.8
5s      (performing)    (detecting...)       "Peace Sign"    P1: ?
        Pred: "Peace"   Pred: "Peace"        ────────────►   P2: Peac
        ────────────►   Sign"                                
                        Confidence: 0.95     
                        MATCH! ✓             
                        Player 1 Score++     
                        → round complete     
7s                      Winner: Player 1     (waiting)       🎉 P1 Wins
                                                             Score: 1-0
8s      Not ready       Reset for next       Not ready       Back to
        ────────────►   round                ←────────────   start
```

---

## 🎯 Simple Point-to-Point Flow

```
Player → Camera → Python → Server → Database → All Clients
                   ↓
            Detect Pose
            ↓
        Send HTTP POST
            ↓
        { prediction, confidence }
            ↓
        Server:
        • Check if matches task
        • Update player score
        • Update game state
            ↓
        Clients poll state every 500ms
            ↓
        UI Updates everywhere
            ↓
        All pages show new scores
```

---

## 🎮 Interaction Points

```
USER INTERACTIONS:

Player Click                Server Response          UI Update
────────────────────────────────────────────────────────────
"Start Camera"          → Permission asked        → Video stream
"Ready To Play"         → Set ready flag          → Button changes
                        → Check both ready       → Game auto-starts
"Stop Camera"           → Release camera         → Black screen

Debug "Set Ready"       → Set player flag        → UI reflects
                        → Check both ready       → Game auto-starts
"Start Game"            → Validate ready         → Timer starts
"Set Timer 45"          → Update timer value     → Display updates
"Send Pose (Simulator)" → Process prediction     → Score updates
```

---

**These diagrams show how the entire system works together!** 🎮
