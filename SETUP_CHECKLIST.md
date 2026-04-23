# ✅ Hand Pose Game - Setup & Verification Checklist

Complete this checklist to ensure your system is ready to play!

---

## 📦 Step 1: Pre-Installation Checklist

- [ ] Windows/Mac/Linux system ready
- [ ] Administrator access to install software
- [ ] ~500 MB disk space available
- [ ] Stable internet connection (for initial downloads)
- [ ] At least 2 hours free (first time setup)
- [ ] Read START_HERE.md and QUICKSTART.md

---

## 🔧 Step 2: Install Required Software

### Node.js Installation
- [ ] Download from https://nodejs.org/ (LTS version)
- [ ] Run installer, accept default settings
- [ ] Restart computer
- [ ] Verify: Open cmd and type:
  ```bash
  node --version
  npm --version
  ```
  Should show version numbers (e.g., v16.13.0)

### Python Installation
- [ ] Download from https://www.python.org/downloads/ (3.7+)
- [ ] **IMPORTANT**: Check "Add Python to PATH" during install
- [ ] Restart computer
- [ ] Verify: Open cmd and type:
  ```bash
  python --version
  pip --version
  ```
  Should show version numbers

### Webcam Test
- [ ] Open Windows Camera app (or equivalent)
- [ ] Verify camera works
- [ ] Test in different lighting conditions
- [ ] Ensure good quality video

### Browser Test
- [ ] Open latest Chrome, Firefox, Edge, or Safari
- [ ] Test that JavaScript is enabled
- [ ] Try opening: http://google.com
- [ ] Should work without issues

---

## 📥 Step 3: Download and Setup Project

- [ ] Navigate to your project folder:
  ```
  d:\3year3\HRI\PutYourHandSign
  ```

- [ ] Verify all files are present:
  ```bash
  dir /B
  ```
  You should see the following files/folders:
  - [ ] server.js
  - [ ] package.json
  - [ ] pose_detection_client.py
  - [ ] custom_detection_examples.py
  - [ ] start-game.bat
  - [ ] run-detection.bat
  - [ ] public/ (folder)
  - [ ] README.md
  - [ ] QUICKSTART.md
  - [ ] And other .md files

- [ ] Verify public folder contents:
  ```bash
  dir public /B
  ```
  You should see:
  - [ ] index.html
  - [ ] player1.html
  - [ ] player2.html
  - [ ] spectator.html
  - [ ] debug.html
  - [ ] player.js
  - [ ] styles.css
  - [ ] images/ (folder)

---

## 📦 Step 4: Install Dependencies

### Method A: Automatic (Windows)
- [ ] Double-click `start-game.bat`
- [ ] Wait for "npm install" to complete
- [ ] Should see "✓ Dependencies installed"

### Method B: Manual
- [ ] Open terminal/cmd in project folder
- [ ] Run: `npm install`
  ```bash
  npm install
  ```
- [ ] Wait for "added X packages" message
- [ ] Verify node_modules folder created:
  ```bash
  dir node_modules
  ```

### Installation Success Check
- [ ] No error messages during npm install
- [ ] node_modules folder exists
- [ ] node_modules has express folder:
  ```bash
  dir node_modules | findstr express
  ```

---

## 🐍 Step 5: Install Python Packages

- [ ] Open new terminal/cmd
- [ ] Navigate to project folder
- [ ] Run:
  ```bash
  pip install mediapipe opencv-python requests
  ```
- [ ] Wait for all 3 packages to install
- [ ] Should see "Successfully installed" messages
- [ ] Verify installation:
  ```bash
  pip list
  ```
- [ ] Confirm you see:
  - [ ] mediapipe
  - [ ] opencv-python
  - [ ] requests

**Troubleshooting**:
- If `pip` not found, try: `python -m pip install ...`
- If permission denied, try: `pip install --user ...`

---

## ✅ Step 6: Start the Server

- [ ] Open terminal/cmd in project folder
- [ ] Run:
  ```bash
  npm start
  ```
- [ ] Wait for server to start
- [ ] Should see messages:
  ```
  Hand Pose Game server running on http://localhost:3000
  Available routes:
    http://localhost:3000/ - Main hub
    http://localhost:3000/player1 - Player 1 page
    ...
  ```

### Server Success Check
- [ ] No error messages
- [ ] "running on http://localhost:3000" message appears
- [ ] Terminal doesn't exit
- [ ] Port 3000 is working

**If server won't start**:
- [ ] Check if port 3000 is in use:
  ```bash
  netstat -ano | findstr :3000
  ```
- [ ] If in use, either:
  - [ ] Kill the process using port 3000
  - [ ] Use different port: `set PORT=3001` then `npm start`

---

## 🐍 Step 7: Start Python Detection (Separate Terminal)

- [ ] Open another terminal/cmd window
- [ ] Navigate to same project folder
- [ ] Run:
  ```bash
  python pose_detection_client.py --player player1
  ```
- [ ] Should see messages:
  ```
  Starting pose detection for player1...
  Server: http://localhost:3000
  Press 'q' to quit
  ```
- [ ] A camera window should open showing your face/hand

### Python Client Success Check
- [ ] No error messages
- [ ] Camera window opens
- [ ] You can see yourself in the camera
- [ ] "Starting pose detection..." message appears
- [ ] Optional: Run in second Python instance for player2:
  ```bash
  python pose_detection_client.py --player player2
  ```

**If Python client won't start**:
- [ ] Check MediaPipe installed: `pip install mediapipe`
- [ ] Check camera permissions
- [ ] Try in incognito mode
- [ ] Check server is running (Terminal 1)

---

## 🌐 Step 8: Test in Browser

### Open URLs
- [ ] Open http://localhost:3000/ in your browser
  - [ ] Should see "Hand Pose Game" home page
  - [ ] Should see 4 navigation cards

- [ ] Click "Player 1" card
  - [ ] Should open player 1 page
  - [ ] Should see title "Player 1"
  - [ ] Should see camera placeholder area
  - [ ] Should see "Ready To Play" button

- [ ] Back to home (click ◀ Home)
- [ ] Click "Player 2" card
  - [ ] Same as Player 1 but says "Player 2"

- [ ] Back to home
- [ ] Click "Spectator" card
  - [ ] Should see "Spectator View"
  - [ ] Should see player comparison layout
  - [ ] Should see timer display

- [ ] Back to home
- [ ] Click "Debug" card
  - [ ] Should see "Debug Console"
  - [ ] Should see control buttons
  - [ ] Should see game state display

### Browser Success Check
- [ ] All 4 pages load without errors
- [ ] Styling looks correct (colors, layout)
- [ ] No JavaScript errors in console (F12)
- [ ] All buttons are visible and clickable

---

## 🎮 Step 9: Test Game Without Camera

### Using Debug Console
- [ ] Open http://localhost:3000/debug
- [ ] Click "Set Ready" for Player 1
  - [ ] Should show "✓ Ready" status
  - [ ] Activity log shows action
- [ ] Click "Set Ready" for Player 2
  - [ ] Should show "✓ Ready" status
  - [ ] Activity log shows action

- [ ] Click "Start Game"
  - [ ] Player 1 Ready status stays ✓
  - [ ] Player 2 Ready status stays ✓  
  - [ ] "Game Active: ✓ Yes" appears
  - [ ] "Current Task" shows a pose name

- [ ] Select a pose from "Pose Simulator" dropdown
- [ ] Set confidence to 0.85
- [ ] Click "Send to Player 1"
  - [ ] Activity log shows "Sent..."
  - [ ] Check if it matches current task:
    - [ ] If match: P1 score increases
    - [ ] If no match: Score unchanged

### Test Success Check
- [ ] Can set players ready
- [ ] Can start game
- [ ] Can see current task
- [ ] Can send test poses
- [ ] Scores update when pose matches task
- [ ] No JavaScript errors

---

## 📹 Step 10: Test With Real Camera

### Player 1 Setup
- [ ] Open http://localhost:3000/player1
- [ ] Click "Start Camera"
  - [ ] Browser asks for camera permission
  - [ ] Click "Allow"
  - [ ] Your camera feed should appear in the box
  - [ ] Check mark changes to "Camera: Active"

- [ ] Click "Ready To Play"
  - [ ] Button changes to "Unready"
  - [ ] Status shows "Ready! Waiting for other player..."

### Player 2 Setup (in another browser/device or same with 2 windows)
- [ ] Open http://localhost:3000/player2
- [ ] Click "Start Camera"
  - [ ] Same as Player 1
  
- [ ] Click "Ready To Play"
  - [ ] Game should automatically start!
  - [ ] You should both see:
    - [ ] A task name
    - [ ] Timer countdown
    - [ ] Current task display

### Perform Poses
- [ ] Wait for task (e.g., "Peace Sign")
- [ ] Perform that hand pose in front of camera
- [ ] Python detection should:
  - [ ] Recognize your pose
  - [ ] Send to server
  - [ ] If correct, increment score

- [ ] Watch score update:
  - [ ] Person who performs correctly first gets +1
  - [ ] Round ends
  - [ ] New task begins

### Camera Test Success Check
- [ ] Camera feed shows in both players
- [ ] Both can click ready
- [ ] Game starts automatically
- [ ] Can see current task
- [ ] Timer counts down
- [ ] Python detects poses
- [ ] Scores update when poses match

**If camera doesn't work**:
- [ ] Check browser permissions
- [ ] Try incognito mode
- [ ] Try different browser
- [ ] Restart browser
- [ ] Restart computer
- [ ] Ensure camera not used by other app

---

## 👁️ Step 11: Test Spectator View

- [ ] Open http://localhost:3000/spectator (3rd window)
- [ ] While Player 1 and Player 2 are playing:
  - [ ] Should show both players' scores
  - [ ] Should show current predictions
  - [ ] Should show confidence percentages
  - [ ] Should show timer counting down
  - [ ] Should show who is ready/not ready

- [ ] When round ends:
  - [ ] Should announce winner
  - [ ] Should show "🎉 Player X Wins!"
  - [ ] Should update scores

### Spectator Test Success Check
- [ ] Loads without errors
- [ ] Shows current task
- [ ] Shows both players' information
- [ ] Updates in real-time
- [ ] Shows winner announcements

---

## ⚙️ Step 12: Test Debug Console

- [ ] Open http://localhost:3000/debug
- [ ] Test Game Control:
  - [ ] Click "Reset Game" → State resets
  - [ ] Activity log shows action
  
- [ ] Test Timer Control:
  - [ ] Set timer to 20
  - [ ] Click "Set"
  - [ ] Timer field shows 20
  - [ ] Click "Start Timer"
  - [ ] Should count down (eventually)
  - [ ] Click "Stop Timer"
  - [ ] Should stop counting

- [ ] Test Pose Simulator:
  - [ ] Select "Peace Sign" from dropdown
  - [ ] Set confidence to 0.90
  - [ ] Click "Send to Player 1"
  - [ ] Check activity log (should show success)

- [ ] Test Activity Log:
  - [ ] Should show all actions with timestamps
  - [ ] Should show success/error messages
  - [ ] Should have ~20 entries visible

### Debug Console Test Success Check
- [ ] All buttons work
- [ ] State updates when actions taken
- [ ] Activity log shows actions
- [ ] Pose simulator sends poses
- [ ] No JavaScript errors

---

## 🎯 Step 13: Full Game Test

### Complete Game Scenario
1. [ ] Open 4 browser windows:
   - Window 1: http://localhost:3000/player1
   - Window 2: http://localhost:3000/player2
   - Window 3: http://localhost:3000/spectator
   - Window 4: http://localhost:3000/debug

2. [ ] Player 1 Window:
   - [ ] Click "Start Camera"
   - [ ] Verify camera feed
   - [ ] Click "Ready To Play"

3. [ ] Player 2 Window:
   - [ ] Click "Start Camera"
   - [ ] Verify camera feed
   - [ ] Click "Ready To Play"

4. [ ] Game should auto-start:
   - [ ] All 4 pages show current task
   - [ ] Timer counts down
   - [ ] Score shows 0-0

5. [ ] Both players perform pose:
   - [ ] First correct match wins
   - [ ] Score updates (1-0 or 0-1)
   - [ ] Spectator announces winner

6. [ ] Watch Spectator Window:
   - [ ] Shows live scores
   - [ ] Shows both predictions
   - [ ] Shows timer
   - [ ] Shows winner on round end

7. [ ] Check Debug Console:
   - [ ] All states correctly shown
   - [ ] Activity log shows all events
   - [ ] No errors or warnings

### Full Game Test Success Check
- [ ] All 4 pages work together
- [ ] Game flows correctly
- [ ] Scores update properly
- [ ] Winner is determined correctly
- [ ] All views synchronized
- [ ] No errors or lag

---

## 🐛 Step 14: Troubleshooting Verification

### Server Issues
If server won't start:
- [ ] Check Node.js installed: `node --version`
- [ ] Check npm installed: `npm install --version`
- [ ] Check npm install ran: `dir node_modules` shows express
- [ ] Check port 3000 free: `netstat -ano | findstr :3000`
- [ ] Try different port: `set PORT=3001` then `npm start`

### Camera Issues
If no camera feed:
- [ ] Check camera works: Open Windows Camera app
- [ ] Check browser permissions: Check browser settings
- [ ] Check incognito mode
- [ ] Try different browser
- [ ] Check no other app using camera
- [ ] Check network: `ipconfig`

### Python Issues
If Python detection won't run:
- [ ] Check Python installed: `python --version`
- [ ] Check MediaPipe: `pip list | findstr mediapipe`
- [ ] Reinstall: `pip install --upgrade mediapipe`
- [ ] Check server running: `http://localhost:3000`
- [ ] Check URL in Python script

### Network Issues
If can't connect to localhost:
- [ ] Check firewall allowing port 3000
- [ ] Check Windows Firewall:
  ```bash
  netsh advfirewall add rule name="Node.js" dir=in action=allow program="node.exe"
  ```
- [ ] Try 127.0.0.1:3000 instead of localhost:3000

---

## 📊 Step 15: Final Verification

### Checklist Complete?
- [ ] All software installed
- [ ] npm install successful
- [ ] pip packages installed
- [ ] Server running
- [ ] Python client running
- [ ] All 4 pages load
- [ ] Camera works
- [ ] Game flows correctly
- [ ] Scores update
- [ ] Real-time updates work
- [ ] Debug console works

### Performance Check
- [ ] No lag between actions
- [ ] Updates happen within 1 second
- [ ] Spectator view synchronized
- [ ] No memory leaks (check Task Manager)
- [ ] CPU usage reasonable (<20%)

### Functionality Check
- [ ] Ready buttons work
- [ ] Timer works correctly
- [ ] Poses detected properly
- [ ] Scores increment correctly
- [ ] Winner determined correctly
- [ ] All pages refresh properly
- [ ] No errors in browser console (F12)

---

## ✨ Congratulations! 🎉

If you've checked all boxes, your system is **ready to play**!

### What's Next?

1. **Customize Tasks**: Add more poses in `server.js`
2. **Integrate Your Detection**: Replace pose detection in Python
3. **Adjust Scoring**: Modify game rules in `server.js`
4. **Deploy Online**: Share with others (add security!)
5. **Add Features**: Score boards, replay, etc.

---

## 🆘 Still Having Issues?

1. **Read Documentation**: START_HERE.md → README.md → ARCHITECTURE.md
2. **Check Logs**: Look at terminal output and browser console (F12)
3. **Debug Console**: Use http://localhost:3000/debug to inspect state
4. **Isolate Issue**: Test each component separately
5. **Search Error**: Google the exact error message

---

## 📋 Shortcut Checklist

**Pre-Game Checklist** (every time you play):

- [ ] Terminal 1: `npm start` (server running)
- [ ] Terminal 2: `python pose_detection_client.py --player player1`
- [ ] Terminal 3: `python pose_detection_client.py --player player2`
- [ ] Browser 1: http://localhost:3000/player1
- [ ] Browser 2: http://localhost:3000/player2  
- [ ] Browser 3: http://localhost:3000/spectator
- [ ] Browser 4: http://localhost:3000/debug (optional)
- [ ] Both players click "Start Camera"
- [ ] Both players click "Ready To Play"
- [ ] Game starts automatically!

---

**You're all set! Have fun playing! 🎮**
