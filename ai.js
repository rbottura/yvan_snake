// ai.js - pathfinding and heuristic helpers
function hamIdx(x, y) {
  return y % 2 === 0
    ? y * CFG.COLS + x
    : y * CFG.COLS + (CFG.COLS - 1 - x);
}

function bfs(start, goal, blocked) {
  const key = (p) => p.x + "," + p.y;
  const queue = [{ pos: start, path: [] }];
  const vis = new Set([key(start)]);
  const ds = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  while (queue.length) {
    const { pos, path } = queue.shift();
    for (const d of ds) {
      const nx = pos.x + d.x,
        ny = pos.y + d.y;
      if (nx < 0 || nx >= CFG.COLS || ny < 0 || ny >= CFG.ROWS) continue;
      const k = nx + "," + ny;
      if (vis.has(k) || blocked.has(k)) continue;
      const np = [...path, d];
      if (nx === goal.x && ny === goal.y) return np;
      vis.add(k);
      queue.push({ pos: { x: nx, y: ny }, path: np });
    }
  }
  return null;
}

function getAIDir() {
  const head = snake[0];
  const sset = new Set(snake.map((s) => s.x + "," + s.y));
  const path = bfs(head, apple, sset);
  if (path && path.length > 0) {
    const d = path[0];
    const nh = { x: head.x + d.x, y: head.y + d.y };
    const sim = [nh, ...snake];
    if (!(nh.x === apple.x && nh.y === apple.y)) sim.pop();
    const simSet = new Set(sim.slice(0, -1).map((p) => p.x + "," + p.y));
    const tail = sim[sim.length - 1];
    if (bfs(nh, tail, simSet)) return d;
  }
  const hi = hamIdx(head.x, head.y);
  const ds = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  let best = null,
    bestDiff = Infinity;
  for (const d of ds) {
    const nx = head.x + d.x,
      ny = head.y + d.y;
    if (nx < 0 || nx >= CFG.COLS || ny < 0 || ny >= CFG.ROWS) continue;
    if (sset.has(nx + "," + ny)) continue;
    const ni = hamIdx(nx, ny);
    const diff = (ni - hi + CFG.COLS * CFG.ROWS) % (CFG.COLS * CFG.ROWS);
    if (diff > 0 && diff < bestDiff) {
      bestDiff = diff;
      best = d;
    }
  }
  if (best) return best;
  for (const d of ds) {
    const nx = head.x + d.x,
      ny = head.y + d.y;
    if (nx < 0 || nx >= CFG.COLS || ny < 0 || ny >= CFG.ROWS) continue;
    if (!sset.has(nx + "," + ny)) return d;
  }
  return dir;
}
