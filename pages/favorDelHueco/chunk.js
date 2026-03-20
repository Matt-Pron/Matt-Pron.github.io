export class Chunk {
    constructor(cx, cy, size) {
        this.cx = cx;
        this.cy = cy;
        this.size = size;
        this.active = false;

        const area = size * size;

        this.tiles = new Uint8Array(Math.ceil(area / 2));

        this.light = new Uint8Array(Math.ceil(area / 2));
        this.visibility = new Uint8Array(Math.ceil(area / 4));

        this.entities = new Set();
    }

    getIndex(lx, ly) {
        return ly * this.size + lx;
    }

    clear() {
        this.tiles.fill(0);
        this.light.fill(0);
        this.visibility.fill(0);
        this.entities.clear();
    }

    getLight(lx, ly) {
        const idx = this.getIndex(lx, ly);
        const byte = this.light[idx >> 1];
        return (idx & 1) ? (byte & 0x0F) : (byte >> 4);
    }

    setLight(lx, ly, value) {
        const idx = this.getIndex(lx, ly);
        const shift = (idx & 1) ? 0 : 4;
        const mask = (idx & 1) ? 0x0F : 0xF0;
        this.light[idx >> 1] = (this.light[idx >> 1] & ~mask) | ((value & 0x0F) << shift);
    }

    getVisibility(lx, ly) {
        const idx = this.getIndex(lx, ly);
        const byte = this.visibility[idx >> 2];
        return (byte >> ((idx & 3) * 2)) & 3;;
    }

    setVisibility(lx, ly, value) {
        const idx = this.getIndex(lx, ly);
        const shift = (idx & 3) * 2;
        const mask = 0b11 << shift;
        this.visibility[idx >> 2] = (this.visibility[idx >> 2] & ~mask) | ((value & 3) << shift);
    }

    getTile(lx, ly) {
        const idx = this.getIndex(lx, ly);
        const byte = this.tiles[idx >> 1];
        return (idx & 1) ? (byte & 0x0F) : (byte >> 4);
    }

    setTile(lx, ly, tileId) {
        const idx = this.getIndex(lx, ly);
        const shift = (idx & 1) ? 0 : 4;
        const mask = (idx & 1) ? 0x0F : 0xF0;
        this.tiles[idx >> 1] = (this.tiles[idx >> 1] & ~mask) | ((tileId & 0x0F) << shift);
    }
}

