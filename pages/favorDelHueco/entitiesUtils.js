import { random } from './math.js';
import { Player } from './entities.js';
import { eventBus } from './eventBus.js';
import { generateMonsterStats, generatePlayerStats, STAT_LABELS } from './data/characteristics.js';
import ItemData from './data/items.json' with { type: 'json' };
import { CAREERS } from './data/careers.js';
import { BresenhamLine } from './fov.js';

export const c_atk = (obj) => {
    obj.ammo = obj.ammo || { flechas: 0, piedras: 0, jabalinas: 0, balas: 0 };
    obj.equippedArmor = null;
    obj.alreadyDefended = false;

    obj.equipArmor = function(armorItem) {
        if (armorItem.type === 'armor') {
            obj.equippedArmor = armorItem;
            if (obj instanceof Player) eventBus.emit('on_message', `Te ponés una ${armorItem.name}.`);
            if (obj instanceof Player) eventBus.emit('on_player_stats_changed');
        }
    };

    obj.getDamageReduction = function(attackType) {
        const toughnessBonus = obj.TB;
        const armorPoints = obj.equippedArmor ? obj.equippedArmor.ap : 0;

        if (attackType === 'magical') return toughnessBonus;

        return toughnessBonus + armorPoints;
    };

    obj.tryDefend = function(attackType) {
        if (obj.alreadyDefended && !obj.onGuard) return false;

        const roll = random(1, 100);
        const dodgeChance = obj.Ag || 30;
        const parryChance = obj.WS || 30;

        if (attackType === 'melee') {
            const bestDefense = Math.max(dodgeChance, parryChance);
            const defType = bestDefense === parryChance ? 'parada' : 'esquiva';

            if (roll <= bestDefense) {
                obj.alreadyDefended = true;
                return defType;
            }
        } else if (attackType === 'ranged') {
            if (roll <= dodgeChance) {
                obj.alreadyDefended = true;
                return 'esquiva';
            }
        }
        return false;
    };

    obj.meleeAttack = function(target) {
        if (!target || !target.getDmg) return;

        const hitRoll = random(1,100);

        if (hitRoll > obj.WS) {
            if (obj instanceof Player) eventBus.emit('on_message', `Fallás el ataque.`);
            else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} falla el ataque.`);
            return;
        }

        const defense = target.tryDefend('melee');
        if (defense) {
            if (obj instanceof Player) {
                eventBus.emit('on_message', `${target.prefix[1]} ${target.name} se defendió de tu ataque.`);
            } else {
                eventBus.emit('on_message', `Te defendiste del ataque.`)
            }
            return;
        }

        const dmgRoll = random(1, 10);
        let totalDmg = dmgRoll + obj.SB;
        if (obj.weapon && obj.weapon.type === 'melee') totalDmg += (obj.weapon.dmgBonus || 0);

        const mitigation = target.getDamageReduction('melee');
        const finalDmg = Math.max(0, totalDmg - mitigation);

        if (finalDmg <= 0) {
            eventBus.emit('on_message', `El ataque no logra hacer daño.`);
            return;
        }

        if (obj instanceof Player) eventBus.emit('on_message', `Golpeás ${target.prefix[0]} ${target.name} por ${finalDmg}.`);
        else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} te golpea por ${finalDmg}.`);

        takeDmg(obj, target, finalDmg);
    };

    obj.rangedAttack = function(target) {
        if (!target || !target.getDmg || !this.ammo) return;

        const wpn = (obj.weapon && obj.weapon.type === 'ranged')
            ? obj.weapon
            : { name: 'piedras', type: 'ranged', dmgBonus: 0, range: 4, ammoType: 'piedras' };
        
        const dist = Math.sqrt((obj.x - target.x)**2 + (obj.y - target.y)**2);
        if (dist > wpn.range) return false;

        const currentAmmo = obj.ammo[wpn.ammoType] || 0;
        if (currentAmmo <= 0) {
            if (obj instanceof Player) eventBus.emit('on_message', 'No tenés sucifientes proyectiles.');
            return false;
        }

        obj.ammo[wpn.ammoType]--;
        if (obj instanceof Player) eventBus.emit('on_player_stats_changed');

        const hitRoll = random(1, 100);

        if (hitRoll > obj.BS) {
            if (obj instanceof Player) eventBus.emit('on_message', `Fallás el disparo.`);
            else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} falla el disparo.`);
            return true;
        }

        const defense = target.tryDefend('ranged');
        if (defense) {
            if (obj instanceof Player) eventBus.emit('on_message', `Esquivás el disparo.`);
            else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} esquiva el disparo.`);
            return true;
        }

        const dmgRoll = random(1, 10);
        let totalDmg = dmgRoll + (wpn.dmgBonus || 0);
        if (wpn.ammoType === 'jabalinas' || wpn === 'piedras') totalDmg += obj.SB;

        const mitigation = target.getDamageReduction('ranged');
        const finalDmg = Math.max(0, totalDmg - mitigation);

        if (finalDmg <= 0) {
            eventBus.emit('on_message', `El disparo no logra hacer daño.`);
            return true;
        }

        if (obj instanceof Player) eventBus.emit('on_message', `Disparás ${target.prefix[0]} ${target.name} por ${finalDmg}.`);
        else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} te dispara por ${finalDmg}.`);

        takeDmg(obj, target, finalDmg);
        return true;
    };

    function takeDmg(attacker, defender, damage) {
        const isDead = defender.getDmg(damage);
        if (isDead && attacker instanceof Player) {
            const xp = random(defender.exp[0], defender.exp[1]);
            eventBus.emit('on_message', `Matás ${defender.prefix[0]} ${defender.name}, ganas ${xp}p. de experiencia.`);
            attacker.gainXp(xp);
        } else if (isDead && defender instanceof Player) {
            eventBus.emit("on_player_death");
        }
    }
};

export const c_ammo = (obj) => {
    obj.ammo = {};
    Object.keys(ItemData.ammunition).forEach(key => {
        obj.ammo[key] = 0;
    });

    obj.addAmmo = function(type, amount) {
        const maxCap = ItemData.ammunition[type] ? ItemData.ammunition[type].max : 10;

        obj.ammo[type] += amount;

        if (obj.ammo[type] > maxCap) {
            const excess = obj.ammo[type] - maxCap;
            obj.ammo[type] = maxCap;
            if (obj instanceof Player) eventBus.emit('on_message', `Llevás demasiadas ${type}. Dejás ${excess} en el piso.`);
        } else {
            if (obj instanceof Player) eventBus.emit('on_message', `Levantás ${amount} ${type}.`);
        }
        if (obj instanceof Player) eventBus.emit('on_player_stats_changed');
    }
};

export const c_stats = (obj, raceOrType, className = '') => {
    let stats;

    if (obj instanceof Player) {
        stats = generatePlayerStats(raceOrType, className);
    } else {
        stats = generateMonsterStats(raceOrType);
    }

    obj.WS = stats.WS;
    obj.BS = stats.BS;
    obj.S = stats.S;
    obj.T = stats.T;
    obj.Ag = stats.Ag;
    obj.Int = stats.Int;
    // obj.WP = 0; // willpower
    // obj.Fel = 0; // fellowship

    obj.A = 1;
    obj.maxW = stats.maxW; obj.W = obj.maxW;
    Object.defineProperty(obj, 'SB', { get: function() { return Math.floor(this.S / 10); } });
    Object.defineProperty(obj, 'TB', { get: function() { return Math.floor(this.T / 10); } });
    obj.M = stats.M;
    obj.Mag = 0;
    // obj.IP = 0; // insanity
    // obj.FP = 0; // fate

    obj.isAlive = true;

    obj.getDmg = function(amount, type = 'melee') {
        obj.W -= amount;

        if (obj.W <= 0) {
            obj.W = 0;
            obj.die();
            return true;
        }
        return false;
    };

    obj.heal = function(amount) {
        obj.W = Math.max(1, Math.min(obj.maxW, obj.W + amount));
        if (obj instanceof Player) eventBus.emit('on_player_stats_changed');
        eventBus.emit('on_message', `${obj.name} sana ${amount} heridas.`);
    };

    obj.die = function() {
        obj.isAlive = false;
        eventBus.emit('on_entity_dead', obj);
    };
};

export const c_energy = (obj, _energy = 0, _speed = 10) => {
    obj.energy = _energy;
    obj.maxEnergy = 25;
    obj.speed = _speed;

    obj.regen = function() {
        obj.energy += obj.speed;
        if (obj.dex) obj.energy += obj.dex >> 1;

        if (obj.energy >= obj.maxEnergy) obj.energy = obj.maxEnergy;
    };

    obj.hasEnergy = function(amount) {
        if (obj.energy < amount) return false;
        return true;
    };

    obj.useEnergy = function(amount) {
        obj.energy -= amount;
        if (obj.energy <= 0) obj.energy = 0;
    };
};

export const c_exp = (obj) => {
    obj.exp = 0;
    obj.bonus = 1;

    obj.gainXp = function(amount) {
        obj.exp += amount;

        while (obj instanceof Player && obj.exp >= 100) {
            obj.exp -= 100;
            obj.bonus++;
            obj.level++;
            if (obj.bonus === 1) eventBus.emit('on_message', `¡Avance disponible!`);
            else if (obj.bonus >= 2) eventBus.emit('on_message', `¡${obj.bonus} avances disponibles!`);
            eventBus.emit('on_player_stats_changed');
        }
    };

    obj.getAvailableAdvances = function() {
        const upgrades = [];
        if (!obj.careerData || !obj.careerData.advances) return upgrades;

        for (let stat in obj.careerData.advances) {
            if (obj.statAdvances[stat] < obj.careerData.advances[stat]) {
                upgrades.push(stat);
            }
        }
        return upgrades;
    };

    obj.isCurrentCareerComplete = function() {
        if (!obj.careerData || !obj.careerData.advances) return false;
        for (let stat in obj.careerData.advances) {
            if (obj.statAdvances[stat] < obj.careerData.advances[stat]) return false;
        }
        return true;
    };

    obj.getCareerOptions = function() {
        return obj.availableCareers.filter(career =>
            !obj.completedCareers.includes(career) && career !== obj.class
        );
    };

    obj.spendBonus = function(choice) {
        if (obj.bonus < 1) return false;

        if (choice.type === 'stat') {
            const stat = choice.id;
            const maxAllowed = obj.careerData.advances[stat] || 0;

            if (obj.statAdvances[stat] < maxAllowed) {
                obj.bonus--;
                obj.statAdvances[stat]++;

                if (['A', 'W', 'M', 'Mag'].includes(stat)) {
                    if (stat === 'W') { obj.maxW++; obj.W++; }
                    else obj[stat]++;
                } else {
                    obj[stat] += 5;
                }

                eventBus.emit('on_message', `Mejoraste tu ${STAT_LABELS[stat]}.`);
                eventBus.emit('on_player_stats_changed');

                if (obj.isCurrentCareerComplete() && !obj.completedCareers.includes(obj.class)) {
                    obj.completedCareers.push(obj.class);
                    eventBus.emit('on_message', `¡Completaste la profesión de ${obj.class}!`);

                    if (obj.careerData.exits) {
                        obj.careerData.exits.forEach(exit => {
                            if (!obj.availableCareers.includes(exit)) {
                                obj.availableCareers.push(exit);
                            }
                        });
                    }
                }
                return true;
            }
        }
        else if (choice.type === 'career') {
            const newCareerId = choice.id;
            const validOptions = obj.getCareerOptions();

            if (validOptions.includes(newCareerId)) {
                obj.bonus--;

                obj.class = newCareerId;
                obj.careerData = CAREERS[newCareerId];

                eventBus.emit('on_message', `Comenzás la profesión de ${obj.class}.`);

                if (obj.isCurrentCareerComplete() && !obj.completedCareers.includes(obj.class)) {
                    obj.completedCareers.push(obj.class);
                    eventBus.emit('on_message', `¡Completaste la profesión de ${obj.class}!`);

                    if (obj.careerData.exits) {
                        obj.careerData.exits.forEach(exit => {
                            if (!obj.availableCareers.includes(exit)) {
                                obj.availableCareers.push(exit);
                            }
                        });
                    }
                }

                eventBus.emit('on_player_stats_changed');
                return true;
            }
        }

        return false;
    };
};

export const c_lightSource = (obj, baseRadius) => {
    obj.baseLightRadius = baseRadius;
    obj.activeLight = null;

    Object.defineProperty(obj, 'lightRadius', {
        get: function() {
            if (this.activeLight && this.activeLight.remaining > 0) {
                return Math.max(this.baseLightRadius, this.activeLight.radius);
            }
            return this.baseLightRadius;
        },
        configurable: true
    });

    obj.equipLight = function(lightData) {
        obj.activeLight = {
            ...lightData,
            remaining: lightData.duration
        };
        // eventBus.emit('on_message', `Equipas una luz. Radio: ${obj.activeLight.radius}`);
    };

    obj.lightDecrease = function() {
        if (obj.activeLight && obj.activeLight.remaining > 0) {
            obj.activeLight.remaining--;

            if (obj.activeLight.remaining <= 0) {
                obj.activeLight = null;
                eventBus.emit('on_message', `Tu combustible se acabó.`);
            }
        }
    };
};

export const c_desire = (obj) => {
    obj.psychology = {
        aggression: 70,
        fear: 25,
        laziness: 30,
        rangedPref: 0,
        curiosity: 40
    };

    obj.currentDesire = 'chase';

    obj.decideDesire = function(gameState) {
        const player = gameState.player;
        const manhattan = Math.abs(this.x - player.x) + Math.abs(this.y - player.y);
        const hasLOS = BresenhamLine(gameState.world, this.x, this.y, player.x, player.y);

        if (manhattan > this.detection) {
            if (this.psychology.curiosity < Math.random() * 100) {
                this.currentDesire = 'wander';
                return 'wander';
            }
            this.currentDesire = 'desist';
            return 'desist';
        }

        if (this.W < this.maxW) {
            if (this.W < this.maxW * 0.4) {
                if (this.psychology.fear > 40) {
                    this.currentDesire = 'flee';
                    this.currentDesire = 'chase';
                    return 'flee';
                }
            }
            if (this.W < this.maxW * 0.4 || Math.random() * 100 >= 60) {
                this.currentDesire = 'regen';
                return 'regen';
            }
        }

        if (this.energy < 12 && Math.random() * 100 < this.psychology.laziness) {
            this.currentDesire = 'wait';
            return 'wait';
        }

        if (this.psychology.rangedPref >= Math.random() * 100 && manhattan >= 3 && manhattan <= 9) { // use weapon range
            if (hasLOS) {
                this.currentDesire = 'ranged';
                return 'ranged';
            }
        }

        if (Math.random() * 100 < this.psychology.laziness * 0.3) {
            this.currentDesire = 'wait';
            return 'wait';
        }

        this.currentDesire = 'chase';
        return 'chase';
    };
};

