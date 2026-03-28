import ItemData from './items.json' with { type: 'json' };

export const STARTER_CAREERS = [
    'Granjero', 'Forajido', 'Estudiante', 'Monje',
    'Escudero', 'Vagabundo', 'Pescador', 'Herbolario'
];

export const CAREERS = {
    Granjero: {
        name: 'Granjero',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.hacha,
            ItemData.weapons.honda,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Fanático', 'Miliciano'],
    },
    Forajido: {
        name: 'Forajido',
        advances: { WS: 1, BS: 1, S: 0, T: 0, Ag: 1, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.espada_corta,
            ItemData.weapons.honda,
            ItemData.armor.armadura_acolchada,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Cazador', 'Salteador de Caminos'],
    },
    Estudiante: {
        name: 'Estudiante',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [],
        exits: ['Fanático', 'Miliciano'],
    },
    Monje: {
        name: 'Monje',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [],
        exits: ['Fanático', 'Miliciano'],
    },
    Escudero: {
        name: 'Escudero',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.espada_corta,
            ItemData.weapons.jabalina,
            ItemData.armor.armadura_acolchada,
            { type: 'ammo', id: 'jabalinas', amount: 2 }
        ],
        exits: ['Fanático', 'Miliciano'],
    },
    Vagabundo: {
        name: 'Vagabundo',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Fanático', 'Miliciano'],
    },
    Pescador: {
        name: 'Pescador',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            ItemData.weapons.honda,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Fanático', 'Miliciano'],
    },
    Herbolario: {
        name: 'Herbolario',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            ItemData.weapons.honda,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Fanático', 'Miliciano'],
    },
};

