import { Viewport } from "./viewport.js";
import { viewportManager } from "../viewportManager.js";
import { TurnManager } from "../turnmanager.js";
import { GameState } from "../game.js";
import { Globals } from "../globals.js";

import { World } from "./world.js";
import { StatsViewport } from "./vpStats.js";
import { LogViewport } from "./vpLog.js";
import { TouchpadUI } from "./touchpad.js";
import { PauseMenu } from "./pauseMenu.js";
import { eventBus } from "../eventBus.js";

export class GameScene extends Viewport {
    constructor(playerData) {
        super();
        this.setBackground(8);

        this.gameState = new GameState(playerData.playerData);
        this.player = this.gameState.player;
        this.turnManager = new TurnManager(this.gameState, null);

        this.stats = null;
        this.log = null;
        this.world = null;
        this.pauseMenu = null;
        this.touchpad = TouchpadUI;
    }

    async init() {
        await this.gameState.generateTown();

        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player,
            gameScene: this
        };

        this.layout;
        this.resetUi();

        this.stats = viewportManager.pushUI(StatsViewport, { ...this.layout.stats, z: 1, ...sharedState });
        this.log = viewportManager.pushUI(LogViewport, { ...this.layout.log, z: 1, ...sharedState });
        this.world = viewportManager.pushUI(World, { ...this.layout.world, z: 1, ...sharedState });

        if (Globals.touchpad) {
            this.touchpad.active = false;
        }

        eventBus.on("viewport_focus_changed", (focused) => {
            if (!Globals.touchpad) return;
            const shouldBeActive = (focused === this.world);
            if (this.touchpad.active !== shouldBeActive) {
                this.touchpad.active = shouldBeActive;
                if (shouldBeActive) this.touchpad.onResize(Globals.cols, Globals.rows);
            }
        });

        super.init();
    }

    resetUi() {
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
                x: 0, y: Globals.rows - 8,
                w: Globals.cols, h: 8,
            },
            world: {
                x: 0, y: 6,
                w: Globals.cols, h: Globals.rows - 14,
            },
        }

        if (Globals.layout !== null) this.layout = Globals.layout;
            else if (Globals.cols * Globals.tileSize.x > Globals.rows * Globals.tileSize.y) this.layout = desktop;
                else this.layout = mobile;

                // resizear los 3 vps
        // this.stats = viewportManager.pushUI(StatsViewport, { ...layout.stats, z: 1, ...sharedState });
        // this.log = viewportManager.pushUI(LogViewport, { ...layout.log, z: 1, ...sharedState });
        // this.world = viewportManager.pushUI(World, { ...layout.world, z: 1, ...sharedState });
    }

    openMenu() {
        this.pauseMenu = viewportManager.pushUI(PauseMenu, { x: ((Globals.cols - 20) >> 1), y: ((Globals.rows - 13) >> 1), z: 15 });
    }
}

