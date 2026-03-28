import { random } from "../math.js";
import MonsterData from "./monsters.json" with { type: "json" };

export const STAT_LABELS = {
    WS: 'Habilidad con Armas',
    BS: 'Puntería',
    S: 'Fuerza',
    T: 'Resistencia',
    Ag: 'Agilidad',
    Int: 'Inteligencia',
    W: 'Salud',
    A: 'Ataques',
    M: 'Velocidad',
    Mag: 'Magia',
};

const RACIAL_BASE = {
    'Humano': { WS: 20, BS: 20, S: 20, T: 20, Ag: 20, Int: 20, W: 10, M: 4 },
    'Elfo': { WS: 20, BS: 30, S: 20, T: 20, Ag: 30, Int: 20, W: 9, M: 5 },
    'Goblin': { WS: 20, BS: 30, S: 10, T: 10, Ag: 40, Int: 20, W: 8, M: 4 },
    'Orco': { WS: 20, BS: 20, S: 40, T: 40, Ag: 10, Int: 10, W: 12, M: 4 },
    'Enano': { WS: 30, BS: 20, S: 20, T: 30, Ag: 10, Int: 20, W: 11, M: 3 },
};

function rollRaceW(race) {
    const roll = random(1, 10);

    if (race === 'Humano') {
        if (roll <= 3) return 10;
        if (roll <= 6) return 11;
        if (roll <= 9) return 12;
        return 13;
    }
    if (race === 'Elfo') {
        if (roll <= 3) return 9;
        if (roll <= 6) return 10;
        if (roll <= 9) return 11;
        return 12;
    }
    if (race === 'Goblin') {
        if (roll <= 3) return 8;
        if (roll <= 6) return 9;
        if (roll <= 9) return 10;
        return 11;
    }
    if (race === 'Orco') {
        if (roll <= 3) return 12;
        if (roll <= 6) return 13;
        if (roll <= 9) return 14;
        return 15;
    }
    if (race === 'Enano') {
        if (roll <= 3) return 11;
        if (roll <= 6) return 12;
        if (roll <= 9) return 13;
        return 14;
    }
}

export function generatePlayerStats(race, className) {
    const base = RACIAL_BASE[race] || RACIAL_BASE['Humano'];
    const stats = {};
    const keys = ['WS', 'BS', 'S', 'T', 'Ag', 'Int'];

    keys.forEach(key => {
        const roll = random(2, 20);
        stats[key] = base[key] + roll;
    });

    const raceW = rollRaceW(race);
    stats.maxW = raceW;
    stats.M = base.M;

    return stats;
}

export function generateMonsterStats(monsterType) {
    const data = MonsterData[monsterType];
    if (!data) return generatePlayerStats('Humano', '');

    const stats = {};
    const mapping = { W: 'maxW', WS: 'WS', BS: 'BS', S: 'S', T: 'T', Ag: 'Ag', M: 'M' };

    for (const [jsonKey, statKey] of Object.entries(mapping)) {
        const val = data.stats ? data.stats[jsonKey] : data[jsonKey];
        if (Array.isArray(val)) {
            stats[statKey] = random(val[0], val[1]);
        } else {
            stats[statKey] = val || 20;
        }
    }

    return stats;
}

