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

        let layout;
        const desktop = {
            stats: {
                x: 0, y: 0,
                w: 14, h: Globals.rows - 6,
            },
            log: {
                x: 0, y: Globals.rows - 6,
                w: Globals.cols, h: 6,
            },
            world: {
                x: 14, y: 0,
                w: Globals.cols - 14, h: Globals.rows - 6,
            },
        }
        const mobile = {
            stats: {
                x: 0, y: 0,
                w: Globals.cols, h: 6,
            },
            log: {
                x: 0, y: Globals.rows - 6,
                w: Globals.cols, h: 6,
            },
            world: {
                x: 0, y: 6,
                w: Globals.cols, h: Globals.rows - 12,
            },
        }

        if (Globals.layout !== null) layout = Globals.layout;
            else if (Globals.cols * Globals.tileSize.x > Globals.rows * Globals.tileSize.y) layout = desktop;
                else layout = mobile;

        viewportManager.pushUI(StatsViewport, { ...layout.stats, z: 1, ...sharedState }); // stats
        viewportManager.pushUI(LogViewport, { ...layout.log, z: 1, ...sharedState }); // logs
        viewportManager.pushUI(World, { ...layout.world, z: 1, ...sharedState });

        // pause menu

        if (Globals.touchpad) {
            TouchpadUI.active = true;
        }

        super.init();
    }
}

