import { eventBus } from './eventBus.js';

import * as Components from './entitiesUtils.js';
import MonsterData from './data/monsters.json' with { type: 'json' };
import ItemData from './data/items.json' with { type: 'json' };
import { chase, flee, seekPath, wander } from './pathfinding.js';
import { random } from './math.js';
import { CAREERS, STARTER_CAREERS } from './data/careers.js';

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
        super(x, y, playerData.char, playerData.color);

        this.name = playerData.name;
        this.race = playerData.race;
        this.class = playerData.class;
        this.level = 1;

        this.careerData = CAREERS[this.class];

        this.statAdvances = { WS: 0, BS: 0, S: 0, T: 0, Ag: 0, Int: 0, A: 0, W: 0, M: 0, Mag: 0 };
        this.availableCareers = [...STARTER_CAREERS];
        this.completedCareers = [];

        Components.c_stats(this, playerData.race, playerData.class);
        Components.c_atk(this);
        Components.c_ammo(this);
        Components.c_energy(this, 10);
        Components.c_exp(this);
        Components.c_lightSource(this, 6);
        this.equipLight(ItemData.lightSources.torch);
        this.inventory = [];

        if (this.careerData && this.careerData.gear) {
            this.careerData.gear.forEach(item => {
                if (item.type === 'ammo') {
                    this.addAmmo(item.id, item.amount);
                } else if (item.type === 'armor') {
                    this.inventory.push(item);
                    if (!this.equippedArmor) {
                        this.equipArmor(item);
                    }
                } else {
                    this.inventory.push(item);
                    if (!this.weapon && item.type === 'melee') {
                        this.weapon = item;
                    }
                }
            });
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
        if (target.W < target.maxW) {
            //if (this.hasEnergy(10)) {
            eventBus.emit('on_message', `El Clérigo te ha sanado.`);
                target.heal(target.maxW - target.W);
            //    this.useEnergy(10);
            //} else return `El Clérigo se está recuperando.`;
        } else eventBus.emit('on_message', `Ya tienes la salud al máximo.`);
    }
}

export class Monster extends Entity {
    constructor(type, x, y) {
        const data = MonsterData[type];
        super(x, y, data.char, data.color);

        this.name = type;
        this.prefix = data.prefix;
        this.level = data.level;
        this.exp = data.xp;
        this.char = data.char;
        this.color = data.color;
        this.detection = data.detection;

        this.lastX = x;
        this.lastY = y;

        Components.c_stats(this, type);
        Components.c_atk(this);
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
            const wStats = ItemData.weapons[data.weapon];
            this.weapon = { ...wStats };
        }
        if (data.ammo) {
            this.ammo = { ...data.ammo };
        }
    }

    takeTurn(gameState, flowMap) {
        if (!this.isAlive) return;
        this.decideDesire(gameState);

        switch (this.currentDesire) {
            case 'desist':
            case 'wait':
                this.regen();
                return;

            case 'regen':
                // console.log(`${this.prefix[1]} ${this.name} se cura.`);
                if (this.W < this.maxW) this.heal(Math.floor(this.maxW * 0.12));
                return;

            case 'ranged':
                eventBus.emit('on_message', `${this.prefix[1]} ${this.name} te lanza una piedra!`);
                this.rangedAttack(gameState.player);
                // if (manhattan <= 8) {
                //     this.rangedAttack(gameState.player);
                // }
                return;

            case 'flee': // Maybe use pathfinding to run away clever
                eventBus.emit('on_message', `${this.prefix[1]} ${this.name} huye!`);
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

                eventBus.emit('on_message', `Cambias tu ${playerItemType} por un ${standItemType} del soporte.`);
            } else {
                this.currentLight = { ...player.activeLight };
                player.activeLight = null;
                eventBus.emit('on_message', `Colocas tu ${playerItemType} en el soporte.`);
            }
        } 
        else if (this.currentLight) {
            const standItemType = this.currentLight.name;
            player.equipLight(this.currentLight);
            this.currentLight = null;
            eventBus.emit('on_message', `Tomas el ${standItemType} del soporte.`);
        } 
        else {
            eventBus.emit('on_message', `El soporte está vacío.`);
        }

        this.updateAppearance();
    }
        // this.interact should allow to pick or place a light item
        // if you have both torch and lamp, it should cycle each time null>0>1>null>0>1...
        // lightsources in the stand should keep it remaining energy and not lose it with turns passing.
        // player light sources should be an integer,
        // like 1700 and lose a torch every time it hits a % of the light type duration
}

