export const tile = {
    0: {
        char: ' ',
        color: 0,
        collision: true,
        transparent: false,
    },
    1: {
        char: '.',
        color: 7,
        collision: false,
        transparent: true,
    },
    2: {
        char: '#',
        color: 2,
        collision: true,
        msg: 'Un muro bloquea el camino.',
        transparent: false,
    },
    3: {
        char: 'T',
        color: 11,
        collision: true,
        msg: 'Un árbol bloquea tu camino.',
        transparent: false,
    },
    4: {
        char: '~',
        color: 12,
        collision: true,
        msg: 'El agua refleja tu rostro.',
        transparent: true,
    },
};

export function getTileData(id) {
    return tile[id] ?? tile[0];
}
