// game.js - game state and core logic
const CFG = { COLS: 19, ROWS: 11, BASE_FPS: 5 };
let snake, apple, dir, nextDir, score, gameOver, autopilot, frameAcc;
let paused = false;

function resetGame() {
  const cx = Math.floor(CFG.COLS / 2), cy = Math.floor(CFG.ROWS / 2);
  snake = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  frameAcc = 0;
  paused = false;
//   CFG.BASE_FPS = 2;
  placeApple();
}

function placeApple() {
  const occ = new Set(snake.map((s) => s.x + "," + s.y));
  let ax, ay;
  do {
    ax = Math.floor(Math.random() * CFG.COLS);
    ay = Math.floor(Math.random() * CFG.ROWS);
  } while (occ.has(ax + "," + ay));
  apple = { x: ax, y: ay };
}

function doStep() {
  if (autopilot) {
    dir = getAIDir();
  } else {
    if (!(nextDir.x === -dir.x && nextDir.y === -dir.y)) dir = nextDir;
  }
  const head = snake[0];
  const nh = { x: head.x + dir.x, y: head.y + dir.y };
  if (nh.x < 0 || nh.x >= CFG.COLS || nh.y < 0 || nh.y >= CFG.ROWS) {
    endGame();
    return;
  }
  for (let i = 0; i < snake.length - 1; i++) if (snake[i].x === nh.x && snake[i].y === nh.y) {
    endGame();
    return;
  }
  snake.unshift(nh);
  if (nh.x === apple.x && nh.y === apple.y) {
    score++;
    CFG.BASE_FPS = Math.min(CFG.BASE_FPS, CFG.BASE_FPS + Math.floor(score / 15));
    placeApple();
  } else {
    snake.pop();
  }
}

function endGame() {
  gameOver = true;
  const text = "Score: " + score + "  |  Length: " + snake.length;
  if (typeof showGameOver === "function") showGameOver(text);
}
