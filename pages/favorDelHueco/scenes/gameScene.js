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
import { GameStatistics } from "./gameStatistics.js";
import { DeathScreen } from "./deathScreen.js";
import { AdvanceMenu } from "./advances.js";

export class GameScene extends Viewport {
    constructor(playerData) {
        super();

        this.gameState = new GameState(playerData.playerData);
        this.player = this.gameState.player;
        this.turnManager = new TurnManager(this.gameState, null);

        this.stats = null;
        this.log = null;
        this.world = null;
        this.pauseMenu = null;
        this.touchpad = TouchpadUI;

        this.customizing = false;
        this.baseZ = 1;
    }

    async init() {
        await this.gameState.generateTown();

        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player,
            gameScene: this
        };

        this.calculateDefaultLayout();

        this.stats = viewportManager.pushUI(StatsViewport, { ...this.layout.stats, z: this.baseZ, ...sharedState });
        this.log = viewportManager.pushUI(LogViewport, { ...this.layout.log, z: this.baseZ, ...sharedState });
        this.world = viewportManager.pushUI(World, { ...this.layout.world, z: this.baseZ, ...sharedState });

        if (Globals.touchpad) {
            this.touchpad.active = false;
        }

        eventBus.on("viewport_focus_changed", (focused) => this.handleFocusChange(focused));
        eventBus.on("on_player_death", () => this.playerDied());

        super.init();

        viewportManager.updateFocus(this.world);
        this.updateTouchpadStatus(viewportManager.getFocusedViewport());
    }

    calculateDefaultLayout() {
        const desktop = {
            stats: { x: 0, y: 0, w: 14, h: Globals.rows - 6 },
            log: { x: 0, y: Globals.rows - 6, w: Globals.cols, h: 6 },
            world: { x: 14, y: 0, w: Globals.cols - 14, h: Globals.rows - 6 },
        };
        const mobile = {
            stats: { x: 0, y: 0, w: Globals.cols, h: 6 },
            log: { x: 0, y: Globals.rows - 8, w: Globals.cols, h: 8 },
            world: { x: 0, y: 6, w: Globals.cols, h: Globals.rows - 14 },
        };

        if (Globals.layout !== null) {
            this.layout = Globals.layout;
        } else if (Globals.cols * Globals.tileSize.x > Globals.rows * Globals.tileSize.y) {
            this.layout = desktop;
        } else {
            this.layout = mobile;
        }
    }

    resetUi() {
        this.calculateDefaultLayout();

        if (this.stats && this.log && this.world) {
            this.stats.setPosition(this.layout.stats.x, this.layout.stats.y)
                      .setSize(this.layout.stats.w, this.layout.stats.h).computeLayout();
            this.log.setPosition(this.layout.log.x, this.layout.log.y)
                      .setSize(this.layout.log.w, this.layout.log.h).computeLayout();
            this.world.setPosition(this.layout.world.x, this.layout.world.y)
                      .setSize(this.layout.world.w, this.layout.world.h).computeLayout();
        }
    }

    toggleCustomize() {
        this.customizing = !this.customizing;

        const vps = [this.stats, this.log, this.world];
        vps.forEach(vp => {
            if (vp) vp.fixed = !this.customizing;
        });

        this.updateTouchpadStatus(viewportManager.getFocusedViewport());
    }

    handleFocusChange(focused) {
        const vps = [this.stats, this.log, this.world];

        vps.forEach(vp => {
            if (vp) vp.z = this.baseZ;
        });

        if (focused && vps.includes(focused)) {
            focused.z = this.baseZ + 1;
        }

        this.updateTouchpadStatus(focused);
    }

    updateTouchpadStatus(focused) {
        if (!Globals.touchpad) {
            this.touchpad.active = false;
            return;
        }

        const shouldBeActive = (focused === this.world) && !this.customizing;

        if (this.touchpad.active !== shouldBeActive) {
            this.touchpad.active = shouldBeActive;
            if (shouldBeActive) this.touchpad.onResize(Globals.cols, Globals.rows);
        }
    }

    openPauseMenu() {
        this.pauseMenu = viewportManager.pushUI(PauseMenu, {
            x: ((Globals.cols - 20) >> 1),
            y: ((Globals.rows - 13) >> 1),
            z: 15,
            gameScene: this
        });
    }

    openMenu() {
        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player,
            gameScene: this
        };
        this.menu = viewportManager.pushUI(AdvanceMenu, {
            x: ((Globals.cols - 20) >> 1),
            y: ((Globals.rows - 13) >> 1),
            z: 15,
            ...sharedState
        });
        console.log(this.player);
    }

    playerDied() {
        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player,
            gameScene: this
        };
        viewportManager.setScene(DeathScreen, sharedState);
    }

    exit() {
        const sharedState = {
            gameState: this.gameState,
            turnManager: this.turnManager,
            player: this.player,
            gameScene: this
        };
        viewportManager.setScene(GameStatistics, sharedState);
    }
}

