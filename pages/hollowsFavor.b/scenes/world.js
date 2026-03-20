import { Viewport } from "../viewport.js";
import { eventBus } from "../eventBus.js";
import { Globals } from "../globals.js";
import { Renderer } from "../renderer.js";
import { getTileData } from "../data/tiles.js";
import { entities } from "../entities.js";

export class World extends Viewport {
    constructor(x, y, w, h, z) {
        super(x, y, w, h, z);
        this.game = Globals.gameState;
        this.player = this.game.player;
        this.map = null;

        this.cam = { x: 0, y: 0 };
    }

    async init() {

        // Generate map
        await this.game.generateTown();
        this.map = this.game.map;

        // Spawn player
        const spawnPos = entities.getValidSpawnPos(true);
        this.player.x = spawnPos.x;
        this.player.y = spawnPos.y;

        // Place entities
        eventBus.emit("SCENE_READY");
    }

    handleInput(a) {
        if (a.action === "move_up") {
            this.player.x += 0;
            this.player.y += -1;
        }
        if (a.action === "move_left") {
            this.player.x += -1;
            this.player.y += 0;
        }
        if (a.action === "move_down") {
            this.player.x += 0;
            this.player.y += 1;
        }
        if (a.action === "move_right") {
            this.player.x += 1;
            this.player.y += 0;
        }
    }

    onResize(w, h) {
        if (super.onResize) super.onResize(w, h);
        this.width = w;
        this.height = h;

        this.updateCamera;
    }

    updateCamera() {
        const player = this.player;

        const targetX = player.x - Math.floor(this.width / 2);
        const targetY = player.y - Math.floor(this.height / 2);

        this.cam.x = Math.max(0, Math.min(targetX, this.game.mapWidth - this.width));
        this.cam.y = Math.max(0, Math.min(targetY, this.game.mapHeight - this.height));
    }

    drawContent(renderer) {
        if (!this.map || !this.map.length) return;

        // 1. Draw the map relative to player (Camera logic)
        this.updateCamera();

        for (let i = 0; i < this.height; i++) {
            const y = this.cam.y + i;
            if (!this.map[y]) continue;

            for (let j = 0; j < this.width; j++) {
                const x = this.cam.x + j;

                if (this.map[y][x] === undefined) continue;

                const tile = getTileData(this.map[y][x]);

                Renderer.addLocalChar(tile.char, j, i, tile.color);
            }
        }


        // 2. Draw the player using local coordinates
        renderer.addLocalChar(
            this.player.char,
            this.player.x - this.cam.x, 
            this.player.y - this.cam.y, 
            this.game.player.color,
            true
        );

        renderer.drawLocalText(`Turn: ${this.game.turn}`, 1, 1, { color: 3, bg: true });
    }
}

// if (!explored?.[y][x]) {
// continue;
// }

// const light = obtener light level
// ctx.fillStyle = ajustar tile.color con light level

// for (const e of entities) {
//     const row = (e.y - cam.y) + panels.pMap.y;
//     const column = (e.x - cam.x) + panels.pMap.x;
//
//     if (row < panels.pMap.y || row >= panels.pMap.yy ||
//         column < panels.pMap.x || column >= panels.pMap.xx) continue;
//
//     const sx = column * screen.font.x;
//     const sy = row * screen.font.y;
//
//     ctx.fillStyle = colors.BLACK;
//     ctx.fillRect(sx, sy, screen.font.x, screen.font.y);
//
//     setFont('600');
//
//     ctx.fillStyle = e.color;
//     ctx.fillText(e.char, sx + screen.font.x / 2, sy + screen.font.y / 2);
// }
