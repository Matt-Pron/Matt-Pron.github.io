import { Input } from "./input.js";
import { eventBus } from "./eventBus.js";
import { LoadingScreen } from "./scenes/loading.js";
import { Globals } from "./globals.js";
import { TouchpadUI } from "./scenes/touchpad.js";
import { World } from "./scenes/world.js";

class ViewportManager {
    constructor() {
        this.loader = null;
        this.loader = new LoadingScreen();
        this.currentScene = null;   // Escenas: full screen, z: 0, una por vez
        this.viewports = [];        // tamano variable, ordenadas por z, multiples
        this.focusedVp = null;      // una por vez, captura el input, asignar el mayor z

        eventBus.on("touchpad_isDown", () => {
            const vp = this.viewports.find(e => e instanceof World);
            this.updateFocus(vp);
        });
    }

    resizeVps() {
        if (this.currentScene?.onResize) this.currentScene.onResize(Globals.cols, Globals.rows);

        for (const vp of this.viewports) {
            if (vp.onResize) vp.onResize(Globals.cols, Globals.rows);
        }

        // if (Globals.touchpad) {
            TouchpadUI.onResize(Globals.cols, Globals.rows);
        // }

        this.loader.onResize(Globals.cols, Globals.rows);
    }

    setScene(nextScene, args = {}) {
        this.loader.active = true;
        Input.consumeAll();

        // if (this.currentScene.exit) this.currentScene.exit();
        this.clearViewports();

        this.currentScene = new nextScene(args);
        this.currentScene.fullscreen = true;

        const removeListener = eventBus.on("SCENE_READY", () => {
            this.loader.active = false;
            removeListener();
            this.updateFocus();
        });

        if (this.currentScene.init) this.currentScene.init();
        else eventBus.emit("SCENE_READY");
    }

    pushUI(vp, args = {}) {
        Input.consumeAll();

        let viewport = this.viewports.find(v => v.constructor === vp);
        let isNew = false;

        if (viewport) {
            const idx = this.viewports.indexOf(viewport);
            this.viewports.splice(idx, 1);
            viewport.active = true;
        } else {
            viewport = new vp(args); // vm.pushUI(vpClass, { x: 10, y: 10, w: 20, h: 20 })
            isNew = true;
        }

        if (args.x === undefined && args.y === undefined) {
            viewport.fullscreen = true;
            viewport.z = args.z || 0;
        } else {
            viewport.setPosition(args.x || 0, args.y || 0);
            if (args.w && args.h) viewport.setSize(args.w, args.h);
            viewport.z = args.z || 0;
            viewport.fullscreen = false;
        }

        this.viewports.push(viewport);
        this.viewports.sort((a, b) => (a.z || 0) - (b.z || 0));

        if (isNew && viewport.init) viewport.init();

        this.updateFocus(viewport);
        return viewport;
    }

    popUI() {
        Input.consumeAll();

        const activeVps = this.viewports.filter(v => v.active);
        const topActive = activeVps.at(-1);

        if (topActive) {
            topActive.active = false;
        }

        this.updateFocus();
    }

    clearViewports() {
        this.viewports = this.viewports.filter(vp => {
            if (vp.persistent) return true;
            vp.active = false;
            return false;
        });

        this.updateFocus();
    }

    updateFocus(vp) {
        if (this.focusedVp) {
            this.focusedVp.isFocusedVp = false;
            if (this.focusedVp.onBlur) this.focusedVp.onBlur();
        }

        if (!vp || !vp.active) {
            const activeVps = this.viewports.filter(v => v.active);
            this.focusedVp = activeVps.length > 0 ? activeVps.at(-1) : this.currentScene;
        } else {
            this.focusedVp = vp;
        }

        if (this.focusedVp) {
            this.focusedVp.isFocusedVp = true;
            if (this.focusedVp.onFocus) this.focusedVp.onFocus();
        }
        
        eventBus.emit("viewport_focus_changed", this.focusedVp);

        this.viewports.sort((a, b) => (a.z || 0) - (b.z || 0));
        return this.focusedVp;
    }

    getAllViewports() {
        return this.viewports.slice();
    }

    getActiveViewports() {
        return this.viewports.filter(vp => vp.active).slice();
    }

    getFocusedViewport() {
        return this.focusedVp;
    }

    updateViewports(dt) {
        if (this.currentScene?.update) this.currentScene.update(dt);

        for (const vp of this.viewports) {
            if (vp.update) vp.update(dt);
        }
        this.loader.update(dt);
    }
}

export const viewportManager = new ViewportManager();

export function update(dt) {
    viewportManager.updateViewports(dt);
}

