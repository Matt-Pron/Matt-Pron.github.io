import { random } from './math.js';
import { generateDijkstraMap } from './dijkstraMap.js';

export class Player {
	constructor(x,y){
		const heroes = [
			{ name: 'Glorfindel', race: 'Elf', class: 'Warrior' },
			{ name: 'Aragorn', race: 'Man', class: 'Ranger' },
			{ name: 'Legolas', race: 'Elf', class: 'Archer' },
			{ name: 'Gimli', race: 'Dwarf', class: 'Warrior' },
			{ name: 'Gandalf', race: 'Istari', class: 'Mage' },
			{ name: 'Faramir', race: 'Man', class: 'Captain' },
			{ name: 'Galadriel', race: 'Elf', class: 'Warrior' },
			{ name: 'Boromir', race: 'Man', class: 'Captain' },
			{ name: 'Eowyn', race: 'Man', class: 'Shieldmaiden' },
			{ name: 'Eomer', race: 'Man', class: 'Knight' },
			{ name: 'Peregrin', race: 'Halfling', class: 'Squire' }
		];

		const template = heroes[random(0, heroes.length - 1)];

		this.name = template.name;
		this.race = template.race;
		this.class = template.class;

		this.hp = 25;
		this.hpMax = 25;
		this.char = '@';
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

export class Cleric {
	constructor(x, y) {
		this.name = 'Clérigo';
		this.char = 'C';
		this.x = x;
		this.y = y;
	}

	interact(target) {
		if (target.hp < target.hpMax) {
			target.hp = target.hpMax;
			return `El Clérigo te ha sanado.`;
		}
		return `Ya tienes la salud al máximo.`;
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
		this.atkMin = name === 'Orc' ? 2 : 1;
		this.atkMax = name === 'Orc' ? 4 : 2;
	}

	attack(target) {
		const damage = random(this.atkMin, this.atkMax);
		target.hp -= damage;
		if (target.hp <= 0) {
			target.hp = 0;
		}
		return {
			attacker: this.name,
			damage: damage
		};
	}

	moveTowards(dMap, entities, player) {
		const currentHeat = dMap[this.y][this.x];

		if (currentHeat === Infinity || currentHeat > (this.detectionRadius + random(0, 2)) return;

		if (currentHeat === 1) {
			return this.attack(player);
		}

		const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
		let bestMove = { x: this.x, y: this.y, val: currentHeat };

		for (const [dx,dy] of dirs) {
			const nx = this.x + dx;
			const ny = this.y + dy;

			if (dMap[ny] && dMap[ny][nx] < bestMove.val) {
				const occupied = entities.some(e => e.x === nx && e.y === ny);

				if (!occupied) {
					bestMove = { x: nx, y: ny, val: dMap[ny][nx] };
				}
			}
		}
		this.x = bestMove.x;
		this.y = bestMove.y;
	}

}

export class Goblin extends Monster {
	constructor(x, y) {
		super('Goblin', 2, 14, 'g', x, y);
	}
}

export class Orc extends Monster {
	constructor(x, y) {
		super('Orco', 8, 18, 'O', x, y);
	}
}

function getValidSpawnPos(map, entities, playerPos = null, minPlayerDist = 18) {
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

export function populateMap(map, entities, clericPos) {
	if (clericPos) {
		entities.push(new Cleric(clericPos.x, clericPos.y));
	}

	const pPos = getValidSpawnPos(map, entities);

	if (pPos) {
		entities.push(new Player(pPos.x, pPos.y));
	}

	const player = entities.find(e => e instanceof Player);

	const counts = { orc: 3, goblin: 14 };

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

	if (orcs < 3) {
		const pos = getValidSpawnPos(map, entities, player);
		if (pos) entities.push(new Orc(pos.x, pos.y));
	}
	if (goblins < 14) {
		const pos = getValidSpawnPos(map, entities, player);
		if (pos) entities.push(new Goblin(pos.x, pos.y));
	}
}

