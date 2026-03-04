// ui.js - DOM interactions and HUD/overlay handling
const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("finalScore");
const startBtn = document.getElementById("startBtn");
const modeBtn = document.getElementById("modeBtn");
const pauseBtn = document.getElementById("pauseBtn");

const inputCols = document.getElementById("inputCols");
const inputRows = document.getElementById("inputRows");
const inputSpeed = document.getElementById("inputSpeed");
const themeSelect = document.getElementById("themeSelect");
const bgVideo = document.getElementById("bgVideo");

// Settings panel elements
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closesettingsBtn");
const inGameModeBtn = document.getElementById("inGameModeBtn");
const inGameSpeed = document.getElementById("inGameSpeed");
const speedValue = document.getElementById("speedValue");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

let currentTheme = "green-black"; // default theme
let wasGameRunning = false;
let autoRestartInterval = null;
let autoRestartRemaining = 0;

function cancelAutoRestart() {
  if (autoRestartInterval) {
    clearInterval(autoRestartInterval);
    autoRestartInterval = null;
    autoRestartRemaining = 0;
  }
  const countdownEl = document.getElementById('autoRestartCountdown');
  if (countdownEl && countdownEl.parentNode) countdownEl.parentNode.removeChild(countdownEl);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.body.className = theme === "green-black" ? "" : `theme-${theme}`;
  
  // Show/hide video based on theme
  if (theme === "sky-transparent" || theme === "sky-canvas") {
    bgVideo.style.display = "block";
  } else {
    bgVideo.style.display = "none";
  }
}

function toggleMode() {
  autopilot = !autopilot;
  modeBtn.textContent = autopilot ? "🤖 AUTOPILOT" : "🎮 MANUAL";
  modeBtn.classList.toggle("manual", !autopilot);
  // Update in-game mode button too
  inGameModeBtn.textContent = autopilot ? "🤖 AUTOPILOT" : "🎮 MANUAL";
  inGameModeBtn.classList.toggle("autopilot", autopilot);
  inGameModeBtn.classList.toggle("manual", !autopilot);
}

function showGameOver(text) {
  finalScoreEl.textContent = text;
  overlay.querySelector("h1").textContent = "GAME OVER";
  overlay.querySelector("p").textContent = "Press start to play again";
  startBtn.textContent = "↺ RESTART";
  overlay.classList.remove("hidden");
  // Hide settings panel
  hideSettingsPanel();
  settingsBtn.classList.add("hidden");
  // Start auto-restart countdown (5 seconds)
  cancelAutoRestart();
  autoRestartRemaining = 5;
  // update UI countdown next to final score
  const countdownNodeId = 'autoRestartCountdown';
  let countdownEl = document.getElementById(countdownNodeId);
  if (!countdownEl) {
    countdownEl = document.createElement('div');
    countdownEl.id = countdownNodeId;
    countdownEl.style.marginTop = '8px';
    countdownEl.style.color = '#aaa';
    countdownEl.style.fontSize = '14px';
    overlay.appendChild(countdownEl);
  }
  countdownEl.textContent = `Restarting in ${autoRestartRemaining}s...`;
  autoRestartInterval = setInterval(() => {
    autoRestartRemaining -= 1;
    if (countdownEl) countdownEl.textContent = `Restarting in ${autoRestartRemaining}s...`;
    if (autoRestartRemaining <= 0) {
      cancelAutoRestart();
      // start a fresh game with current CFG settings
      overlay.classList.add('hidden');
      if (typeof resetGame === 'function') resetGame();
      updateHUD();
      // ensure settings button visibility updates
      if (snake && !gameOver) settingsBtn.classList.remove('hidden');
    }
  }, 1000);
}

function updateHUD() {
  document.getElementById("scoreDisplay").textContent = score || 0;
  document.getElementById("lengthDisplay").textContent = snake ? snake.length : 0;
  document.getElementById("speedDisplay").textContent = CFG.BASE_FPS;
}

function togglePause() {
  paused = !paused;
  if (pauseBtn) pauseBtn.textContent = paused ? "▶ RESUME" : "⏸ PAUSE";
}

function showSettingsPanel() {
  // Auto-pause the game
  if (!paused && snake && !gameOver) {
    wasGameRunning = true;
    paused = true;
    if (pauseBtn) pauseBtn.textContent = "▶ RESUME";
  }
  
  // Update in-game settings to match current state
  inGameModeBtn.textContent = autopilot ? "🤖 AUTOPILOT" : "🎮 MANUAL";
  inGameModeBtn.classList.toggle("autopilot", autopilot);
  inGameModeBtn.classList.toggle("manual", !autopilot);
  inGameSpeed.value = CFG.BASE_FPS;
  speedValue.textContent = CFG.BASE_FPS;
  
  settingsPanel.classList.remove("hidden");
  settingsPanel.classList.add("shown");
}

function hideSettingsPanel() {
  settingsPanel.classList.remove("shown");
  settingsPanel.classList.add("hidden");
  wasGameRunning = false;
}

startBtn.addEventListener("click", () => {
  // Cancel auto-restart if running (user manually starting)
  cancelAutoRestart();
  // Apply selected theme
  const selectedTheme = themeSelect.value;
  applyTheme(selectedTheme);
  
  // read config inputs
  const cols = parseInt(inputCols.value, 10) || CFG.COLS;
  const rows = parseInt(inputRows.value, 10) || CFG.ROWS;
  const speed = parseInt(inputSpeed.value, 10) || CFG.BASE_FPS;
  CFG.COLS = Math.max(5, cols);
  CFG.ROWS = Math.max(5, rows);
  CFG.BASE_FPS = Math.max(1, Math.min(60, speed));
  console.log(rows, cols, speed);
  // resize canvas to new grid
  if (typeof windowResized === "function") windowResized();
  overlay.classList.add("hidden");
  if (typeof resetGame === "function") resetGame();
  updateHUD();
});

modeBtn.addEventListener("click", toggleMode);
if (pauseBtn) pauseBtn.addEventListener("click", togglePause);

// Settings panel event listeners
settingsBtn.addEventListener("click", showSettingsPanel);
closeSettingsBtn.addEventListener("click", hideSettingsPanel);

resumeBtn.addEventListener("click", () => {
  // Resume the paused game
  cancelAutoRestart();
  paused = false;
  if (pauseBtn) pauseBtn.textContent = "⏸ PAUSE";
  hideSettingsPanel();
});

restartBtn.addEventListener("click", () => {
  // Reset game with current settings overlay
  cancelAutoRestart();
  hideSettingsPanel();
  overlay.querySelector("h1").textContent = "SNAKE";
  overlay.querySelector("p").textContent = "Autopilot ON by default — press <b>M</b> to take manual control";
  startBtn.textContent = "▶ START";
  overlay.classList.remove("hidden");
  settingsBtn.classList.add("hidden");
  // Reset cols and rows to current (or user can change them)
  inputCols.value = CFG.COLS;
  inputRows.value = CFG.ROWS;
  inputSpeed.value = CFG.BASE_FPS;
});

inGameModeBtn.addEventListener("click", toggleMode);

inGameSpeed.addEventListener("input", (e) => {
  const newSpeed = parseInt(e.target.value, 10);
  speedValue.textContent = newSpeed;
  CFG.BASE_FPS = Math.max(1, Math.min(60, newSpeed));
  updateHUD();
});
