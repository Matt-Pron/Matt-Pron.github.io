import { Globals } from "./globals.js";

export const RendererUtils = {
    tileW: 0,
    tileH: 0,

    setupCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const avWidth = (window.innerWidth - 20) / Globals.factor;

        const dFont = avWidth / (Globals.tileSize.x * 30);
        const baseFont = 32;
        Globals.fontSize = Math.max(10, Math.min(baseFont, Math.floor(dFont)));

        this.tileW = Math.floor(Globals.fontSize * Globals.tileSize.x);
        this.tileH = Math.floor(Globals.fontSize * Globals.tileSize.y);

        const cols = Math.floor(avWidth / this.tileW);
        const rows = Math.floor(((window.innerHeight - 20) / Globals.factor) / this.tileH);

        Globals.cols = cols;
        Globals.rows = rows;

        canvas.width = cols * this.tileW * dpr;
        canvas.height = rows * this.tileH * dpr;
        canvas.style.width = `${cols * this.tileW * Globals.factor}px`;
        canvas.style.height = `${rows * this.tileH * Globals.factor}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.scale(dpr, dpr);
    },

    getRealTileSize() {
        const realTileSize = { x: Math.floor(Globals.fontSize * Globals.tileSize.x),
                            y: Math.floor(Globals.fontSize * Globals.tileSize.y) };
        return realTileSize;
    },

    gridToPx(col, row) {
        return { x: col * this.tileW, y: row * this.tileH };
    },

    pxToGrid(pixelX, pixelY) {
        const x = Math.floor((pixelX / Globals.factor) / this.tileW);
        const y = Math.floor((pixelY / Globals.factor) / this.tileH);

        return { x, y };
    }
};

