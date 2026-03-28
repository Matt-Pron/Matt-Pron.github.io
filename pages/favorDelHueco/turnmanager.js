import { getTileData } from "./data/tiles.js";
import { Monster } from "./entities.js";
import { eventBus } from "./eventBus.js";
import { random } from "./math.js";
import { generateFlowMap } from "./pathfinding.js";

export class TurnManager {
    constructor(gameState, worldViewport) {
        this.state = gameState;
        this.world = worldViewport;
    }

    processTurn(action) {
        const player = this.state.player;
        let playerTookTurn = false;

        switch (action.type) {
            case 'move':
                playerTookTurn = this.moveOrAttack(action.dir.x, action.dir.y);
                break;
            case 'shoot':
                playerTookTurn = this.rangedAttack(action.dir.x, action.dir.y);
                break;
            case 'wait':
                playerTookTurn = true;
                if (random(1, 100) <= 12 && player.W < player.maxW) player.heal(random(1, 4));
                player.onGuard = true;
                break;
        }

        if (playerTookTurn) {
            this.tick();
            return true;
        }
        return false;
    }

    moveOrAttack(dx, dy) {
        const player = this.state.player;
        const tx = player.x + dx;
        const ty = player.y + dy;

        if (tx < 0 || tx >= this.state.world.width || ty < 0 || ty >= this.state.world.height) return false;

        const tileId = this.state.world.getTile(tx, ty);
        if (tileId === undefined || getTileData(tileId).collision) {
            return false;
        }

        const target = this.state.getEntityAt(tx, ty);
        if (target && target !== player) {
            if (target.interact) {
                target.interact(player);
                return true;
            }
            else if (target.getDmg) {
                player.meleeAttack(target);
                return true;
            }
            return false;
        }

        player.x = tx;
        player.y = ty;
        this.state.updateEntityPosition(player, tx, ty);
        if (random(1, 100) <= 4 && player.W < player.maxW) player.heal(1);
        return true;
    }

    tick() {
        this.state.turn++;

        this.state.player.alreadyDefended = false;
        this.state.player.onGuard = false;

        if (this.state.player.lightDecrease) this.state.player.lightDecrease();

        this.monsterTurns();

        this.state.removeDeadEntities();

        eventBus.emit('end_of_turn');
    }

    monsterTurns() {
        this.updateActiveChunks();

        const flowMap = generateFlowMap(
            (x, y) => this.state.world.getTile(x, y),
            this.state.world.width,
            this.state.world.height,
            this.state.player.x,
            this.state.player.y, 
            35,
        );

        for (const chunk of this.state.world.chunks) {
            if (!chunk.active) continue;

            for (const entity of chunk.entities) {
                if (entity instanceof Monster) {
                    entity.alreadyDefended = false;
                    if (entity.regen) entity.regen();
                    if (entity.takeTurn) {
                        entity.takeTurn(this.state, flowMap);
                    }
                }
            }
        }
    }

    updateActiveChunks() {
        for (const chunk of this.state.world.chunks) {
            chunk.active = false;
        }

        const playerX = this.state.player.x;
        const playerY = this.state.player.y;

        const chunkSize = this.state.world.chunkSize;

        const pCX = Math.floor(playerX / chunkSize);
        const pCY = Math.floor(playerY / chunkSize);

        for (let dy = -3; dy <=3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
                const cx = pCX + dx;
                const cy = pCY + dy;

                if (cx >= 0 && cx < this.state.world.chunksX &&
                    cy >= 0 && cy < this.state.world.chunksY) {
                    const index = cy * this.state.world.chunksX + cx;
                    this.state.world.chunks[index].active = true;
                }
            }
        }
    }
}

