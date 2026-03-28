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
        exits: ['Chasqui'],
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
        // exits: ['Cazador', 'Salteador de Caminos'],
        exits: ['Chasqui'],
    },
    Estudiante: {
        name: 'Estudiante',
        advances: { WS: 1, BS: 1, S: 0, T: 0, Ag: 0, Int: 2, A: 0, W: 1, M: 0, Mag: 0 },
        gear: [],
        exits: ['Chasqui'],
    },
    Monje: {
        name: 'Monje',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 1, A: 0, W: 1, M: 0, Mag: 0 },
        gear: [],
        exits: ['Chasqui'],
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
        exits: ['Chasqui'],
    },
    Vagabundo: {
        name: 'Vagabundo',
        advances: { WS: 1, BS: 0, S: 1, T: 1, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Chasqui'],
    },
    Pescador: {
        name: 'Pescador',
        advances: { WS: 0, BS: 0, S: 1, T: 2, Ag: 0, Int: 0, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            ItemData.weapons.honda,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        // exits: ['Fanático', 'Miliciano'],
        exits: ['Chasqui'],
    },
    Herbolario: {
        name: 'Herbolario',
        advances: { WS: 0, BS: 0, S: 1, T: 1, Ag: 0, Int: 1, A: 0, W: 2, M: 0, Mag: 0 },
        gear: [
            ItemData.weapons.daga,
            ItemData.weapons.honda,
            { type: 'ammo', id: 'piedras', amount: 8 }
        ],
        exits: ['Chasqui'],
    },
    Chasqui: {
        name: 'Chasqui',
        advances: { WS: 10, BS: 10, S: 10, T: 10, Ag: 10, Int: 10, A: 4, W: 20, M: 4, Mag: 4 },
        exits: [],
    },
};

