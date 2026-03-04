// sketch.js - p5 global-mode sketch and rendering
let cellW, cellH, canvasW, canvasH, diamondGfx;

function setup() {
  const hudH = document.getElementById("hud").offsetHeight;
  canvasW = window.innerWidth;
  canvasH = window.innerHeight - hudH;
  cellW = canvasW / CFG.COLS;
  cellH = canvasH / CFG.ROWS;
  // Create canvas with alpha for transparency support
  const cnv = createCanvas(canvasW, canvasH);
  cnv.parent(document.body);
  // Enable alpha for transparent canvas
  cnv.canvas.style.opacity = "1";
  frameRate(60);
  makeDiamond();
  autopilot = true;
}

function makeDiamond() {
  const dw = Math.ceil(cellW * 2.8),
    dh = Math.ceil(cellH * 2.8);
  diamondGfx = createGraphics(dw, dh);
  diamondGfx.textAlign(CENTER, CENTER);
  diamondGfx.textSize(Math.min(cellW, cellH) * 1.5);
  diamondGfx.text("💎", dw / 2, dh / 2);
}

function draw() {
  // Get current theme
  const theme = currentTheme || "green-black";
  
  // Show settings button during gameplay
  if (snake && !gameOver) {
    document.getElementById("settingsBtn").classList.remove("hidden");
  } else {
    document.getElementById("settingsBtn").classList.add("hidden");
  }
  
  if (!snake) {
    if (theme === "sky-canvas") {
      // Draw video on canvas for sky-canvas theme
      const bgVideo = document.getElementById("bgVideo");
      if (bgVideo && bgVideo.readyState === bgVideo.HAVE_ENOUGH_DATA) {
        image(bgVideo, 0, 0, canvasW, canvasH);
      } else {
        background("#1a1a1a");
      }
    } else if (theme === "sky-transparent") {
      // Transparent background - video shows through
      clear();
    } else {
      // Default green-black theme
      background("#A9E000");
    }
    return;
  }
  
  // Apply background based on theme
  if (theme === "sky-canvas") {
    const bgVideo = document.getElementById("bgVideo");
    if (bgVideo && bgVideo.readyState === bgVideo.HAVE_ENOUGH_DATA) {
      image(bgVideo, 0, 0, canvasW, canvasH);
    } else {
      background("#1a1a1a");
    }
  } else if (theme === "sky-transparent") {
    clear();
  } else {
    background("#A9E000");
  }
  
  // stroke(20, 22, 28);
  // strokeWeight(0.3);
  noStroke();
  
  // Set grid color based on theme
  if (theme === "green-black") {
    stroke(20, 22, 28, 100);
  } else if (theme === "sky-transparent" || theme === "sky-canvas") {
    stroke(255, 255, 255, 30);  // Light grid for sky backgrounds
  }
  strokeWeight(0.5);
  noStroke();
  for (let x = 0; x <= CFG.COLS; x++) line(x * cellW, 0, x * cellW, canvasH);
  for (let y = 0; y <= CFG.ROWS; y++) line(0, y * cellH, canvasW, y * cellH);
  if (gameOver) return;
  if (!paused) {
    frameAcc += deltaTime / 1000;
    const step = 1 / CFG.BASE_FPS;
    while (frameAcc >= step) {
      frameAcc -= step;
      doStep();
    }
  } else {
    // draw paused indicator
    push();
    fill(255, 255, 255, 64);
    textAlign(CENTER, CENTER);
    textSize(Math.min(cellW, cellH) * 0.9);
    text("PAUSED", width / 2, height / 2);
    pop();
  }
  const dw = diamondGfx.width,
    dh = diamondGfx.height;
  image(
    diamondGfx,
    apple.x * cellW - (dw - cellW) / 2,
    apple.y * cellH - (dh - cellH) / 2,
  );
  for (let i = snake.length - 1; i >= 0; i--) {
    const t = 1 - i / snake.length;
    const r = lerp(30, 80, t),
      g = lerp(100, 220, t),
      b = lerp(60, 120, t);
    fill(r, g, b);
    const seg = snake[i];
    const px = seg.x * cellW,
      py = seg.y * cellH;
    const sw = cellW * 1,
      sh = cellH * 1;
    // if (i === 0) {
    //   rect(px, py, sw, sh, sw * 0.5);
    //   fill(0, 0, 0, 220);
    //   const perp = { x: dir.y, y: -dir.x };
    //   const eo = Math.min(sw, sh) * 0.2,
    //     er = Math.min(sw, sh) * 0.12;
    //   const cx = px + sw / 2 + dir.x * sw * 0.2,
    //     cy = py + sh / 2 + dir.y * sh * 0.2;
    //   ellipse(cx + perp.x * eo, cy + perp.y * eo, er * 2);
    //   ellipse(cx - perp.x * eo, cy - perp.y * eo, er * 2);
    // } else {
    //   // rect(px, py, sw, sh, sw * 1);
    // }

    fill("black");
    let gap = cellW * 0.1;
    rect(px, py, sw / 4, sh / 4);
    rect(px + gap + sw / 4, py, sw / 4, sh / 4);
    rect(px + 2 * gap + (2 * sw) / 4, py, sw / 4, sh / 4);

    rect(px, py + gap + sh / 4, sw / 4, sh / 4);
    rect(px + gap + sw / 4, py + gap + sh / 4, sw / 4, sh / 4);
    rect(px + 2 * gap + (2 * sw) / 4, py + gap + sh / 4, sw / 4, sh / 4);

    rect(px, py + 2 * gap + (2 * sh) / 4, sw / 4, sh / 4);
    rect(px + gap + sw / 4, py + 2 * gap + (2 * sh) / 4, sw / 4, sh / 4);
    rect(
      px + 2 * gap + (2 * sw) / 4,
      py + 2 * gap + (2 * sh) / 4,
      sw / 4,
      sh / 4,
    );
  }
  updateHUD();
}

function keyPressed() {
  const k = keyCode,
    K = (key || "").toUpperCase();
  if (K === "M") {
    toggleMode();
    return;
  }
  if (K === "P") {
    if (typeof togglePause === "function") togglePause();
    return;
  }
  if (!autopilot) {
    if (k === UP_ARROW || K === "W") nextDir = { x: 0, y: -1 };
    if (k === DOWN_ARROW || K === "S") nextDir = { x: 0, y: 1 };
    if (k === LEFT_ARROW || K === "A") nextDir = { x: -1, y: 0 };
    if (k === RIGHT_ARROW || K === "D") nextDir = { x: 1, y: 0 };
  }
}

function windowResized() {
  const hudH = document.getElementById("hud").offsetHeight;
  canvasW = window.innerWidth;
  canvasH = window.innerHeight - hudH;
  cellW = canvasW / CFG.COLS;
  cellH = canvasH / CFG.ROWS;
  resizeCanvas(canvasW, canvasH);
  makeDiamond();
}
