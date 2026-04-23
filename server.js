const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

// Game state
let gameState = {
  player1: {
    id: 'player1',
    ready: false,
    score: 0,
    prediction: null,
    cameraFrame: null,
    poseConfidence: 0
  },
  player2: {
    id: 'player2',
    ready: false,
    score: 0,
    prediction: null,
    cameraFrame: null,
    poseConfidence: 0
  },
  gameActive: false,
  currentTask: null,
  timer: 0,
  timerRunning: false,
  taskImage: null,
  winner: null,
  roundComplete: false
};

// Task definitions
const tasks = [
  { id: 1, name: 'Peace Sign', image: '/images/peace-sign.png', description: 'Two fingers up, peace gesture' },
  { id: 2, name: 'Thumbs Up', image: '/images/thumbs-up.png', description: 'Thumb pointing upward' },
  { id: 3, name: 'Rock Sign', image: '/images/rock-sign.png', description: 'Index and pinky finger up' },
  { id: 4, name: 'OK Sign', image: '/images/ok-sign.png', description: 'Thumb and index finger forming circle' },
  { id: 5, name: 'Open Hand', image: '/images/open-hand.png', description: 'All five fingers extended' },
  { id: 6, name: 'Fist', image: '/images/fist.png', description: 'Closed fist' },
  { id: 7, name: 'Point', image: '/images/point.png', description: 'Index finger pointing' },
  { id: 8, name: 'Victory', image: '/images/victory.png', description: 'Two fingers in V shape' }
];

let currentTaskIndex = 0;

// Initialize game
function initializeGame() {
  gameState.gameActive = false;
  gameState.timer = 0;
  gameState.timerRunning = false;
  gameState.roundComplete = false;
  gameState.winner = null;
  gameState.player1.score = 0;
  gameState.player2.score = 0;
  gameState.player1.ready = false;
  gameState.player2.ready = false;
  currentTaskIndex = 0;
}

function getNextTask() {
  const task = tasks[currentTaskIndex % tasks.length];
  currentTaskIndex++;
  return task;
}

function startGameRound() {
  gameState.currentTask = getNextTask();
  gameState.gameActive = true;
  gameState.timer = 30; // 30 second timer
  gameState.timerRunning = true;
  gameState.roundComplete = false;
}

// Routes for Player 1
app.post('/api/player1/ready', (req, res) => {
  const { ready } = req.body;
  gameState.player1.ready = ready;
  
  // Check if both players are ready
  if (gameState.player1.ready && gameState.player2.ready && !gameState.gameActive) {
    startGameRound();
  }
  
  res.json({ success: true, gameActive: gameState.gameActive });
});

app.post('/api/player1/pose', (req, res) => {
  const { prediction, confidence, cameraFrame } = req.body;
  
  gameState.player1.prediction = prediction;
  gameState.player1.poseConfidence = confidence;
  if (cameraFrame) {
    gameState.player1.cameraFrame = cameraFrame;
    console.log(`✓ Player 1: ${prediction} (${(confidence*100).toFixed(0)}%) - Frame: ${(cameraFrame.length/1024).toFixed(1)}KB`);
  }
  
  // Check if prediction matches current task
  if (gameState.gameActive && predictionMatches(prediction, gameState.currentTask.name, confidence)) {
    gameState.player1.score++;
    gameState.gameActive = false;
    gameState.timerRunning = false;
    gameState.roundComplete = true;
    gameState.winner = 'player1';
  }
  
  res.json({ success: true });
});

// Routes for Player 2
app.post('/api/player2/ready', (req, res) => {
  const { ready } = req.body;
  gameState.player2.ready = ready;
  
  // Check if both players are ready
  if (gameState.player1.ready && gameState.player2.ready && !gameState.gameActive) {
    startGameRound();
  }
  
  res.json({ success: true, gameActive: gameState.gameActive });
});

app.post('/api/player2/pose', (req, res) => {
  const { prediction, confidence, cameraFrame } = req.body;
  
  gameState.player2.prediction = prediction;
  gameState.player2.poseConfidence = confidence;
  if (cameraFrame) {
    gameState.player2.cameraFrame = cameraFrame;
    console.log(`✓ Player 2: ${prediction} (${(confidence*100).toFixed(0)}%) - Frame: ${(cameraFrame.length/1024).toFixed(1)}KB`);
  }
  
  // Check if prediction matches current task
  if (gameState.gameActive && predictionMatches(prediction, gameState.currentTask.name, confidence)) {
    gameState.player2.score++;
    gameState.gameActive = false;
    gameState.timerRunning = false;
    gameState.roundComplete = true;
    gameState.winner = 'player2';
  }
  
  res.json({ success: true });
});

// Debug page routes
app.get('/api/debug/state', (req, res) => {
  res.json(gameState);
});

app.post('/api/debug/timer/set', (req, res) => {
  const { seconds } = req.body;
  gameState.timer = seconds;
  res.json({ success: true });
});

app.post('/api/debug/timer/start', (req, res) => {
  gameState.timerRunning = true;
  res.json({ success: true });
});

app.post('/api/debug/timer/stop', (req, res) => {
  gameState.timerRunning = false;
  res.json({ success: true });
});

app.post('/api/debug/game/start', (req, res) => {
  // Only start if both players are ready
  if (gameState.player1.ready && gameState.player2.ready) {
    startGameRound();
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Both players must be ready' });
  }
});

app.post('/api/debug/game/reset', (req, res) => {
  initializeGame();
  res.json({ success: true });
});

app.post('/api/debug/player/ready/:playerNum', (req, res) => {
  const { playerNum } = req.params;
  const { ready } = req.body;
  
  if (playerNum === '1') {
    gameState.player1.ready = ready;
  } else if (playerNum === '2') {
    gameState.player2.ready = ready;
  }
  
  res.json({ success: true });
});

app.post('/api/debug/round/complete', (req, res) => {
  gameState.roundComplete = true;
  gameState.gameActive = false;
  gameState.timerRunning = false;
  res.json({ success: true });
});

app.get('/api/debug/tasks', (req, res) => {
  res.json(tasks);
});

// Spectator page route
app.get('/api/spectator/state', (req, res) => {
  res.json({
    player1: {
      score: gameState.player1.score,
      prediction: gameState.player1.prediction,
      poseConfidence: gameState.player1.poseConfidence,
      ready: gameState.player1.ready
    },
    player2: {
      score: gameState.player2.score,
      prediction: gameState.player2.prediction,
      poseConfidence: gameState.player2.poseConfidence,
      ready: gameState.player2.ready
    },
    gameActive: gameState.gameActive,
    currentTask: gameState.currentTask,
    timer: gameState.timer,
    timerRunning: gameState.timerRunning,
    roundComplete: gameState.roundComplete,
    winner: gameState.winner
  });
});

// Spectator camera frames route
app.get('/api/spectator/camera-frames', (req, res) => {
  res.json({
    player1Frame: gameState.player1.cameraFrame,
    player2Frame: gameState.player2.cameraFrame
  });
});

// Serve HTML pages based on route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/player1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player1.html'));
});

app.get('/player2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player2.html'));
});

app.get('/spectator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spectator.html'));
});

app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

// Helper function to check if prediction matches task
function predictionMatches(prediction, taskName, confidence) {
  // Simple matching - can be enhanced with fuzzy matching
  const normalizedPrediction = prediction.toLowerCase().trim();
  const normalizedTask = taskName.toLowerCase().trim();
  
  // Require at least 70% confidence
  if (confidence < 0.7) return false;
  
  // Check for exact match or partial match
  return normalizedPrediction.includes(normalizedTask) || normalizedTask.includes(normalizedPrediction);
}

// Timer interval
setInterval(() => {
  if (gameState.timerRunning && gameState.timer > 0) {
    gameState.timer--;
    
    // When timer reaches 0
    if (gameState.timer === 0) {
      gameState.timerRunning = false;
      if (gameState.gameActive) {
        gameState.gameActive = false;
        gameState.roundComplete = true;
        
        // Determine winner based on scores from this round
        if (gameState.player1.score > gameState.player2.score) {
          gameState.winner = 'player1';
        } else if (gameState.player2.score > gameState.player1.score) {
          gameState.winner = 'player2';
        } else {
          gameState.winner = 'tie';
        }
      }
    }
  }
}, 1000);

// Get single player data (for player dashboard)
app.get('/api/player/:playerNum/data', (req, res) => {
  const { playerNum } = req.params;
  const playerKey = `player${playerNum}`;
  const player = gameState[playerKey];
  
  if (!player) return res.status(404).json({ error: 'Player not found' });
  
  res.json({
    score: player.score,
    prediction: player.prediction,
    poseConfidence: player.poseConfidence,
    ready: player.ready,
    cameraFrame: player.cameraFrame,
    gameActive: gameState.gameActive,
    currentTask: gameState.currentTask,
    timer: gameState.timer,
    timerRunning: gameState.timerRunning,
    roundComplete: gameState.roundComplete,
    winner: gameState.winner
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hand Pose Game server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log(`  http://localhost:${PORT}/ - Main hub`);
  console.log(`  http://localhost:${PORT}/player1 - Player 1 page`);
  console.log(`  http://localhost:${PORT}/player2 - Player 2 page`);
  console.log(`  http://localhost:${PORT}/spectator - Spectator page`);
  console.log(`  http://localhost:${PORT}/debug - Debug page`);
});
