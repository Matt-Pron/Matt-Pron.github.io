export const ACTIONS = {
    MOVE_LEFT: 0,
    MOVE_RIGHT: 1,
    MOVE_UP: 2,
    MOVE_DOWN: 3,
    CONFIRM: 4,
    CANCEL: 5,
    WAIT: 6,
    AIM: 7,
    SHOT: 8,
    OPEN_MENU: 9,
    INSPECT: 10,
    POINTER_DOWN: 11,
    POINTER_MOVE: 12,
};
// "Movimiento y selección:",W A S D",Flechas",H J K L",
// "Pasar turno y disparar: E",
// "Apuntar: Q",
// "Abrir Menú e inspeccionar: R",
// "Cancelar: Escape",

export function createAction(actionType, isPressed = true, extra = {}) {
    return {
        action: actionType,
        isPressed,
        justPressed: false,
        ...extra,
    };
}

export const REPEATABLE_ACTIONS = new Set([
    ACTIONS.MOVE_LEFT,
    ACTIONS.MOVE_RIGHT,
    ACTIONS.MOVE_UP,
    ACTIONS.MOVE_DOWN,
]);

export const UI_KEY_MAP = new Map([
    ['a', ACTIONS.MOVE_LEFT],
    ['d', ACTIONS.MOVE_RIGHT],
    ['w', ACTIONS.MOVE_UP],
    ['s', ACTIONS.MOVE_DOWN],
    ['e', ACTIONS.CONFIRM],
    ['escape', ACTIONS.CANCEL],
]);

export const GAME_KEY_MAP = new Map([
    ['a', ACTIONS.MOVE_LEFT],
    ['d', ACTIONS.MOVE_RIGHT],
    ['w', ACTIONS.MOVE_UP],
    ['s', ACTIONS.MOVE_DOWN],
    ['e', ACTIONS.WAIT], // shoot when aiming
    ['escape', ACTIONS.CANCEL],
    ['q', ACTIONS.AIM],
    ['r', ACTIONS.OPEN_MENU], // inspect when aiming
]);

export function remapKey(mapping, key, newAction) {
    mapping.set(key, newAction);
}

// example remapping: remapKey(GAME_KEY_MAP, 'w', ACTIONS.OPEN_MENU);
