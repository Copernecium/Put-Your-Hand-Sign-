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
    poseConfidence: 0,
    inferenceTime: 0
  },
  player2: {
    id: 'player2',
    ready: false,
    score: 0,
    prediction: null,
    cameraFrame: null,
    poseConfidence: 0,
    inferenceTime: 0
  },
  gameActive: false,
  countdown: 0,
  currentTask: null,
  timer: 30, // Default game duration
  timerRunning: false,
  taskImage: null,
  winner: null,
  roundWinner: null, // Who won the current task
  roundComplete: false,
  msgRates: {
    player1: 0,
    player2: 0
  }
};

let msgCounts = {
  player1: 0,
  player2: 0
};

// Task definitions
const tasks = [
  { id: 1, name: 'Bird', image: '/images/bird.png', description: 'Make a bird shape with your hand' },
  { id: 2, name: 'Bull', image: '/images/bird.png', description: 'Two fingers up like horns' },
  { id: 3, name: 'Crab', image: '/images/bird.png', description: 'Fingers moving like claws' },
  { id: 4, name: 'Deer', image: '/images/bird.png', description: 'Hand shape like a deer' },
  { id: 5, name: 'Dog', image: '/images/bird.png', description: 'Hand shape like a dog' },
  { id: 6, name: 'Duck', image: '/images/bird.png', description: 'Fingers touching like a beak' },
  { id: 7, name: 'Elephant', image: '/images/bird.png', description: 'Arm or hand like a trunk' },
  { id: 8, name: 'Paper', image: '/images/bird.png', description: 'All five fingers extended' },
  { id: 9, name: 'Rock', image: '/images/bird.png', description: 'Closed fist' },
  { id: 10, name: 'Scissor', image: '/images/bird.png', description: 'Two fingers in V shape' }
];

let defaultTimerValue = 30;
let gameResetTimeout = null;

// Initialize game
function initializeGame() {
  if (gameResetTimeout) {
    clearTimeout(gameResetTimeout);
    gameResetTimeout = null;
  }
  
  // Force reset all states
  gameState.gameActive = false;
  gameState.countdown = 0;
  gameState.timer = defaultTimerValue;
  gameState.timerRunning = false;
  gameState.roundComplete = false;
  gameState.winner = null;
  gameState.roundWinner = null;
  gameState.currentTask = null;

  // Force both players to unready
  gameState.player1.ready = false;
  gameState.player1.score = 0;
  gameState.player1.prediction = null;
  gameState.player1.inferenceTime = 0;
  
  gameState.player2.ready = false;
  gameState.player2.score = 0;
  gameState.player2.prediction = null;
  gameState.player2.inferenceTime = 0;

  console.log("Game state has been fully reset. Players must ready up again.");
}

function getRandomTask() {
  const randomIndex = Math.floor(Math.random() * tasks.length);
  return tasks[randomIndex];
}

function startCountdown() {
  if (gameState.countdown > 0 || gameState.gameActive) return;
  
  if (gameResetTimeout) {
    clearTimeout(gameResetTimeout);
    gameResetTimeout = null;
  }

  gameState.countdown = 3;
  gameState.roundComplete = false;
  gameState.winner = null;
  
  const countdownInterval = setInterval(() => {
    gameState.countdown--;
    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

function startGame() {
  gameState.player1.score = 0;
  gameState.player2.score = 0;
  gameState.timer = defaultTimerValue;
  gameState.gameActive = true;
  gameState.timerRunning = true;
  gameState.roundComplete = false;
  startNewTask();
}

function startNewTask() {
  if (!gameState.gameActive) return;
  gameState.currentTask = getRandomTask();
  gameState.roundWinner = null;
}

// Routes for Player 1
app.post('/api/player1/ready', (req, res) => {
  const { ready } = req.body;
  gameState.player1.ready = ready;
  if (gameState.player1.ready && gameState.player2.ready && !gameState.gameActive && gameState.countdown === 0) {
    startCountdown();
  }
  res.json({ success: true, gameActive: gameState.gameActive, countdown: gameState.countdown });
});

app.post('/api/player1/pose', (req, res) => {
  msgCounts.player1++;
  const { prediction, confidence, cameraFrame, inferenceTime } = req.body;
  
  gameState.player1.prediction = prediction;
  gameState.player1.poseConfidence = confidence;
  gameState.player1.inferenceTime = inferenceTime || 0;
  if (cameraFrame) {
    gameState.player1.cameraFrame = cameraFrame;
  }
  
  if (gameState.gameActive && !gameState.roundWinner && predictionMatches(prediction, gameState.currentTask.name, confidence)) {
    gameState.player1.score++;
    gameState.roundWinner = 'player1';
    setTimeout(() => { startNewTask(); }, 500);
  }
  res.json({ success: true });
});

// Routes for Player 2
app.post('/api/player2/ready', (req, res) => {
  const { ready } = req.body;
  gameState.player2.ready = ready;
  if (gameState.player1.ready && gameState.player2.ready && !gameState.gameActive && gameState.countdown === 0) {
    startCountdown();
  }
  res.json({ success: true, gameActive: gameState.gameActive, countdown: gameState.countdown });
});

app.post('/api/player2/pose', (req, res) => {
  msgCounts.player2++;
  const { prediction, confidence, cameraFrame, inferenceTime } = req.body;
  
  gameState.player2.prediction = prediction;
  gameState.player2.poseConfidence = confidence;
  gameState.player2.inferenceTime = inferenceTime || 0;
  if (cameraFrame) {
    gameState.player2.cameraFrame = cameraFrame;
  }
  
  if (gameState.gameActive && !gameState.roundWinner && predictionMatches(prediction, gameState.currentTask.name, confidence)) {
    gameState.player2.score++;
    gameState.roundWinner = 'player2';
    setTimeout(() => { startNewTask(); }, 500);
  }
  res.json({ success: true });
});

// Debug page routes
app.get('/api/debug/state', (req, res) => {
  res.json(gameState);
});

app.post('/api/debug/timer/set', (req, res) => {
  const { seconds } = req.body;
  defaultTimerValue = parseInt(seconds);
  gameState.timer = defaultTimerValue;
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
  if (gameState.player1.ready && gameState.player2.ready) {
    startCountdown();
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
  if (playerNum === '1') gameState.player1.ready = ready;
  else if (playerNum === '2') gameState.player2.ready = ready;
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
      ready: gameState.player1.ready,
      inferenceTime: gameState.player1.inferenceTime
    },
    player2: {
      score: gameState.player2.score,
      prediction: gameState.player2.prediction,
      poseConfidence: gameState.player2.poseConfidence,
      ready: gameState.player2.ready,
      inferenceTime: gameState.player2.inferenceTime
    },
    gameActive: gameState.gameActive,
    countdown: gameState.countdown,
    currentTask: gameState.currentTask,
    timer: gameState.timer,
    timerRunning: gameState.timerRunning,
    roundWinner: gameState.roundWinner,
    roundComplete: gameState.roundComplete,
    winner: gameState.winner
  });
});

app.get('/api/spectator/camera-frames', (req, res) => {
  res.json({
    player1Frame: gameState.player1.cameraFrame,
    player2Frame: gameState.player2.cameraFrame
  });
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/player1', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'player1.html')); });
app.get('/player2', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'player2.html')); });
app.get('/spectator', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'spectator.html')); });
app.get('/debug', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'debug.html')); });

function predictionMatches(prediction, taskName, confidence) {
  if (!prediction || !taskName) return false;
  const normalizedPrediction = prediction.toLowerCase().trim();
  const normalizedTask = taskName.toLowerCase().trim();
  if (confidence < 0.7) return false;
  return normalizedPrediction.includes(normalizedTask) || normalizedTask.includes(normalizedPrediction);
}

setInterval(() => {
  gameState.msgRates.player1 = msgCounts.player1;
  gameState.msgRates.player2 = msgCounts.player2;
  msgCounts.player1 = 0;
  msgCounts.player2 = 0;

  if (gameState.timerRunning && gameState.timer > 0) {
    gameState.timer--;
    if (gameState.timer === 0) {
      gameState.timerRunning = false;
      gameState.gameActive = false;
      gameState.roundComplete = true;
      if (gameState.player1.score > gameState.player2.score) gameState.winner = 'player1';
      else if (gameState.player2.score > gameState.player1.score) gameState.winner = 'player2';
      else gameState.winner = 'tie';
      gameResetTimeout = setTimeout(() => {
        initializeGame();
        gameResetTimeout = null;
      }, 5000);
    }
  }
}, 1000);

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
    inferenceTime: player.inferenceTime,
    gameActive: gameState.gameActive,
    countdown: gameState.countdown,
    currentTask: gameState.currentTask,
    timer: gameState.timer,
    timerRunning: gameState.timerRunning,
    roundWinner: gameState.roundWinner,
    roundComplete: gameState.roundComplete,
    winner: gameState.winner
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hand Pose Game server running on http://localhost:${PORT}`);
});
