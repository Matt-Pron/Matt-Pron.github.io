import { Viewport } from "./viewport.js";
import { viewportManager } from "../viewportManager.js";
import { TurnManager } from "../turnmanager.js";
import { GameState } from "../game.js";
import { Globals } from "../globals.js";

import { World } from "./world.js";
import { StatsViewport } from "./vpStats.js";
import { LogViewport } from "./vpLog.js";
import { TouchpadUI } from "./touchpad.js";

export class GameScene extends Viewport {
    constructor(playerData) {
        super();
        this.setBackground(0);

        this.gameState = new GameState(playerData.playerData);
        this.player = this.gameState.player;
        this.turnManager = new TurnManager(this.gameState, null);
    }

    async init() {
        await this.gameState.generateTown();

        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player
        };

        viewportManager.pushUI(StatsViewport, { x: 0, y: 0, w: 14, h: this.computedH - 6, z: 1, ...sharedState }); // stats
        viewportManager.pushUI(LogViewport, { x: 0, y: this.computedH - 6, w: this.computedW, h: 6, z: 1, ...sharedState }); // logs
        viewportManager.pushUI(World, { x: 14, y: 0, w: this.computedW - 14, h: this.computedH - 6, z: 1, ...sharedState });

        // pause menu

        if (Globals.touchpad) {
            TouchpadUI.active = true;
        }

        super.init();
    }
}

