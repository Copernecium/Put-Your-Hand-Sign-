class PlayerClient {
    constructor(playerId) {
        this.playerId = playerId;
        this.playerNum = playerId.replace('player', '');
        this.isReady = false;
        
        // UI Elements
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('cameraCanvas');
        this.readyButton = document.getElementById('readyButton');
        this.statusMessage = document.getElementById('statusMessage');
        
        // Use an Image object to draw to canvas since we're receiving base64 JPEGs
        this.displayImage = new Image();
        
        this.setupEventListeners();
        this.startStatePolling();
    }

    setupEventListeners() {
        this.readyButton.addEventListener('click', () => this.toggleReady());
    }

    toggleReady() {
        this.isReady = !this.isReady;
        this.sendReadyStatus(this.isReady);
        this.updateReadyButton();
    }

    updateReadyButton() {
        if (this.isReady) {
            this.readyButton.textContent = 'Unready';
            this.readyButton.classList.add('active');
            this.showStatus('Ready! Waiting for other player...', 'success');
        } else {
            this.readyButton.textContent = 'Ready To Play';
            this.readyButton.classList.remove('active');
            this.showStatus('Not ready', 'error');
        }
    }

    async sendReadyStatus(ready) {
        try {
            const endpoint = `/api/${this.playerId}/ready`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ready })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send ready status');
            }
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            this.isReady = !this.isReady;
            this.updateReadyButton();
        }
    }

    async updateGameState() {
        try {
            // Fetch both game state and camera frame from our new endpoint
            const response = await fetch(`/api/player/${this.playerNum}/data`);
            const state = await response.json();

            // Update score
            document.getElementById('playerScore').textContent = state.score;

            // Update timer
            if (state.timerRunning) {
                const minutes = Math.floor(state.timer / 60);
                const seconds = state.timer % 60;
                document.getElementById('playerTimer').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                if (state.timer === 0 && state.roundComplete) {
                    document.getElementById('playerTimer').textContent = 'Done';
                } else {
                    document.getElementById('playerTimer').textContent = '-';
                }
            }

            // Update prediction
            const prediction = state.prediction;
            document.getElementById('playerPrediction').textContent = prediction ? 
                `${prediction} (${(state.poseConfidence * 100).toFixed(0)}%)` : 
                'Waiting...';

            // Update current task
            if (state.currentTask) {
                document.getElementById('currentTask').textContent = state.currentTask.name;
            } else {
                document.getElementById('currentTask').textContent = 'Waiting for game start...';
            }

            // Update Camera Feed (from Python AI)
            if (state.cameraFrame) {
                // The frame is base64 string, update the image source
                // Ensure it has the data:image/jpeg;base64, prefix if not already there
                const prefix = state.cameraFrame.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
                this.displayImage.onload = () => {
                    const ctx = this.canvasElement.getContext('2d');
                    this.canvasElement.width = this.displayImage.width;
                    this.canvasElement.height = this.displayImage.height;
                    ctx.drawImage(this.displayImage, 0, 0);
                    
                    // Hide video element and show canvas if not already
                    if (this.videoElement) this.videoElement.style.display = 'none';
                    this.canvasElement.style.display = 'block';
                };
                this.displayImage.src = prefix + state.cameraFrame;

                // Update status badge
                const statusBadge = document.getElementById('cameraStatus');
                statusBadge.textContent = 'Camera: Streaming';
                statusBadge.style.background = 'rgba(16, 185, 129, 0.9)';
            }

            // Show result if round is complete
            if (state.roundComplete && state.winner) {
                if (state.winner === this.playerId) {
                    this.showStatus('🎉 You Won This Round!', 'success');
                } else if (state.winner === 'tie') {
                    this.showStatus('Round ended in a tie', 'success');
                } else {
                    this.showStatus('Opponent won this round', 'error');
                }
            }
        } catch (error) {
            console.error('Error updating game state:', error);
        }
    }

    startStatePolling() {
        // Poll frequently for smooth video feed (20 FPS)
        setInterval(() => this.updateGameState(), 50);
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                if (this.statusMessage.textContent === message) {
                    this.statusMessage.textContent = '';
                    this.statusMessage.className = 'status-message';
                }
            }, 3000);
        }
    }
}
