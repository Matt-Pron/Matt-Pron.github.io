import { random } from './math.js';
import { generateDijkstraMap } from './dijkstraMap.js';
import { colors } from './palette.js';
import { eventBus } from './eventBus.js';

import * as Components from './entitiesUtils.js';
import MonsterData from './data/monsters.json' with { type: 'json' };
import WeaponData from './data/weapons.json' with { type: 'json' };

export class Entity {
	constructor(x,y){
		this.x = x;
		this.y = y;
        this.char = 'E';
        this.color = colors.WHITE;
	}
}

export class Player extends Entity {
	constructor(x,y){
        super(x, y);

        this.char = '@';
        this.color = colors.WHITE;

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
        // Creacion de personajes
        // nombre de un array
        // raza cambia stats (dex, str, con)
        // clase cambia stats + armamento

		const template = heroes[random(0, heroes.length - 1)];

		this.name = template.name;
		this.race = template.race;
		this.class = template.class;

        Components.c_stats(this);
        Components.c_hp(this, 80);
        Components.c_atk(this, [10, 25], 40);
        Components.c_def(this, 70);
        Components.c_energy(this, 10);
        Components.c_exp(this);

        if (this.weapon) {
            const wStats = weaponData[this.weapon];
            this.weapon = { ...wStats };
        }
	}
}

export class Cleric extends Entity {
    constructor(x, y) {
        super(x, y);
        this.char = 'C';
        this.color = colors.YELLOW;
        this.name = 'Clérigo';
        this.isAlive = true;

        Components.c_energy(this, 0, 2);
    }

    interact(target) {
        if (target.hp < target.maxHp) {
            //if (this.hasEnergy(10)) {
                target.heal(target.maxHp);
            //    this.useEnergy(10);
            eventBus.emit('on_message', `El Clérigo te ha sanado.`);
            //} else return `El Clérigo se está recuperando.`;
        } else eventBus.emit('on_message', `Ya tienes la salud al máximo.`);
    }
}

export class Monster extends Entity {
    constructor(type, x, y) {
        super(x, y);

        const data = MonsterData[type];

        this.name = type;
        this.prefix = data.prefix;
        this.level = data.level;
        this.exp = data.xp;
        this.char = data.char;
        this.color = colors[data.color];
        this.detection = data.detection;

        Components.c_hp(this, data.hp);
        Components.c_atk(this, data.atk, data.skill);
        Components.c_def(this, data.def);
        Components.c_energy(this, 0, data.speed);
        // Components.c_desire(this);

        if (data.weapon) {
            const wStats = WeaponData[data.weapon];
            this.weapon = { ...wStats };
        }
    }

	moveTowards(dMap, entities, player) { // Revisar A* (A* pathfinding e01 algorithm explanation sebastian lague)
		const currentHeat = dMap[this.y][this.x];

		if (currentHeat === Infinity || currentHeat > this.detection) return;

        const distToPlayer = Math.abs(this.x - player.x) + Math.abs(this.y - player.y)

		if (distToPlayer === 1) {
			this.attack(player);
            return;
		}

		const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
		let bestMove = { x: this.x, y: this.y, val: currentHeat };

		for (const [dx,dy] of dirs) {
			const nx = this.x + dx;
			const ny = this.y + dy;

			if (dMap[ny] && dMap[ny][nx] < bestMove.val) {
				const occupied = entities.some(e => e.x === nx && e.y === ny && e !== this);

				if (!occupied) {
					bestMove = { x: nx, y: ny, val: dMap[ny][nx] };
				}
			}
		}
		this.x = bestMove.x;
		this.y = bestMove.y;
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
    // Hacer que spawnee hasta un maximo de enemigos
    // Elegir los enemigos segun el nivel del jugador
    // Aumentar el maximo de enemigos segun el nivel del jugador
    let cleric = entities.find(e => e instanceof Cleric);
    if (clericPos && !cleric) {
        console.log('nuevo clerigo');
        entities.push(new Cleric(clericPos.x, clericPos.y));
    }

    let player = entities.find(e => e instanceof Player);

    if (!player) {
        const pPos = getValidSpawnPos(map, entities);
        if (pPos) {
            player = new Player(pPos.x, pPos.y);
            entities.push(player);
        }
    }

    const countMax = 20;
    const countCurrent = entities.filter(e => e instanceof Monster).length;
    const types = Object.keys(MonsterData);

    for (let m = countCurrent; m < countMax; m++) {
        const pos = getValidSpawnPos(map, entities, player);
        if (pos) {
            const monsterType = types[random(0, types.length - 1)];
            entities.push(new Monster(monsterType, pos.x, pos.y));
        }
    }
}

