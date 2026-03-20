export const Globals = {
    // Grid settings
    fontSize: 16,
    tileSize: { x: .65, y: 0.90 },
    fontSizeDelta: 1,
    factor: 2,

    cols: 20,
    rows: 20,

    // Game data
    gameState: {},

    // Player data
    player: {},

    // Misc
    input: "none",
    touchpad: true,
    mainMenuLast : 2,

    // Load
    paletteID: localStorage.getItem("paletteID") !== null ? parseInt(localStorage.getItem("paletteID")) : 0,
    volume: localStorage.getItem("volume") !== null ? parseInt(localStorage.getItem("volume")) : 15,
};

