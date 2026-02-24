export const tile = {
    0: {
        char: ' ',
        color: 'BLACK',
        collision: true,
        transparent: false,
    },
    1: {
        char: '.',
        color: 'BROWN',
        collision: false,
        transparent: true,
    },
    2: {
        char: '#',
        color: 'DGREY',
        collision: true,
        msg: 'Un muro bloquea el camino.',
        transparent: false,
    },
    3: {
        char: 'T',
        color: 'GREEN',
        collision: true,
        msg: 'Un árbol bloquea tu camino.',
        transparent: false,
    },
    4: {
        char: '~',
        color: 'CYAN',
        collision: true,
        msg: 'El agua refleja tu rostro.',
        transparent: true,
    },
    5: {
        char: 'i',
        color: 'YELLOW',
        collision: true,
        msg: 'Las llamas de la antorcha te hipnotizan.',
        transparent: true,
    },

};

export function getTileData(id) {
    return tile[id] ?? tile[0];
}
