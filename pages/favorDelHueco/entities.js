import { eventBus } from './eventBus.js';

import * as Components from './entitiesUtils.js';
import MonsterData from './data/monsters.json' with { type: 'json' };
import WeaponData from './data/weapons.json' with { type: 'json' };
import ItemData from './data/items.json' with { type: 'json' };
import { chase, flee, seekPath, wander } from './pathfinding.js';
import { random } from './math.js';

export class Entity {
	constructor(x, y, char, color) {
		this.x = x;
		this.y = y;
        this.char = char || 'E';
        this.color = color || 1;
	}
}

export class Player extends Entity {
	constructor(x, y, playerData) {
        super(x, y);

        this.name = playerData.name;
        this.race = playerData.race; // raza cambia stats (dex, str, con)
        this.class = playerData.class; // clase cambia stats + armamento
        this.char = playerData.char;
        this.color = playerData.color;

        Components.c_stats(this);
        Components.c_hp(this, 180);
        Components.c_atk(this, [10, 25], 40);
        Components.c_def(this, 70);
        Components.c_energy(this, 10);
        Components.c_exp(this);
        Components.c_lightSource(this, 6);
        this.equipLight(ItemData.lightSources.torch);

        if (this.weapon) {
            const wStats = WeaponData[this.weapon];
            this.weapon = { ...wStats };
        }
	}
}

export class Cleric extends Entity {
    constructor(x, y) {
        super(x, y);
        this.char = 'C';
        this.color = 9;
        this.name = 'Clérigo';
        this.isAlive = true;

        Components.c_energy(this, 0, 2);
        Components.c_lightSource(this, 5);
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
        this.color = data.color;
        this.detection = data.detection;

        this.lastX = x;
        this.lastY = y;

        Components.c_hp(this, data.hp);
        Components.c_atk(this, data.atk, data.skill);
        Components.c_def(this, data.def);
        Components.c_energy(this, 0, data.speed);
        Components.c_desire(this);

        if (data.psychology) {
            this.psychology = {
                aggression: random(data.psychology.aggressionMin, data.psychology.aggressionMax),
                fear: random(data.psychology.fearMin, data.psychology.fearMax),
                laziness: random(data.psychology.lazinessMin, data.psychology.lazinessMax),
                rangedPref: random(data.psychology.rangedPrefMin, data.psychology.rangedPrefMax),
                curiosity: random(data.psychology.curiosityMin, data.psychology.curiosityMax),
            };
        }

        if (data.weapon) {
            const wStats = WeaponData[data.weapon];
            this.weapon = { ...wStats };
        }
    }

    takeTurn(gameState, flowMap) {
        this.decideDesire(gameState);

        switch (this.currentDesire) {
            case 'desist':
            case 'wait':
                this.regen();
                return;

            case 'regen':
                console.log(`${this.prefix[1]} ${this.name} se cura.`);
                if (this.hp < this.maxHp) this.heal(Math.floor(this.maxHp * 0.12));
                return;

            case 'ranged':
                console.log(`${this.prefix[1]} ${this.name} te lanza una piedra!`);
                // if (manhattan <= 8) {
                //     this.rangedAttack(gameState.player);
                // }
                return;

            case 'flee': // Maybe use pathfinding to run away clever
                console.log(`${this.prefix[1]} ${this.name} huye!`);
                flee(gameState, this, flowMap, gameState.player.x, gameState.player.y);
                return;

            case 'wander':
                wander(gameState, this);
                return;

            case 'sprint':
                chase(gameState, this, gameState.player, flowMap);
                if (this.hasEnergy(15)) {
                    chase(gameState, this, gameState.player, flowMap);
                    this.useEnergy(15);
                }
                return;

            case 'chase':
                chase(gameState, this, gameState.player, flowMap);
                return;
        }

        // move the movement to pathfinding.js' moveTo();
        // from here
        const px = gameState.player.x;
        const py = gameState.player.y;
        const manhattan = Math.abs(this.x - px) + Math.abs(this.y - py);

        if (manhattan === 1) {
            this.attack(gameState.player);
            return;
        }

        const nextStep = seekPath(gameState, this, px, py, flowMap);

        if (nextStep) {
            if (nextStep.x === this.lastX && nextStep.y === this.lastY && Math.random() < 0.5) return;

            gameState.updateEntityPosition(this, nextStep.x, nextStep.y);
            this.lastX = nextStep.x;
            this.lastY = nextStep.y;
            console.log(`${this.prefix[1]} ${this.name} te persigue.`);
        }
        // to here
    }
}

export class LightStand extends Entity {
	constructor(x, y, type = 'torch') {
        super(x, y);
        this.name = 'Torch stand';
        this.char = type === 'torch' ? 'i' : 'î';
        this.color = 9;
        this.blocksNavigation = true;

        this.currentLight = null;
        if (type === 'torch' || type === 'lamp') {
            this.currentLight = { ...ItemData.lightSources[type], name: type };
        }

        this.updateAppearance();
    }

    updateAppearance() {
        if (!this.currentLight) {
            this.char = 'l';
            this.baseLightRadius = 0;
        } else {
            this.char = this.currentLight.name === 'torch' ? 'i' : 'Î';
            this.baseLightRadius = this.currentLight.radius;
        }
    }

    get lightRadius() {
        return this.baseLightRadius;
    }

    interact(player) {
        if (player.activeLight) {
            const playerItemType = player.activeLight.name;

            if (this.currentLight) {
                const standItemType = this.currentLight.name;

                const tempLight = { ...this.currentLight };
                this.currentLight = { ...player.activeLight };
                player.equipLight(tempLight);

                console.log(`Cambias tu ${playerItemType} por un ${standItemType} del soporte.`);
            } else {
                this.currentLight = { ...player.activeLight };
                player.activeLight = null;
                console.log(`Colocas tu ${playerItemType} en el soporte.`);
            }
        } 
        else if (this.currentLight) {
            const standItemType = this.currentLight.name;
            player.equipLight(this.currentLight);
            this.currentLight = null;
            console.log(`Tomas el ${standItemType} del soporte.`);
        } 
        else {
            console.log(`El soporte está vacío.`);
        }

        this.updateAppearance();
    }
        // this.interact should allow to pick or place a light item
        // if you have both torch and lamp, it should cycle each time null>0>1>null>0>1...
        // lightsources in the stand should keep it remaining energy and not lose it with turns passing.
        // player light sources should be an integer,
        // like 1700 and lose a torch every time it hits a % of the light type duration
}

