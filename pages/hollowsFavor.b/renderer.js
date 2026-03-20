import { Globals } from "./globals.js";
import { RendererUtils } from "./rendererUtils.js";
import { colors } from "./palette.js";
import { viewportManager } from "./viewportManager.js";
import { TouchpadUI } from "./ui/touchpad.js";

const DEFAULT_PACKED = packCell(' ', 0, false, false);

export function packCell(char, fgIdx, bold, italic) {
    const charCode = char.charCodeAt(0) & 0xFFFF;
    return (
        (charCode << 16) |
        (fgIdx & 0x0F) << 12 |
        (bold ? 1 << 4 : 0) |
        (italic ? 1 << 3 : 0)
    );
}

function unpackCell(packed) {
    return {
        char: String.fromCharCode((packed >>> 16) & 0xFFFF),
        fgIdx: (packed >>> 12) & 0x0F,
        bold: !!(packed & (1 << 4)),
        italic: !!(packed & (1 << 3)),
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

function getLightLevel(x, y) {
    return 1;
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
        this.currentVP = null;
        this.fps = 0;

        this.fgBuffer = new Uint32Array(Globals.cols * Globals.rows).fill(DEFAULT_PACKED);
        this.bgRects = [];
        this.dirtyRects = [];
    }

    markDirty(lx, ly, w, h) {
        const gx = this.currentVP ? this.currentVP.x + lx : lx;
        const gy = this.currentVP ? this.currentVP.y + ly : ly;
        this.dirtyRects.push({x: gx, y: gy, w, h});
    }

    resize() {
        RendererUtils.setupCanvas(this.canvas);
        this.ctx.imageSmoothingEnabled = false;

        this.fgBuffer = new Uint32Array(Globals.cols * Globals.rows).fill(DEFAULT_PACKED);

        const viewports = viewportManager.getAllViewports();
        viewports.forEach(vp => {
            if (vp.onResize) vp.onResize(Globals.cols, Globals.rows);
        });
    }

    setDOMBackground() {
        const body = document.querySelector("body");
        body.style.backgroundColor = colors[0];
    }

    clear(color = 0) {
        this.ctx.fillStyle = colors[color];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Sistema de Buffer START

    render() {
        const dirty = mergeDirtyRects(this.dirtyRects);
        const real = RendererUtils.getRealTileSize();

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

            for (const bg of this.bgRects) {
                if (intersects(bg, rect)) {
                    this.ctx.fillStyle = colors[bg.colorIdx] || colors[0];
                    this.ctx.fillRect(bg.x * real.x, bg.y * real.y, bg.w * real.x, bg.h * real.y);
                }
            }

            for (let py = rect.y; py < rect.y + rect.h; py++) {
                for (let px = rect.x; px < rect.x + rect.w; px++) {
                    const idx = py * Globals.cols + px;
                    const cell = unpackCell(this.fgBuffer[idx]);
                    const light = getLightLevel(px, py);

                    if (cell.char !== ' ') {
                        let fgColor = colors[cell.fgIdx] || colors[1];
                        fgColor = mix(fgColor, colors[0], 1 - light);
                        this.ctx.fillStyle = fgColor;
                        let fontFlags = "";
                        fontFlags += cell.bold ? 'bold ' : "";
                        fontFlags += cell.italic ? 'italic ' : "";
                        this.ctx.font = fontFlags + Globals.fontSize * Globals.fontSizeDelta + 'px "Courier New"';
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "middle";
                        this.ctx.fillText(cell.char, px * real.x + real.x / 2, py * real.y + real.y / 2);
                    }
                }
            }

            this.ctx.restore();
        });
        this.dirtyRects = [];
        this.bgRects = [];
    }

    // Sistema de Buffer END

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


    renderStage(t) {
        this.clear();
        if (this.fgBuffer) this.fgBuffer.fill(DEFAULT_PACKED);
        // this.bgRects = [];

        const viewports = viewportManager.getActiveViewports();
        viewports.forEach(vp => {
            if (vp.update) vp.update(t);
            this.currentVP = vp;
            vp.drawContent(this);
            this.currentVP = null;
        });

        if (Globals.touchpad) {
            TouchpadUI.draw(this);
        }

        this.render();
        // this.drawFPS();
        this.drawGrid();
        this.drawBorderLine();
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

    addLocalChar(char, lx, ly, fgCol = 1, b = false, it = false) {
        if (!this.currentVP) return;

        const gx = this.currentVP.x + lx;
        const gy = this.currentVP.y + ly;

        // const gx = this.currentVP ? this.currentVP.x + lx : TouchpadUI.x + lx;
        // const gy = this.currentVP ? this.currentVP.y + ly : TouchpadUI.y + ly;

        if (gx < 0 || gx >= Globals.cols || gy < 0 || gy >= Globals.rows) return;

        this.fgBuffer[gy * Globals.cols + gx] = packCell(char, fgCol, b, it);
    }

    addLocalRect(lx, ly, w, h, colorIdx) {
        if (!this.currentVP) return;

        const gx = this.currentVP.x + lx;
        const gy = this.currentVP.y + ly;

        // const gx = this.currentVP ? this.currentVP.x + lx : TouchpadUI.x + lx;
        // const gy = this.currentVP ? this.currentVP.y + ly : TouchpadUI.y + ly;

        this.bgRects.push({ x: gx, y: gy, w, h, colorIdx });

        for (let py = gy; py < gy + h; py++) {
            for (let px = gx; px < gx + w; px++) {
                if (px < 0 || px >= Globals.cols) continue;
                this.fgBuffer[py * Globals.cols + px] = DEFAULT_PACKED;
            }
        }
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

