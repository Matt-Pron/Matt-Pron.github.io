import { Monster } from './entities.js';

export function generateDijkstraMap(map, goalX, goalY, maxRange, entities = []) {
	const width = map[0].length;
	const height = map.length;

	const dMap = Array.from({ length: height }, () => Array(width).fill(Infinity));

	const qeue = [{ x: goalX, y: goalY, dist: 0 }];
	dMap[goalY][goalX] = 0;

	const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    const monsters = entities.filter(e => e instanceof Monster);

	while (qeue.length > 0) {
		const { x, y, dist } = qeue.shift();

		if (dist >= maxRange) continue;

		for (const [dx, dy] of dirs) {
			const nx = x + dx, ny = y + dy;

            const isOccupied = monsters.some(e => e.x === nx && e.y === ny);
            if (ny >= 0 && ny < height && nx < width && map[ny][nx] === 1) { //&& !isOccupied) {
                const stepCost = isOccupied ? 2 : 1;
                //const stepCost = 1;
                const newDist = dist + stepCost;

                if (newDist < dMap[ny][nx]) {
                    dMap[ny][nx] = newDist;
                    qeue.push({ x: nx, y: ny, dist: newDist });

                    qeue.sort((a, b) => a.dist - b.dist);
                }
            }
		}
	}
	return dMap;
}

