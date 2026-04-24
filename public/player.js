class PlayerClient {
    constructor(playerId) {
        this.playerId = playerId;
        this.playerNum = playerId.replace('player', '');
        this.isReady = false;
        this.lastReadyToggle = 0;
        this.isSettingReady = false;
        this.modalShown = false;
        
        // Performance Tracking
        this.fpsCount = 0;
        this.lastFpsUpdate = Date.now();
        this.currentFps = 0;
        this.showFps = false;
        this.showInference = false;
        this.currentInference = 0;
        
        // UI Elements
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('cameraCanvas');
        this.readyButton = document.getElementById('readyButton');
        this.statusMessage = document.getElementById('statusMessage');
        
        this.fpsToggle = document.getElementById('fpsToggle');
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.inferenceToggle = document.getElementById('inferenceToggle');
        this.inferenceDisplay = document.getElementById('inferenceDisplay');
        
        // Modal Elements
        this.resultModal = document.getElementById('resultModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalIcon = document.getElementById('modalIcon');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalFinalScore = document.getElementById('modalFinalScore');
        
        this.displayImage = new Image();
        this.displayImage.onload = () => {
            if (!this.canvasElement) return;
            const ctx = this.canvasElement.getContext('2d');
            this.canvasElement.width = this.displayImage.width;
            this.canvasElement.height = this.displayImage.height;
            ctx.drawImage(this.displayImage, 0, 0);
            if (this.videoElement) this.videoElement.style.display = 'none';
            this.canvasElement.style.display = 'block';
        };
        
        this.activeFrameRequests = 0;
        this.lastFrameTime = 0;
        
        this.setupEventListeners();
        this.startStatePolling();
        this.startFramePolling();
        this.startPerformanceTracker();
    }

    setupEventListeners() {
        this.readyButton.addEventListener('click', () => this.toggleReady());
        
        if (this.fpsToggle) {
            this.fpsToggle.addEventListener('change', (e) => {
                this.showFps = e.target.checked;
                this.fpsDisplay.style.display = this.showFps ? 'inline' : 'none';
            });
        }

        if (this.inferenceToggle) {
            this.inferenceToggle.addEventListener('change', (e) => {
                this.showInference = e.target.checked;
                this.inferenceDisplay.style.display = this.showInference ? 'inline' : 'none';
            });
        }

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => {
                this.resultModal.style.display = 'none';
            });
        }
    }

    startPerformanceTracker() {
        setInterval(() => {
            const now = Date.now();
            const elapsed = (now - this.lastFpsUpdate) / 1000;
            if (elapsed >= 1) {
                this.currentFps = Math.round(this.fpsCount / elapsed);
                if (this.fpsDisplay) this.fpsDisplay.textContent = `FPS: ${this.currentFps}`;
                if (this.inferenceDisplay) this.inferenceDisplay.textContent = `AI: ${this.currentInference.toFixed(1)}ms`;
                this.fpsCount = 0;
                this.lastFpsUpdate = now;
            }
        }, 500);
    }

    toggleReady() {
        this.isReady = !this.isReady;
        this.lastReadyToggle = Date.now();
        this.isSettingReady = true;
        this.sendReadyStatus(this.isReady);
        this.updateReadyButtonUI();
    }

    updateReadyButtonUI() {
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
            if (!response.ok) throw new Error('Failed to send ready status');
            // Successfully updated server, we can stop blocking sync soon
            setTimeout(() => { this.isSettingReady = false; }, 500);
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            this.isSettingReady = false;
            // On error, we might want to revert, but only if it wasn't toggled again
            if (Date.now() - this.lastReadyToggle < 1000) {
                this.isReady = !this.isReady;
                this.updateReadyButtonUI();
            }
        }
    }

    startStatePolling() {
        setInterval(() => this.updateGameState(), 500); // Game state every 500ms
    }

    startFramePolling() {
        setInterval(() => this.updateCameraFrame(), 33); // Frames every 33ms (~30 FPS)
    }

    async updateGameState() {
        try {
            const response = await fetch(`/api/player/${this.playerNum}/data`);
            const state = await response.json();

            // Only sync ready state from server if we haven't manually toggled it recently
            // and we aren't currently waiting for a POST to finish
            const timeSinceToggle = Date.now() - this.lastReadyToggle;
            if (this.isReady !== state.ready && !state.gameActive && state.countdown === 0 && !this.isSettingReady && timeSinceToggle > 1000) {
                this.isReady = state.ready;
                this.updateReadyButtonUI();
            }

            document.getElementById('playerScore').textContent = state.score;
            this.currentInference = state.inferenceTime || 0;

            if (state.timerRunning) {
                const minutes = Math.floor(state.timer / 60);
                const seconds = state.timer % 60;
                document.getElementById('playerTimer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                document.getElementById('playerTimer').textContent = (state.timer === 0 && state.roundComplete) ? 'Done' : '-';
            }

            const prediction = state.prediction;
            document.getElementById('playerPrediction').textContent = prediction ? 
                `${prediction} (${(state.poseConfidence * 100).toFixed(0)}%)` : 'Waiting...';

            if (state.countdown > 0) {
                this.showStatus(`Starting in ${state.countdown}...`, 'warning');
                this.readyButton.style.display = 'none';
                this.modalShown = false; 
            } else if (state.gameActive) {
                this.readyButton.style.display = 'none';
                this.modalShown = false; 
                if (state.currentTask) document.getElementById('currentTask').textContent = state.currentTask.name;

                if (state.roundWinner) {
                    if (state.roundWinner === this.playerId) this.showStatus('You got it! +1', 'success');
                    else this.showStatus(`${state.roundWinner === 'player1' ? 'Player 1' : 'Player 2'} got it!`, 'error');
                } else {
                    this.showStatus('Perform the pose!', 'info');
                }
            } else {
                this.readyButton.style.display = 'block';
                if (state.roundComplete) {
                    if (!this.modalShown && state.winner) {
                        this.showResultModal(state.winner, state.score);
                        this.modalShown = true;
                    }
                    if (state.winner === 'tie') this.showStatus('Game Over: It\'s a tie!', 'warning');
                    else if (state.winner === this.playerId) this.showStatus('🎉 Game Over: YOU WON! 🎉', 'success');
                    else this.showStatus('Game Over: Opponent won', 'error');
                } else {
                    document.getElementById('currentTask').textContent = 'Waiting for game start...';
                }
            }
        } catch (error) {
            console.error('Error updating game state:', error);
        }
    }

    async updateCameraFrame() {
        if (this.activeFrameRequests >= 3) return; // Limit concurrent requests
        
        const requestTime = Date.now();
        try {
            this.activeFrameRequests++;
            const response = await fetch(`/api/player/${this.playerNum}/data`);
            const state = await response.json();
            
            // Only update if this is the newest frame we've received
            if (state.cameraFrame && requestTime > this.lastFrameTime) {
                this.lastFrameTime = requestTime;
                this.fpsCount++;
                const prefix = state.cameraFrame.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
                this.displayImage.src = prefix + state.cameraFrame;
                document.getElementById('cameraStatus').textContent = 'AI Feed: Live';
            }
        } catch (error) {
        } finally {
            this.activeFrameRequests--;
        }
    }

    showResultModal(winner, finalScore) {
        if (!this.resultModal) return;
        this.modalFinalScore.textContent = finalScore;
        if (winner === 'tie') {
            this.modalIcon.textContent = '🤝';
            this.modalTitle.textContent = "It's a Tie!";
            this.modalMessage.textContent = "Great match! Both players were equally skilled.";
        } else if (winner === this.playerId) {
            this.modalIcon.textContent = '🏆';
            this.modalTitle.textContent = "You Won!";
            this.modalMessage.textContent = "Incredible performance! You're the hand sign master.";
        } else {
            this.modalIcon.textContent = '💔';
            this.modalTitle.textContent = "You Lost";
            this.modalMessage.textContent = "Nice try! Better luck in the next round.";
        }
        this.resultModal.style.display = 'flex';
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
    }
}
