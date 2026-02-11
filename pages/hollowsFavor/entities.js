import { random } from './math.js';
export class Player {
	constructor(x,y){
		this.name = 'Glorfindel';
		this.hp = 15;
		this.hpMax = 15;
		this.char = '@';
		this.race = 'Elf';
		this.class = 'Warrior';
		this.x = x;
		this.y = y;
		this.level = 1;
		this.xp = 0;
	}

	gainXp(amount) {
		this.xp += amount;
		let levelUp = null;

		while (this.xp >= 100) {
			this.level += 1;
			this.xp -= 100;
			levelUp = [random(1,4), this.level];
			this.hpMax += levelUp[0];
			this.hp = Math.min(this.hp + 10, this.hpMax);
		}

		return levelUp;
	}
}

export class Monster {
	constructor(name, hp, detectionRadius, char, x, y) {
		this.name = name;
		this.hp = hp;
		this.hpMax = hp;
		this.detectionRadius = detectionRadius;
		this.char = char;
		this.x = x;
		this.y = y;
	}
}

export class Goblin extends Monster {
	constructor(x, y) {
		super('Goblin', 2, 5, 'g', x, y);
	}
}

export class Orc extends Monster {
	constructor(x, y) {
		super('Orco', 8, 8, 'O', x, y);
	}
}

function getValidSpawnPos(map, entities, playerPos = null, minPlayerDist = 9) {
	const h = map.length;
	const w = map[0].length;

	for (let i = 0; i < 500; i++){
		const rx = Math.floor(Math.random() * w);
		const ry = Math.floor(Math.random() * h);

		if(map[ry][rx] !== 1) continue;
		if(entities.some(e => e.x === rx && e.y === ry)) continue;

		if (playerPos) {
			const dist = Math.sqrt((rx - playerPos.x)**2 + (ry - playerPos.y)**2);
			if (dist < minPlayerDist) continue;
		}

		return { x: rx, y: ry };
	}
	return null;
}

export function populateMap(map, entities) {
	const pPos = getValidSpawnPos(map, entities);
	if (pPos) {
		entities.push(new Player(pPos.x, pPos.y));
	}

	const player = entities.find(e => e instanceof Player);

	const counts = { orc: 2, goblin: 8 };

	for (const [type, count] of Object.entries(counts)) {
		for (let j = 0; j < count; j++) {
			const pos = getValidSpawnPos(map, entities, player);
			if (pos) {
				if (type === 'orc') entities.push(new Orc(pos.x, pos.y));
				if (type === 'goblin') entities.push(new Goblin(pos.x, pos.y));
			}
		}
	}
}

export function checkAndRespawn(map, entities) {
	let player = entities.find(e => e instanceof Player);

	if (!player) {
		const pPos = getValidSpawnPos(map, entities);
		if (pPos) {
			player = new Player(pPos.x, pPos.y);
			entities.push(player);
		}
	}

	const orcs = entities.filter(e => e instanceof Orc).length;
	const goblins = entities.filter(e => e instanceof Goblin).length;

	if (orcs < 2) {
		const pos = getValidSpawnPos(map, entities, player);
		if (pos) entities.push(new Orc(pos.x, pos.y));
	}
	if (goblins < 8) {
		const pos = getValidSpawnPos(map, entities, player);
		if (pos) entities.push(new Goblin(pos.x, pos.y));
	}
}

