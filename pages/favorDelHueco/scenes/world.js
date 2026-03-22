import { Viewport } from "./viewport.js";
import { Globals } from "../globals.js";
import { getTileData } from "../data/tiles.js";
import { ACTIONS, REPEATABLE_ACTIONS } from "../data/actions.js";
import { Input } from "../input.js";
import { Renderer } from "../renderer.js";
import { viewportManager } from "../viewportManager.js";
import { PauseMenu } from "./pauseMenu.js";
import { TouchpadUI } from "./touchpad.js";

export class World extends Viewport {
    constructor({ gameState, turnManager, player }) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.mode = 'game';

        this.gameState = gameState;
        this.turnManager = turnManager;
        this.player = player;

        this.turnManager.viewport = this;

        this.cam = { x: 0, y: 0 };
        this.moveTimer = 0;
        this.moveCooldown = 150;

        this.setBackground(0)
            .setBorderLine(3);
    }

    init() {
        this.updateCamera();
        this.turnManager.updateActiveChunks();
        this.updateFOV();

        this.computeLayout();
    }

    onResize(w, h) {
        if (super.onResize) super.onResize(w, h);

        this.updateCamera();
    }

    onFocus() {
        Input.repeatDelay = 150;
        Input.repeatRate = 150;

        if (Globals.touchpad === true && this.fixed === true) {
            TouchpadUI.active = true;
            TouchpadUI.onResize(Globals.cols, Globals.rows);
        }
    }

    onBlur() {
        TouchpadUI.active = false;
    }

    updateFOV() {
        this.gameState.world.clearVisibility();
        this.updateLightMap();

        this.gameState.fov.compute(this.player.x, this.player.y, 20, (x, y) => {
            const light = this.gameState.world.getLight(x, y);

            if (light > 0) {
                this.gameState.world.setVisible(x, y);

                const screenX = this.globalX + (x - this.cam.x);
                const screenY = this.globalY + (y - this.cam.y);

                if (screenX >= 0 && screenX < Globals.cols && screenY >= 0 && screenY < Globals.rows) {
                    Renderer.visibleBuffer[screenY * Globals.cols + screenX] = 1;
                }
            }
        });
    }

    updateLightMap() {
        this.gameState.world.clearLight();

        const isTransparent = (x, y) => {
            if (x < 0 || y < 0 || x >= this.gameState.world.width || y >= this.gameState.world.height) return false;
            const tileId = this.gameState.world.getTile(x, y);
            if (tileId === undefined) return false;
            return getTileData(tileId).transparent;
        };

        const sources = [];

        for (const chunk of this.gameState.world.chunks) {
            if (!chunk.active) continue;

            for (const e of chunk.entities) {
                if (e.lightRadius > 0) {
                    sources.push({ x: e.x, y: e.y, radius: e.lightRadius, isPlayer: (e === this.player ) });
                }
            }
        }

        for (const src of sources) {
            this.gameState.fov.compute(src.x, src.y, src.radius, (x, y) => {
                if (!isTransparent(x, y) && !src.isPlayer) {
                    const dot = (x - src.x) * (x - this.player.x) + (y - src.y) * (y - this.player.y);
                    if (dot < 0) return;
                }

                const dx = x - src.x;
                const dy = y - src.y;
                const distSq = dx * dx + dy * dy;

                if (distSq <= src.radius * src.radius) {
                    const dist = Math.sqrt(distSq);
                    let intensity = 1 - (dist / src.radius);
                    intensity = Math.max(0, Math.min(15, Math.floor(intensity * 15)));

                    const currentIntensity = this.gameState.world.getLight(x, y);
                    if (intensity > currentIntensity) {
                        this.gameState.world.setLight(x, y, intensity);
                    }
                }
            });
        }
    }

    executeActions(actions, dt) {
        if (this.moveTimer > 0) this.moveTimer -= dt;
        if (this.moveTimer > 0) return;

        let hasLeft = false, hasRight = false, hasUp = false, hasDown = false;
        let wait = false;

        for (const a of actions) {
            const isRepeatable = REPEATABLE_ACTIONS.has(a.action);
            const shouldTrigger = isRepeatable ? a.isPressed : a.justPressed;
            if (!shouldTrigger) continue;

            if (a.action === ACTIONS.MOVE_LEFT) hasLeft = true;
            if (a.action === ACTIONS.MOVE_RIGHT) hasRight = true;
            if (a.action === ACTIONS.MOVE_UP) hasUp = true;
            if (a.action === ACTIONS.MOVE_DOWN) hasDown = true;
            if (a.action === ACTIONS.WAIT) wait = true;
            if (a.action === ACTIONS.CANCEL) viewportManager.pushUI(PauseMenu, { z: 15 });
        }

        const dir = { x: 0, y: 0 };

        if (hasLeft && hasRight) dir.x = 0;
        else if (hasLeft) dir.x = -1;
        else if (hasRight) dir.x = 1;

        if (hasUp && hasDown) dir.y = 0;
        else if (hasUp) dir.y = -1;
        else if (hasDown) dir.y = 1;

        if (dir.x !== 0) dir.y = 0;

        if (dir.x !== 0 || dir.y !== 0) {
            const tookTurn = this.turnManager.processTurn({ type: 'move', dir });
            if (tookTurn) {
                this.moveTimer = this.moveCooldown;
                this.updateCamera();
                this.updateFOV();
            }
        } else if (wait) {
            this.turnManager.processTurn({ type: 'wait' });
            this.moveTimer = this.moveCooldown;
        }
    }

    updateCamera() {
        const player = this.player;
        const targetX = player.x - Math.floor(this.computedW / 2);
        const targetY = player.y - Math.floor(this.computedH / 2);

        this.cam.x = Math.max(0, Math.min(targetX, this.gameState.world.width - this.computedW));
        this.cam.y = Math.max(0, Math.min(targetY, this.gameState.world.height - this.computedH));

        player.screenX = this.globalX + (player.x - this.cam.x);
        player.screenY = this.globalY + (player.y - this.cam.y);
    }

    draw(renderer) {
        super.draw(renderer);
        if (!this.fixed) {
            renderer.addChar('◢',
                this.globalX + this.computedW - 1,
                this.globalY + this.computedH - 1,
                4, true, false,
                false, 0,
                2
            );
        }
        // renderer.addRect(this.globalX || 0, this.globalY || 0, this.computedW, this.computedH, 0);

        for (let i = 0; i < this.computedH; i++) {
            const y = this.cam.y + i;
            if (y < 0 || y >= this.gameState.world.height) continue;

            for (let j = 0; j < this.computedW; j++) {
                const x = this.cam.x + j;
                if (x < 0 || x >= this.gameState.world.width) continue;

                const tileId = this.gameState.world.getTile(x, y);
                if (tileId === undefined) continue;

                const visibility = this.gameState.world.getVisibility(x, y);
                if (visibility === 0) continue;

                let light = this.gameState.world.getLight(x, y);
                light = Math.max(1, light);

                const tile = getTileData(tileId);

                let lightLevel = 0;
                if (visibility === 2) {
                    lightLevel = light;
                } else if (visibility === 1) {
                    lightLevel = 1;
                }

                renderer.addChar(
                    tile.char,
                    this.globalX + j,
                    this.globalY + i,
                    tile.color, 
                    false, false,
                    true, lightLevel,
                    0
                );
            }
        }

        for (const entity of this.gameState.entities) {
            const visibility = this.gameState.world.getVisibility(entity.x, entity.y);
            if (visibility === 2) {
                const intensity = this.gameState.world.getLight(entity.x, entity.y);
                if (intensity > 1) {
                    const lX = entity.x - this.cam.x;
                    const lY = entity.y - this.cam.y;

                    if (lX >= 0 && lX < this.computedW && lY >= 0 && lY < this.computedH) {
                        const sX = this.globalX + (entity.x - this.cam.x);
                        const sY = this.globalY + (entity.y - this.cam.y);
                        const lightLevel = Math.max(1, intensity);

                        renderer.addChar(entity.char, sX, sY, entity.color, true, false, true, lightLevel, 2);
                    }
                }
            }
        }

        renderer.addText(`Turn: ${this.gameState.turn}`, this.globalX + 1, this.globalY + 1, 3);
    }
}

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
