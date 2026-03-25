import { random } from './math.js';
import { Player } from './entities.js';
import { eventBus } from './eventBus.js';

export const c_hp = (obj, _hp) => {
    obj.hp = _hp;
    obj.maxHp = _hp;
    obj.isAlive = true;

    if (obj.con) {
        obj.maxHp += obj.con >> 1;
        obj.hp = obj.maxHp;
    }

    obj.getDmg = function(amount) {
        obj.hp -= amount;
        // eventBus.emit('on_message', `${obj.name} pierde ${amount}ps.`);

        if (obj.hp <= 0) {
            obj.hp = 0;
            obj.die();
            return true;
        }
        return false;
    };

    obj.heal = function(amount) {
        obj.hp += amount;
        if (obj.hp > obj.maxHp) obj.hp = obj.maxHp;
        if (obj instanceof Player) eventBus.emit('on_player_stats_changed');
        eventBus.emit('on_message', `${obj.name} recupera ${amount}ps.`);
    };

    obj.die = function() {
        obj.isAlive = false;
        eventBus.emit('on_entity_dead', obj);
    };
}

export const c_atk = (obj, _atk, _skill = 0) => {
    obj.atkMin = _atk[0];
    obj.atkMax = _atk[1];
    obj.skill = _skill;

    obj.attack = function(target) {
        if (!target || !target.getDmg) return;

        let dmgRange = [obj.atkMin, obj.atkMax];
        let chance = obj.skill;
        if (obj.dex) chance += obj.dex;

        if (obj.weapon) {
            dmgRange[0] = obj.weapon.atk[0];
            dmgRange[1] = obj.weapon.atk[1];
            chance *= obj.weapon.skill;
        }

        if (obj.dex && (obj.weapon && obj.weapon.finesse)) {
            dmgRange[0] += obj.dex >> 1;
            dmgRange[1] += obj.dex >> 1;
        } else if (obj.str && ((obj.weapon && !obj.weapon.finesse) || !obj.weapon)) {
            dmgRange[0] += obj.str >> 1;
            dmgRange[1] += obj.str >> 1;
        }

        let report = '';
        const dice = random(0, 100);
        if (dice - chance <= 100 - (target.def || 0)) {
            if (obj instanceof Player) report += `Golpeas ${target.prefix[0]} ${target.name} por `;
            else report += `${obj.prefix[1]} ${obj.name} te golpea por `;
            const damage = random(dmgRange[0], dmgRange[1]);
            report += `${damage} PS.`;
            const dmgReport = target.getDmg(damage);
            if (dmgReport && (obj instanceof Player)) {
                let xp = random(target.exp[0], target.exp[1]);
                obj.gainXp(xp);
                report += ` Matas ${target.prefix[0]} ${target.name}, ganas ${xp}p. de experiencia.`;
            }
            eventBus.emit('on_message', report);
        } else if (obj instanceof Player) eventBus.emit('on_message', `Fallas tu ataque.`);
        else eventBus.emit('on_message', `${obj.prefix[1]} ${obj.name} falla su ataque.`);
        
    };
};

export const c_def = (obj, amount) => {
    obj.def = amount;

    if (obj.dex) obj.def += obj.dex;
};

export const c_stats = (obj) => {
    obj.con = 0;
    obj.dex = 0;
    obj.str = 0;

    obj.addCon = function() {
        let newHp = obj.maxHp;
        newHp -= obj.level * (obj.con >> 1);
        obj.con++;
        newHp += obj.level * (obj.con >> 1);
    };

    obj.addDex = function() {
        obj.def++;
        obj.dex++;
    };

    obj.addStr = function() {
        obj.str++;
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
    obj.level = 1;
    obj.exp = 0;

    obj.gainXp = function(amount) {
        obj.exp += amount;

        if (obj.exp >= 100) {
            obj.exp -= 100;
            const report = obj.levelUp();
            eventBus.emit('on_message', ` Subes a nivel ${obj.level}.${report}`);
        }
    };

    obj.levelUp = function() {

        if ((obj.level + 1) % 4 === 0) {
            obj.addCon();
            obj.addDex();
            obj.addStr();
        }
        console.log(`Con ${obj.con}, Dex ${obj.dex}, Str ${obj.str}.`);

        obj.level += 1;

        const bonus = {
            maxHp: random(2,4) + (obj.con >> 1),
            skill: random(0,2),
            def: random(0,2),
        };

        obj.maxHp += bonus.maxHp;
        obj.hp = obj.maxHp;
        console.log(`PS: ${obj.maxHp} (${bonus.maxHp})`);
        obj.skill + bonus.skill <= 80 ? obj.skill += bonus.skill : obj.skill = 80;
        console.log(`Hab: ${obj.skill} (${bonus.skill})`);
        obj.def + bonus.def <= 80 ? obj.def += bonus.def : obj.def = 80;
        console.log(`Def: ${obj.def} (${bonus.def})`);
        return ` Ahora tienes ${obj.maxHp}ps, ${obj.skill} hab. en combate, ${obj.def} de defensa.`;
    }
}

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
                eventBus.emit('on_message', `Tu fuente de luz se ha apagado.`);
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

        if (manhattan > this.detection) {
            if (this.psychology.curiosity < Math.random() * 100) {
                this.currentDesire = 'wander';
                return 'wander';
            }
            this.currentDesire = 'desist';
            return 'desist';
        }

        if (this.hp < this.maxHp) {
            if (this.hp < this.maxHp * 0.4) {
                if (this.psychology.fear > 40) {
                    this.currentDesire = 'flee';
                    return 'flee';
                }
            }
            if (this.hp < this.maxHp * 0.4 || Math.random() * 100 >= 60) {
                this.currentDesire = 'regen';
                return 'regen';
            }
        }

        if (this.energy < 12 && Math.random() * 100 < this.psychology.laziness) {
            this.currentDesire = 'wait';
            return 'wait';
        }

        if (this.psychology.rangedPref >= Math.random() * 100 && manhattan >= 3 && manhattan <= 9) {
            this.currentDesire = 'ranged';
            return 'ranged';
        }

        if (Math.random() * 100 < this.psychology.laziness / 2) {
            this.currentDesire = 'wait';
            return 'wait';
        }

        this.currentDesire = 'chase';
        return 'chase';
    };
};

