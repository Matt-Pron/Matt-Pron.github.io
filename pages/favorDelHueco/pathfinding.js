import { getTileData } from "./data/tiles.js";

class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(item, priority) {
        this.heap.push({ item, priority });
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this._sinkDown(0);
        }
        return min.item;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(idx) {
        const element = this.heap[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.heap[parentIdx];
            if (element.priority >= parent.priority) break;
            this.heap[idx] = parent;
            this.heap[parentIdx] = element;
            idx = parentIdx;
        }
    }

    _sinkDown(idx) {
        const length = this.heap.length;
        const element = this.heap[idx];
        while (true) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            let left, right;
            let swap = null;

            if (leftIdx < length) {
                left = this.heap[leftIdx];
                if (left.priority < element.priority) swap = leftIdx;
            }
            if (rightIdx < length) {
                right = this.heap[rightIdx];
                if ((swap === null && right.priority < element.priority) || 
                    (swap !== null && right.priority < left.priority)) {
                    swap = rightIdx;
                }
            }
            if (swap === null) break;
            this.heap[idx] = this.heap[swap];
            this.heap[swap] = element;
            idx = swap;
        }
    }
}

const dirs = [
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }
];

export function getNeighbors(idx, width, height) {
    const x = idx % width;
    const y = (idx / width) | 0;
    const neighbors = [];

    if (y > 0) neighbors.push(idx - width);
    if (y < height - 1) neighbors.push(idx + width);
    if (x > 0) neighbors.push(idx - 1);
    if (x < width - 1) neighbors.push(idx + 1);

    return neighbors;
}

export function chase(gameState, entity, target, flowMap) {
    const manhattan = Math.abs(entity.x - target.x) + Math.abs(entity.y - target.y);

    if (manhattan === 1) {
        if (entity.attack) entity.attack(target);
        return;
    }

    const nextStep = seekPath(gameState, entity, target.x, target.y, flowMap);

    if (nextStep) {
        if (nextStep.x === entity.lastX && nextStep.y === entity.lastY && Math.random() < 0.5) return;

        gameState.updateEntityPosition(entity, nextStep.x, nextStep.y);
        entity.lastX = nextStep.x;
        entity.lastY = nextStep.y;
    }
}

export function flee(gameState, entity, flowMap, fallbackTargetX, fallbackTargetY) {
    let bestScore = -Infinity;
    let candidates = [];

    const currentDist = flowMap ? flowMap[entity.y]?.[entity.x] : undefined;
    const useFlowMap = currentDist !== undefined && currentDist !== Infinity;

    for (const { dx, dy } of dirs) {
        const nx = entity.x + dx;
        const ny = entity.y + dy;

        if (nx < 0 || nx >= gameState.world.width || ny < 0 || ny >= gameState.world.height) continue;

        const tileId = gameState.world.getTile(nx, ny);
        const tileData = getTileData(tileId);
        if (tileData && tileData.collision) continue;
        if (gameState.getEntityAt(nx, ny)) continue;

        let score = 0;
        if (useFlowMap) {
            const nDist = flowMap[ny]?.[nx];
            if (nDist !== undefined && nDist !== Infinity) {
                score = nDist;
            } else {
                score = currentDist + 1;
            }
        } else {
            score = Math.abs(nx - fallbackTargetX) + Math.abs(ny - fallbackTargetY);
        }

        if (score > bestScore) {
            bestScore = score;
            candidates = [{ x: nx, y: ny }];
        } else if (score === bestScore) {
            candidates.push({ x: nx, y: ny });
        }
    }

    if (candidates.length > 0) {
        const step = candidates[Math.floor(Math.random() * candidates.length)];
        gameState.updateEntityPosition(entity, step.x, step.y);
        entity.lastX = step.x;
        entity.lastY = step.y;
        return true;
    }
    return false;
}

export function wander(gameState, entity) {
    const valid = [];
    for (const { dx, dy } of dirs) {
        const nx = entity.x + dx;
        const ny = entity.y + dy;
        const tileId = gameState.world.getTile(nx, ny);
        const tileData = getTileData(tileId);
        if (tileData && tileData.collision) continue;
        if (gameState.getEntityAt(nx, ny)) continue;
        valid.push({ x: nx, y: ny });
    }
    if (valid.length > 0) {
        const step = valid[Math.floor(Math.random() * valid.length)];
        gameState.updateEntityPosition(entity, step.x, step.y);
        entity.lastX = step.x;
        entity.lastY = step.y;
    }
}

export function generateFlowMap(getTile, width, height, goalX, goalY, maxRange = 35) {
    const dist = Array.from({ length: height }, () => Array(width).fill(Infinity));

    const queue = [{ x: goalX, y: goalY, d: 0 }];
    dist[goalY][goalX] = 0;

    let head = 0;

    while (head < queue.length) {
        const { x, y, d } = queue[head++];

        if (d >= maxRange) continue;

        for (const { dx, dy } of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

            const tileId = getTile(nx, ny);
            const tileData = getTileData(tileId);
            if (!tileData || tileData.collision) continue;

            const newD = d + 1;
            if (newD < dist[ny][nx]) {
                dist[ny][nx] = newD;
                queue.push({ x: nx, y: ny, d: newD });
            }
        }
    }

    return dist;
}

// export function findPathAStar(getTile, width, height, startX, startY, goalX, goalY, maxLengthAllowed, gameState, currentMonster) {
export function findPathAStar(gameState, entity, goalX, goalY, maxLengthAllowed = 35) {
    const startX = entity.x;
    const startY = entity.y;

    const nodes = new Map();
    const posToKey = (x, y) => `${x},${y}`;

    const startKey = posToKey(startX, startY);
    nodes.set(startKey, { x: startX, y: startY, g: 0, f: 0, parent: null });

    const openList = [startKey];
    const closedSet = new Set();

    while (openList.length > 0) {
        openList.sort((a, b) => nodes.get(a).f - nodes.get(b).f);
        const currentKey = openList.shift();
        const current = nodes.get(currentKey);

        if (current.x === goalX && current.y === goalY) {
            const path = [];
            let temp = current;
            while (temp) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path.reverse();
        }

        closedSet.add(currentKey);

        const neighbors = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [dx, dy] of neighbors) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const nKey = posToKey(nx, ny);

            if (closedSet.has(nKey)) continue;

            const tileId = gameState.world.getTile(nx, ny);
            const tileData = getTileData(tileId);

            if (!tileData || tileData.collision) continue;

            const occupant = gameState.getEntityAt(nx, ny);
            if (occupant && occupant !== entity && (nx !== goalX || ny !== goalY)) continue;

            const gScore = current.g + 1;
            if (gScore > maxLengthAllowed) continue;

            if (!nodes.has(nKey) || gScore < nodes.get(nKey).g) {
                const h = Math.abs(nx - goalX) + Math.abs(ny - goalY);
                nodes.set(nKey, {
                    x: nx, y: ny,
                    g: gScore,
                    f: gScore + h,
                    parent: current
                });
                if (!openList.includes(nKey)) openList.push(nKey);
            }
        }
    }

    return null;
    // const cameFrom = new Map();
    // const gScore = new Map();
    // const fScore = new Map();
    //
    // const toKey = (x, y) => `${x},${y}`;
    //
    // const startKey = toKey(startX, startY);
    // gScore.set(startKey, 0);
    // fScore.set(startKey, Math.abs(startX - goalX) + Math.abs(startY - goalY));
    //
    // const openSet = new Set([startKey]);
    // const openList = [{ key: startKey, f: fScore.get(startKey) }];
    //
    // while (openList.length > 0) {
    //     openList.sort((a, b) => a.f - b.f);
    //     const currentKey = openList.shift().key;
    //     openSet.delete(currentKey);
    //
    //     const [cx, cy] = currentKey.split(',').map(Number);
    //
    //     if (cx === goalX && cy === goalY) {
    //         const path = [];
    //         let current = currentKey;
    //         while (current !== startKey) {
    //             path.push(current);
    //             current = cameFrom.get(current);
    //         }
    //         path.push(startKey);
    //         path.reverse();
    //         const positions = path.map(k => {
    //             const [x, y] = k.split(',').map(Number);
    //             return {x, y};
    //         });
    //         if (positions.length - 1 > maxLengthAllowed) return null;
    //         return positions;
    //     }
    //
    //     for (const { dx, dy } of dirs) {
    //         const nx = cx + dx;
    //         const ny = cy + dy;
    //         if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
    //
    //         if (getTile(nx, ny) !== 1) continue;
    //
    //         const isGoalTile = (nx === goalX && ny === goalY);
    //         if (!isGoalTile) {
    //             const occupant = gameState.getEntityAt(nx, ny);
    //             if (occupant && occupant !== currentMonster) continue;
    //         }
    //
    //         const tentG = gScore.get(currentKey) + 1;
    //         const nKey = toKey(nx, ny);
    //
    //         if (tentG < (gScore.get(nKey) ?? Infinity)) {
    //             cameFrom.set(nKey, currentKey);
    //             gScore.set(nKey, tentG);
    //             const f = tentG + Math.abs(nx - goalX) + Math.abs(ny - goalY);
    //             fScore.set(nKey, f);
    //
    //             if (!openSet.has(nKey)) {
    //                 openSet.add(nKey);
    //                 openList.push({ key: nKey, f });
    //             }
    //         }
    //     }
    // }
    //
    // return null;
}

export function seekPath(gameState, entity, targetX, targetY, flowMap) {
    const detectionRadius = entity.detection || 8;
    const manhattan = Math.abs(entity.x - targetX) + Math.abs(entity.y - targetY);

    const currentDist = flowMap[entity.y]?.[entity.x];

    const actualDist = (currentDist !== undefined && currentDist !== Infinity) ? currentDist : manhattan;

    if (actualDist > detectionRadius) return null;

    if (currentDist !== undefined && currentDist !== Infinity) {
            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            let bestDist = currentDist;
            let candidates = [];

            for (const [dx, dy] of dirs) {
                const nx = entity.x + dx;
                const ny = entity.y + dy;
                const nDist = flowMap[ny]?.[nx];

                if (nDist === undefined || nDist >= currentDist) continue;
                if (gameState.getEntityAt(nx, ny)) continue;

                if (nDist < bestDist) {// - 0.1) {
                    bestDist = nDist;
                    candidates = [{ x: nx, y: ny }];
                // } else if (Math.abs(nDist - bestDist) < 0.1) {
                } else if (nDist === bestDist) {
                    candidates.push({ x: nx, y: ny });
                }
            }

        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
    }

    if (manhattan <= (detectionRadius || 20)) {
        const path = findPathAStar(gameState, entity, targetX, targetY, 35);
        if (path && path.length > 1) {
            if (!gameState.getEntityAt(path[1].x, path[1].y)) {
                return path[1];
            }
        }
    }

    return null;
}

