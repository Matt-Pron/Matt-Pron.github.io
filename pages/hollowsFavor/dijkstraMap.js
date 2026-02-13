export function generateDijkstraMap(map, goalX, goalY, maxRange) {
	const width = map[0].length;
	const height = map.length;

	const dMap = Array.from({ length: height }, () => Array(width).fill(Infinity));

	const qeue = [{ x: goalX, y: goalY, dist: 0 }];
	dMap[goalY][goalX] = 0;

	const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

	while (qeue.length > 0) {
		const { x, y, dist } = qeue.shift();

		if (dist >= maxRange) continue;

		for (const [dx, dy] of dirs) {
			const nx = x + dx, ny = y + dy;

			if (ny >= 0 && ny < height && nx < width &&
				map[ny][nx] === 1 && dMap[ny][nx] === Infinity) {
				dMap[ny][nx] = dist + 1;
				qeue.push({ x: nx, y: ny, dist: dist + 1 });
			}
		}
	}
	return dMap;
}

