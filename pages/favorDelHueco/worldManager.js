import { Chunk } from "./chunk.js";

export class WorldManager {
    constructor(width, height, chunkSize = 16) {
        this.width = width;
        this.height = height;
        this.chunkSize = chunkSize;

        this.chunksX = Math.ceil(width / chunkSize);
        this.chunksY = Math.ceil(height / chunkSize);
        this.chunks = Array(this.chunksX * this.chunksY);

        this.initChunks();
    }

    initChunks() {
        for (let cy = 0; cy < this.chunksY; cy++) {
            for (let cx = 0; cx < this.chunksX; cx++) {
                const index = cy * this.chunksX + cx;
                this.chunks[index] = new Chunk(cx, cy, this.chunkSize);
            }
        }
    }

    getChunk(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;

        const cx = Math.floor(x / this.chunkSize);
        const cy = Math.floor(y / this.chunkSize);

        return this.chunks[cy * this.chunksX + cx];
    }

    getTile(x, y) {
        const chunk = this.getChunk(x, y);
        if (!chunk) return undefined;
        const lx = x % this.chunkSize;
        const ly = y % this.chunkSize;
        return chunk.getTile(lx, ly);
    }

    setTile(x, y, tileId) {
        tileId = Math.max(0, Math.min(15, tileId | 0));
        const chunk = this.getChunk(x, y);
        if (chunk) {
            const lx = x % this.chunkSize;
            const ly = y % this.chunkSize;
            chunk.setTile(lx, ly, tileId);
        }
    }

    getLight(x, y) {
        const chunk = this.getChunk(x, y);
        if (!chunk) return 0;
        const lx = x % this.chunkSize;
        const ly = y % this.chunkSize;
        return chunk.getLight(lx, ly);
    }

    setLight(x, y, intensity) {
        intensity = Math.max(0, Math.min(15, intensity | 0));
        const chunk = this.getChunk(x, y);
        if (chunk) {
            const lx = x % this.chunkSize;
            const ly = y % this.chunkSize;
            chunk.setLight(lx, ly, intensity);
        }
    }

    clearLight() {
        for (const chunk of this.chunks) {
            chunk.light.fill(0);
        }
    }

    getVisibility(x, y) {
        const chunk = this.getChunk(x, y);
        if (!chunk) return 0;
        const lx = x % this.chunkSize;
        const ly = y % this.chunkSize;
        return chunk.getVisibility(lx, ly);
    }

    setVisible(x, y) {
        const chunk = this.getChunk(x, y);
        if (chunk) {
            const lx = x % this.chunkSize;
            const ly = y % this.chunkSize;
            chunk.setVisibility(lx, ly, 2);
        }
    }

    setExplored(x, y) {
        const chunk = this.getChunk(x, y);
        if (chunk) {
            const lx = x % this.chunkSize;
            const ly = y % this.chunkSize;
            const current = chunk.getVisibility(lx, ly);
            if (current === 0) chunk.setVisibility(lx, ly, 1);
        }
    }

    clearVisibility() {
        for (const chunk of this.chunks) {
            for (let i = 0; i < chunk.visibility.length; i++) {
                const byte = chunk.visibility[i];
                let newByte = byte;

                for (let b = 0; b < 4; b++) {
                    const shift = b * 2;
                    const val = (byte >> shift) & 3;
                    if (val === 2) {
                        newByte = (newByte & ~(3 << shift)) | (1 << shift);
                    }
                }
                chunk.visibility[i] = newByte;
            }
        }
    }

    // idx(x, y) {
    //     return y * this.width + x;
    // }
    //
    // getChunkIdx(x, y) {
    //     const cx = (x / this.chunkSize) | 0;
    //     const cy = (y / this.chunkSize) | 0;
    //     return cy * this.chunksX + cx;
    // }
    //
    // getTile(x, y) {
    //     if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    //     return this.tiles[this.idx(x, y)];
    // }
    //
    // updateEntityPosition(entity, nextX, nextY) {
    //     const oldIdx = this.getChunkIdx(entity.x, entity.y);
    //     const newIdx = this.getChunkIdx(nextX, nextY);
    //
    //     if (oldIdx !== newIdx) {
    //         this.chunks[oldIdx].entities.delete(entity);
    //         this.chunks[newIdx].entities.add(entity);
    //     }
    //
    //     entity.x = nextX;
    //     entity.y = nextY;
    // }
}

