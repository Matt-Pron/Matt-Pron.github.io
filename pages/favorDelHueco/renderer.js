import { Globals } from "./globals.js";
import { RendererUtils } from "./rendererUtils.js";
import { colors, TORCH_LUT } from "./palette.js";
import { viewportManager } from "./viewportManager.js";
import { TouchpadUI } from "./scenes/touchpad.js";

const DEFAULT_PACKED = packCell(' ', 0, false, false, false, false);

export function packCell(char, fgIdx, bold, italic, world, lightLevel) {
    const charGuard = (char && typeof char === 'string') ? char : '?';
    const charCode = charGuard.charCodeAt(0) & 0xFFFF;
    return (
        (charCode << 16) |
        (fgIdx & 0x0F) << 12 |
        (bold ? 1 << 11 : 0) |
        (italic ? 1 << 10 : 0) |
        (world ? 1 << 9 : 0) |
        (lightLevel & 0x0F) << 5
    );
}

function unpackCell(packed) {
    return {
        char: String.fromCharCode((packed >>> 16) & 0xFFFF),
        fgIdx: (packed >>> 12) & 0x0F,
        bold: !!(packed & (1 << 11)),
        italic: !!(packed & (1 << 10)),
        world: !!(packed & (1 << 9)),
        lightLevel: (packed >>> 5) & 0x0F,
    };
}

function intersects(a, b) {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

function mix(_c1, _c2, t) {
    const c1 = parseInt(_c1.slice(1), 16);
    const c2 = parseInt(_c2.slice(1), 16);
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    const r = Math.floor(r1 + (r2 - r1) * t);
    const g = Math.floor(g1 + (g2 - g1) * t);
    const b = Math.floor(b1 + (b2 - b1) * t);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function mergeDirtyRects(rects) {
    if (rects.length === 0) return [{x: 0, y: 0, w: Globals.cols, h: Globals.rows}];
    const minX = Math.min(...rects.map(r => r.x)), maxX = Math.max(...rects.map(r => r.x + r.w));
    const minY = Math.min(...rects.map(r => r.y)), maxY = Math.max(...rects.map(r => r.y + r.h));
    return [{x: minX, y: minY, w: maxX - minX, h: maxY - minY}];
}

class renderer {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.ctx.imageSmoothingEnabled = false;

        this.currentVP = null;
        this.drawCommands = [];
        this.dirtyRects = [];
        this.numLayers = 3;

        this.initBuffers();
        window.addEventListener('resize', () => Renderer.resize());
    }

    initBuffers() {
        const size = Globals.cols * Globals.rows;
        this.buffers = Array.from({ length: this.numLayers }, () => new Uint32Array(size).fill(DEFAULT_PACKED));
        this.animBuffer = new Uint8Array(Math.ceil(size / 2));
        this.visibleBuffer = new Uint8Array(size);

        for (let i = 0; i < this.animBuffer.length; i++) {
            this.animBuffer[i] = Math.floor(Math.random() * 256);
        }
    }

    markDirty(lx, ly, w, h) {
        const gx = this.currentVP ? this.currentVP.x + lx : lx;
        const gy = this.currentVP ? this.currentVP.y + ly : ly;
        this.dirtyRects.push({x: gx, y: gy, w, h});
    }

    resize() {
        RendererUtils.setupCanvas(this.canvas);
        this.ctx.imageSmoothingEnabled = false;
        this.initBuffers();
        viewportManager.resizeVps(Globals.cols, Globals.rows);
    }

    setDOMBackground() {
        const body = document.querySelector("body");
        body.style.backgroundColor = colors[0];
    }

    clear(color = 0) {
        this.ctx.fillStyle = colors[color];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addClip(x, y, w, h) {
        const {tileW, tileH } = RendererUtils;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x * tileW, y * tileH, w * tileW, h * tileH);
        this.ctx.clip();
    }

    removeClip() {
        this.ctx.restore();
    }

    clearLocalChar(localCol, localRow) {
        if (!this.currentVP) return;

        const globalX = this.currentVP.x + localCol;
        const globalY = this.currentVP.y + localRow;
        const { x, y } = RendererUtils.gridToPx(globalX, globalY);
        const offset = 0.5;
        const posX = x + offset;
        const posY = y + offset;

        const dX = Globals.fontSize * Globals.tileSize.x / 2;
        const dY = Globals.fontSize * Globals.tileSize.y / 2;

        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(posX - dX, posY - dY,
            Globals.fontSize * Globals.tileSize.x - dX,
            Globals.fontSize * Globals.tileSize.y - dY);
    }

    _applyLightning(fgIdx, idx, lightLevel, totalElapsed) {
        const baseColor = colors[fgIdx] || colors[1];

        // const intensity = this.lightBuffer[idx];
        const intensity = lightLevel / 15;
        // const intensity = 0.1 + 0.9 * (lightLevel / 15);
        const lutIndex = Math.floor((1 - intensity) * (TORCH_LUT.length - 2)) + 1;
        const lightColor = TORCH_LUT[lutIndex] || colors[1];

        const light = 0.1 + (intensity * 0.9);

        const byteIdx = idx >> 1;
        const byte = this.animBuffer[byteIdx];
        const nibble = (idx % 2 === 0) ? (byte & 0x0F) : (byte >> 4);

        // const flickerZone = (light + 0.02) * (1 - light) * 4;
        const flickerZone = 0.5 + (0.5 * (1 - intensity));
        const pulse = intensity <= 0.4
            ?  Math.sin((totalElapsed * 0.5 + (nibble * 100)) / 600) * (0.10 * flickerZone)
            :  Math.sin((totalElapsed * 4.0 + (nibble * 100)) / 600) * (0.30 * flickerZone);

        const finalLight = Math.max(0.01, Math.min(1.0, intensity + pulse));
        const finalFg = mix(colors[0], baseColor, finalLight);

        // const influence = 0.1 + (intensity * 0.3);
        const influence = (1 - intensity) * 0.3;
        return mix(finalFg, lightColor, influence);
    }

    render(totalElapsed) {
        this.clear();

        for (let l = 0; l < this.numLayers; l++) {
            this.buffers[l].fill(DEFAULT_PACKED);
        }
        this.drawCommands = [];

        // Cargando buffers
        const scene = viewportManager.currentScene;
        if (scene && scene.draw) {
            this.currentVP = scene;
            scene.draw(this, totalElapsed);
            this.currentVP = null;
        }

        const viewports = viewportManager.getActiveViewports();
        viewports.forEach(vp => {
            this.currentVP = vp;
            vp.draw(this, totalElapsed);
            this.currentVP = null;
        });

        const loader = viewportManager.loader;
        if (loader.active) {
            this.currentVP = loader;
            loader.draw(this);
            this.currentVP = null;
        }

        if (TouchpadUI && TouchpadUI.active) {
            TouchpadUI.draw(this);
        }

        // Actual Render
        const dirty = mergeDirtyRects(this.dirtyRects);
        const real = RendererUtils.getRealTileSize();
        const fontSize = Globals.fontSize * Globals.fontSizeDelta;

        dirty.forEach(rect => {
            const l = Math.max(0, rect.x);
            const t = Math.max(0, rect.y);
            const r = Math.min(Globals.cols, rect.x + rect.w);
            const b = Math.min(Globals.rows, rect.y + rect.h);

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(
                l * real.x,
                t * real.y,
                (r - l) * real.x,
                (b - t) * real.y
            );
            this.ctx.clip();

            // Backgrounds
            for (const cmd of this.drawCommands) {
                if (intersects(cmd, rect)) {
                    if (cmd.type === 'rect') {
                        this.ctx.fillStyle = colors[cmd.colorIdx] || colors[0];
                        this.ctx.fillRect(cmd.x * real.x, cmd.y * real.y, cmd.w * real.x, cmd.h * real.y);
                    } else if (cmd.type === 'border') {
                        this.ctx.strokeStyle = colors[cmd.colorIdx] || colors[1];
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(
                            cmd.x * real.x + 4.5,
                            cmd.y * real.y + 4.5,
                            cmd.w * real.x - 9,
                            cmd.h * real.y - 9
                        );
                    }
                }
            }

            // Canvas text optimization
            let lastFgColor = null;
            let lastFontFlags = null;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Char layers
            for (let layer = 0; layer < this.numLayers; layer++) {
                const buffer = this.buffers[layer];
                for (let py = t; py < b; py++) {
                    for (let px = l; px < r; px++) {
                        const idx = py * Globals.cols + px;
                        const cell = unpackCell(buffer[idx]);

                        if (cell.char === ' ') continue;

                        let fgColor;
                        if (cell.world) {
                            fgColor = this._applyLightning(cell.fgIdx, idx, cell.lightLevel, totalElapsed);
                        } else {
                            fgColor = colors[cell.fgIdx];
                        }

                        if (fgColor !== lastFgColor) {
                            this.ctx.fillStyle = fgColor;
                            lastFgColor = fgColor;
                        }

                        const currentFlags = (cell.bold ? 'b' : '') + (cell.italic ? 'i' : '');
                        if (currentFlags !== lastFontFlags) {
                            const fontStr = (cell.bold ? 'bold ' : '') + (cell.italic ? 'italic ' : '');
                            this.ctx.font = `${fontStr}${fontSize}px "Courier New", monospace`;
                            lastFontFlags = currentFlags;
                        }

                        this.ctx.fillText(cell.char, px * real.x + real.x / 2, py * real.y + real.y / 2);
                    }
                }
            }
            this.ctx.restore();
        });

        this.dirtyRects = [];
        // this.drawFPS();
        // this.drawGrid();
        // this.drawBorderLine();
    }

    drawGrid() {
        const {tileW, tileH } = RendererUtils;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#80808012";
        this.ctx.lineWidth = 1;

        const offset = 0.5;

        for (let x = 0; x <= width; x += tileW) {
            const posX = Math.floor(x) + offset;
            this.ctx.moveTo(posX, 0);
            this.ctx.lineTo(posX, height);
        }

        for (let y = 0; y <= height; y += tileH) {
            const posY = Math.floor(y) + offset;
            this.ctx.moveTo(0, posY);
            this.ctx.lineTo(width, posY);
        }
        this.ctx.moveTo(width - offset, 0);
        this.ctx.lineTo(width - offset, height);
        this.ctx.moveTo(0, height - offset);
        this.ctx.lineTo(width, height - offset);

        this.ctx.stroke();
    }

    drawBorderLine() {
        const realTileS = RendererUtils.getRealTileSize();
        const width = Globals.cols * realTileS.x;
        const height = Globals.rows * realTileS.y;

        this.ctx.strokeStyle = colors[1];
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        this.ctx.rect(0.5, 0.5, width - 1.0, height - 1.0);

        this.ctx.stroke();
    }

    updateFPS(i) {
        this.fps = i;
    }

    drawFPS() {
        const text = `FPS: ${Math.round(this.fps)}`;
        [...text].forEach((char, i) => {
            this.drawChar(char, Math.floor((Globals.cols - text.length) / 2) + i, Globals.rows - 2, { color: 3, bg: true });
        });
    }

    drawLocalChar(char, localCol, localRow, { color = 1, weight = 100, bg = false }) {
        if (!this.currentVP) return;

        if (localCol >= 0 && localCol < this.currentVP.width &&
            localRow >= 0 && localRow < this.currentVP.height) {
            const globalX = this.currentVP.x + localCol;
            const globalY = this.currentVP.y + localRow;
            this.drawChar(char, globalX, globalY, { color: color, weight: weight, bg: bg });
        }
    }

    addLocalChar(char, lx, ly, fgCol = 1, b = false, it = false, layer = 2) {
        if (!this.currentVP) return;
        const gx = this.currentVP.x + lx;
        const gy = this.currentVP.y + ly;
        if (gx < 0 || gx >= Globals.cols || gy < 0 || gy >= Globals.rows) return;
        this.buffers[layer][gy * Globals.cols + gx] = packCell(char, fgCol, b, it);
    }

    addChar(char, x, y, fgCol = 1, b = false, it = false, world = false, lightLevel = 0, layer = 2) {
        if (x < 0 || x >= Globals.cols || y < 0 || y >= Globals.rows) return;
        const idx = y * Globals.cols + x;
        this.buffers[layer][idx] = packCell(char, fgCol, b, it, world, lightLevel);
        this.dirtyRects.push({ x: x, y: y, w: 1, h: 1 });
    }

    addText(text, x, y, fgCol = 1, b = false, it = false, world = false, lightLevel = 0, layer = 2) {
        [...text].forEach((char, i) => {
            this.addChar(char, x + i, y, fgCol, b, it, world, lightLevel, layer);
        });
    }

    addRect(x, y, w, h, colorIdx) {
        const startX = Math.max(0, x);
        const startY = Math.max(0, y);
        const endX = Math.min(Globals.cols, x + w);
        const endY = Math.min(Globals.rows, y + h);
        const actualW = endX - startX;
        const actualH = endY - startY;

        if (actualW <= 0 || actualH <= 0) return;

        this.drawCommands.push({ type: 'rect', x: startX, y: startY, w: actualW, h: actualH, colorIdx });

        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const idx = py * Globals.cols + px;
                for (let l = 0; l < this.numLayers; l++) {
                    this.buffers[l][idx] = DEFAULT_PACKED;
                }
            }
        }
        this.dirtyRects.push({ x: startX, y: startY, w: actualW, h: actualH });
    }

    addBorderLine(x, y, w, h, colorIdx) {
        const startX = Math.max(0, x), startY = Math.max(0, y);
        const endX = Math.min(Globals.cols, x + w), endY = Math.min(Globals.rows, y + h);
        const actualW = endX - startX, actualH = endY - startY;

        if (actualW <= 0 || actualH <= 0) return;
        this.drawCommands.push({ type: 'border', x: startX, y: startY, w: actualW, h: actualH, colorIdx });
        this.dirtyRects.push({ x: startX, y: startY, w: actualW, h: actualH });
    }

    addLocalRect(lx, ly, w, h, colorIdx) {
        if (!this.currentVP) return;
        const gx = this.currentVP.x + lx;
        const gy = this.currentVP.y + ly;
        this.addRect(gx, gy, w, h, colorIdx);
    }

    drawChar(char, col, row, { color = 1, weight = 100, bg = false } = {}) {
        const { x, y } = RendererUtils.gridToPx(col, row);
        const posX = Math.floor(x);
        const posY = Math.floor(y);
        const realTileS = RendererUtils.getRealTileSize();

        if (bg) {
            this.ctx.fillStyle = colors[0];
            this.ctx.fillRect(posX, posY, realTileS.x, realTileS.y);
        }

        this.ctx.fillStyle = typeof color === "number" ? colors[color] : color;
        this.ctx.font = `${typeof weight === 'number' ? weight : 900} ${Globals.fontSize * Globals.fontSizeDelta}px "Courier New"`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.fillText(char, Math.floor(posX + realTileS.x / 2), Math.floor(posY + realTileS.y / 2));
    }

    drawLocalText(text, localCol, localRow, { color = 1, weight = 100, bg = false } = {}) {
        if (!this.currentVP) return;
        [...text].forEach((char, i) => {
            this.drawLocalChar(char, localCol + i, localRow, { color: color, weight: weight, bg: bg });
        });
    }

    drawLocalRect(lCol, lRow, width, height, color = 0) {
        if (!this.currentVP) return;
        const globalX = this.currentVP.x + lCol;
        const globalY = this.currentVP.x + lRow;
        const { x, y } = RendererUtils.gridToPx(globalX, globalY);
        const real = RendererUtils.getRealTileSize();

        this.ctx.fillStyle = colors[color];
        this.ctx.fillRect(x, y, width * real.x, height * real.y);
    }
}

export const Renderer = new renderer();

