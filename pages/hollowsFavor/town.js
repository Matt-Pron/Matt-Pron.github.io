// town.js
export function generateTown(mapWidth = 100, mapHeight = 100) {
  // ── 1. Forest everywhere (3 = trees) ──
  let map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(3));

  // Outer border = 2 (impassable wall/cliff)
  for (let y = 0; y < mapHeight; y++) {
    map[y][0] = map[y][mapWidth - 1] = 3;
  }
  for (let x = 0; x < mapWidth; x++) {
    map[0][x] = map[mapHeight - 1][x] = 3;
  }
  for (let y = mapHeight / 2 - 2; y < mapHeight / 2 + 2; y++) {
    for (let x = mapWidth / 2 - 2; x < mapWidth / 2 + 2; x++) {
      map[y][x] = 1;
    }
  }

  const centerX = Math.floor(mapWidth / 2);
  const centerY = Math.floor(mapHeight / 2);

  // Forbidden central 5×5 zone
  const forbiddenRadius = 2; // 5 tiles = center ±2
  function isInForbiddenZone(x, y, w, h) {
    const left   = x;
    const right  = x + w - 1;
    const top    = y;
    const bottom = y + h - 1;
    return (
      left   <= centerX + forbiddenRadius &&
      right  >= centerX - forbiddenRadius &&
      top    <= centerY + forbiddenRadius &&
      bottom >= centerY - forbiddenRadius
    );
  }

  // ── Place 4 buildings ──
  const buildings = [];

  for (let i = 0; i < 5; i++) {
    const w = 5 + Math.floor(Math.random() * 3); // 5..7
    const h = 5 + Math.floor(Math.random() * 3);

    let x, y, placed = false;
    for (let attempt = 0; attempt < 500; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 13; // outside central 5×5
      x = Math.floor(centerX + Math.cos(angle) * dist - w / 2);
      y = Math.floor(centerY + Math.sin(angle) * dist - h / 2);

      x = Math.max(5, Math.min(mapWidth - w - 5, x));
      y = Math.max(5, Math.min(mapHeight - h - 5, y));

      if (isInForbiddenZone(x, y, w, h)) continue;

      // No overlap + minimum 2-tile separation
      const tooClose = buildings.some(b => {
        const sep = 2;
        return !(
          x + w + sep <= b.x ||
          x >= b.x + b.w + sep ||
          y + h + sep <= b.y ||
          y >= b.y + b.h + sep
        );
      });

      if (!tooClose) {
        placed = true;
        break;
      }
    }

    if (!placed) continue;

    // Draw building: border 2, inside 1
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        const isBorder = (
          yy === y || yy === y + h - 1 ||
          xx === x || xx === x + w - 1
        );
        map[yy][xx] = isBorder ? 2 : 1;
      }
    }

    buildings.push({ x, y, w, h, doorCarved: false });
  }

  // ── Central-ish plaza (4×4, mostly 4, corners 1) ──
  const sw = 4, sh = 4;
  let sx = centerX - 2;
  let sy = centerY - 2;

  let plazaPlaced = false;
  for (let attempt = 0; attempt < 200; attempt++) {
    if (!isInForbiddenZone(sx, sy, sw, sh) &&
        !buildings.some(b =>
          !(sx + sw <= b.x || sx >= b.x + b.w || sy + sh <= b.y || sy >= b.y + b.h)
        )) {
      plazaPlaced = true;
      break;
    }

    const angle = Math.random() * Math.PI * 2;
    const dist = 4 + Math.random() * 4;
    sx = Math.floor(centerX + Math.cos(angle) * dist - sw / 2);
    sy = Math.floor(centerY + Math.sin(angle) * dist - sh / 2);
    sx = Math.max(5, Math.min(mapWidth - sw - 5, sx));
    sy = Math.max(5, Math.min(mapHeight - sh - 5, sy));
  }

  if (plazaPlaced) {
    for (let yy = sy; yy < sy + sh; yy++) {
      for (let xx = sx; xx < sx + sw; xx++) {
        map[yy][xx] = 4;
      }
    }
    // Open corners
    map[sy][sx]         = 1;
    map[sy][sx + 3]     = 1;
    map[sy + 3][sx]     = 1;
    map[sy + 3][sx + 3] = 1;
  }

  // ── Connectivity helpers ──
  function isBuildingCorner(x, y, b) {
    return (
      (x === b.x || x === b.x + b.w - 1) &&
      (y === b.y || y === b.y + b.h - 1)
    );
  }

  function drunkardWalk(startX, startY, maxSteps = 80) {
    let x = startX, y = startY;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

    for (let step = 0; step < maxSteps; step++) {
      if (map[y][x] === 3) {
        map[y][x] = 1;
      }

      // Try to open door only if coming from cleared path (previous tile was 1)
      if (map[y][x] === 2) {
        // Approximate previous position (simple direction guess)
        const dx = x - startX > 0 ? 1 : x - startX < 0 ? -1 : 0;
        const dy = y - startY > 0 ? 1 : y - startY < 0 ? -1 : 0;
        const prevX = x - dx;
        const prevY = y - dy;

        if (prevX >= 0 && prevX < mapWidth && prevY >= 0 && prevY < mapHeight &&
            map[prevY][prevX] === 1) {
          for (const b of buildings) {
            if (!b.doorCarved &&
                x >= b.x && x < b.x + b.w &&
                y >= b.y && y < b.y + b.h &&
                !isBuildingCorner(x, y, b)) {
              map[y][x] = 1;
              b.doorCarved = true;
              break;
            }
          }
        }
        break; // stop after hitting wall
      }

      const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
      x = Math.max(4, Math.min(mapWidth - 5, x + dx));
      y = Math.max(4, Math.min(mapHeight - 5, y + dy));
    }
  }

  function isFullyConnected() {
    const visited = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(false));
    let start = null;

    for (let y = 1; y < mapHeight - 1; y++) {
      for (let x = 1; x < mapWidth - 1; x++) {
        if (map[y][x] === 1) {
          start = { x, y };
          break;
        }
      }
      if (start) break;
    }
    if (!start) return false;

    const queue = [start];
    visited[start.y][start.x] = true;
    let count = 1;

    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

    while (queue.length) {
      const { x, y } = queue.shift();
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) continue;
        if (!visited[ny][nx] && map[ny][nx] === 1) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
          count++;
        }
      }
    }

    let total = 0;
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (map[y][x] === 1) total++;
      }
    }

    return count === total;
  }

  // ── Persistent connection loop ──
  const totalTrees = map.flat().filter(tile => tile === 3).length
  const minTreeDensity = 0.8;
  const maxTreeDensity = 0.95;
  const minTreesAllowed = Math.floor(totalTrees * minTreeDensity);
  const maxTreesAllowed = Math.floor(totalTrees * maxTreeDensity);

  let treeCount = totalTrees;
  let connected = false;
  let attempt = 0;

  while ((treeCount > minTreesAllowed)) {
  //while ((treeCount > maxTreesAllowed || !connected) && attempt < maxAttempts) {
    attempt++;

    // Choose start point intelligently
    let startX = centerX;
    let startY = centerY;

    const floorCandidates = [];
    for (let y = mapHeight * .3; y < mapHeight * .7; y++) {
      for (let x = mapWidth * .3; x < mapWidth * .7; x++) {
        if ((map[y][x] === 1 || map[y][x] === 3) && Math.random() < 0.02) { // sparse sampling
          floorCandidates.push({ x, y });
        }
      }
    }

    if (floorCandidates.length > 0) {
      const pick = floorCandidates[Math.floor(Math.random() * floorCandidates.length)];
      startX = pick.x;
      startY = pick.y;
    } else if (buildings.length > 0) {
      const b = buildings[Math.floor(Math.random() * buildings.length)];
      startX = b.x + Math.floor(Math.random() * b.w);
      startY = b.y + Math.floor(Math.random() * b.h);
    }

    startX = Math.max(1, Math.min(mapWidth - 2, startX));
    startY = Math.max(1, Math.min(mapHeight - 2, startY));

    // Longer walk
    drunkardWalk(startX, startY, (mapWidth + mapHeight) / 2 * 8);

    treeCount = map.flat().filter(tile => tile === 3).length;
    connected = isFullyConnected();

    if (attempt % 30 === 0) {
      console.log(`Attempt ${attempt}/ — connected: ${connected}`);
    }
  }

  if (treeCount <= maxTreesAllowed && connected) {
    console.log(`Town fully connected after ${attempt} path attempts`);
    return map;
  } else {
    console.warn(`Could not fully connect all floor tiles after attempts`);
    return 0;
  }

}