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

        viewportManager.clearSceneViewports();
        if (this.currentStage?.exit) this.currentStage.exit();
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
        this.uiStack.push(viewport);
        viewportManager.addViewport(viewport, { autoFocus: true });
    },

    popUI() {
        const vp = this.uiStack.pop();
        if (vp) viewportManager.removeViewport(vp.id);
    },

    update(t) {
        if (this.currentStage?.update) this.currentStage.update(t);

        if (this.uiStack.length > 0) {
            this.uiStack[this.uiStack.length - 1].update?.(t);
        }
    }
};

