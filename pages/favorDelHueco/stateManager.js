import { Input } from "./input.js";
import { eventBus } from "./eventBus.js";
import { Globals } from "./globals.js";
import { viewportManager } from "./viewportManager.js";

export const StageManager = {
    currentStage: null,
    uiStack: [],
    loaderId: null,
    loader: null,

    init(loaderId) {
        this.loaderId = loaderId;
        this.loader = viewportManager.getViewport(loaderId);
    },

    setStage(nextStage, params = []) {
        if (this.loader) this.loader.active = true;
        Input.consumeAll();

        viewportManager.clearSceneViewports();
        // if (this.currentStage?.exit) this.currentStage.exit();
        this.uiStack = [];

        let instance;
        if (typeof nextStage === "function") {
            instance = new nextStage(...params);
        } else {
            instance = nextStage;
        }

        this.currentStage = instance;

        viewportManager.addViewport(this.currentStage, {
            persistent: false,
            autoFocus: true
        });

        const removeListener = eventBus.on("SCENE_READY", () => {
            if (this.loader) this.loader.active = false;
            removeListener();
        });

        if (this.currentStage.init) this.currentStage.init();
        else eventBus.emit("SCENE_READY");
    },

    pushUI(viewport) {
        if (this.loader) this.loader.active = true;
        Input.consumeAll();

        this.uiStack.push(viewport);

        viewportManager.addViewport(viewport, { autoFocus: true });

        if (viewport.init) viewport.init();
    },

    popUI() {
        Input.consumeAll();

        const vp = this.uiStack.pop();
        if (vp) viewportManager.removeViewport(vp.id);
    },

    update(dt) {
        if (this.currentStage?.update) this.currentStage.update(dt);

        if (this.uiStack.length > 0) {
            this.uiStack[this.uiStack.length - 1].update?.(dt);
        }
    }
};

export function update(dt) {
    StageManager.update(dt);
}

