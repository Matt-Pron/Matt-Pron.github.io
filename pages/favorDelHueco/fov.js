import { getTileData } from "./data/tiles.js";

export class MRPAS {
    constructor(width, height, isTransparentCallback) {
        this.width = width;
        this.height = height;
        this.isTransparent = isTransparentCallback;
    }

    compute(startX, startY, maxRadius, setVisibleCallback) {
        setVisibleCallback(startX, startY);

        for (let octant = 0; octant < 8; octant++) {
            this._scanOctant(octant, startX, startY, maxRadius, setVisibleCallback);
        }
    }

    _scanOctant(octant, startX, startY, maxRadius, setVisible) {
        const shadows = [];

        for (let row = 1; row <= maxRadius; row++) {
            for (let col = 0; col <= row; col++) {
                const { x, y } = this._transform(row, col, octant, startX, startY);

                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

                const startSlope = (col - 0.5) / row;
                const endSlope = (col + 0.5) / row;

                if (this._isShadowed(shadows, startSlope, endSlope)) {
                    continue;
                }

                setVisible(x, y);

                if (!this.isTransparent(x, y)) {
                    this._addShadow(shadows, startSlope, endSlope);
                    // shadows.push({ start: startSlope, end: endSlope });
                    // Optimization: merge overlapping shadows TODO
                }
            }
        }
    }

    _transform(row, col, octant, sx, sy) {
        switch(octant) {
            case 0: return { x: sx + col, y: sy - row };
            case 1: return { x: sx + row, y: sy - col };
            case 2: return { x: sx + row, y: sy + col };
            case 3: return { x: sx + col, y: sy + row };
            case 4: return { x: sx - col, y: sy + row };
            case 5: return { x: sx - row, y: sy + col };
            case 6: return { x: sx - row, y: sy - col };
            case 7: return { x: sx - col, y: sy - row };
        }
    }

    _isShadowed(shadows, start, end) {
        for (let s of shadows) {
            if (start >= s.start && end <= s.end) return true;
        }
        return false;
    }

    _addShadow(shadows, start, end) {
        let newShadow = { start, end };

        let index = 0;
        while (index < shadows.length && shadows[index].start < start) {
            index++;
        }

        shadows.splice(index, 0, newShadow);

        for (let i = 0; i < shadows.length - 1; i++) {
            let current = shadows[i];
            let next = shadows[i + 1];

            if (next.start <= current.end) {
                current.end = Math.max(current.end, next.end);
                shadows.splice(i + 1, 1);
                i--;
            }
        }
    }
}

export function BresenhamLine(world, x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let firstTile = true;

    while (true) {
        if (x0 === x1 && y0 === y1) return true;

        if (!firstTile) {
            const tile = world.getTile(x0, y0);
            if (tile !== undefined) {
                const tileData = getTileData(tile);
                if (!tileData.transparent) {
                    return false;
                }
            }
        }
        firstTile = false;

        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
}

