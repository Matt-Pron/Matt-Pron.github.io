import { Globals } from "./globals.js";

let nextId = 0;

class ViewportManager {
    constructor() {
        this.viewports = [];
        this.focusedId = null;
    }

    addViewport(vp, options = {}) {
        if (!vp.id) vp.id = `vp-${nextId++}`;
        if (options.name) vp.name = options.name;
        vp.z = typeof vp.z === 'number' ? vp.z : 0;
        vp.active = vp.active ?? true;
        vp.persistent = options.persistent ?? false;
        vp.focused = false;

        this.viewports.push(vp);
        this.viewports.sort((a, b) => a.z - b.z);

        if (options.autoFocus) this.setFocus(vp.id);
        if (vp.onResize) vp.onResize(Globals.cols, Globals.rows);

        return vp.id;
    }

    clearSceneViewports() {
        this.viewports = this.viewports.filter(vp => vp.persistent);
        if (this.focusedId && !this.getViewport(this.focusedId)) {
            this.focusedId = null;
        }
    }

    // setScene(sceneViewport, loaderId) {
    //     const loader = this.getViewport(loaderId);
    //     if (loader) loader.active = true;
    //
    //     const touchpad = this.viewports.find(vp => vp.name === "touchpad");
    //     if (touchpad) touchpad.active = false;
    //
    //     this.clearSceneViewports();
    //
    //     if (sceneViewport) {
    //         this.addViewport(sceneViewport, { persistent: false });
    //         this.setFocus(sceneViewport.id);
    //     }
    // }

    removeViewport(id) {
        const index = this.viewports.findIndex(vp => vp.id === id);
        if (index === -1) return false;

        const removedVp = this.viewports.splice(index, 1)[0];
        // this.viewports.splice(index, 1)[0];
        if (this.focusedId === id) {
            this.focusedId = null;
        }
        if (!this.focusedId) {
            const defaultVp = this.getActiveViewports()[0];
            if (defaultVp) this.setFocus(defaultVp.id);
        }

        return true;
    }

    getViewport(id) {
        return this.viewports.find(vp => vp.id === id) || null;
    }

    getActiveViewports() {
        return this.viewports.filter(vp => vp.active).slice();
    }

    setFocus(id) {
        const vp = this.getViewport(id);
        if (!vp || !vp.active) {
            return false;
        }

        if (vp.name === "touchpad") {
            return false;
        }

        if (this.focusedId) {
            const oldVp = this.getViewport(this.focusedId);
            if (oldVp) oldVp.focused = false;
        }

        this.focusedId = id;
        vp.focused = true;
        return true;
    }

    getFocusedViewport() {
        return this.getViewport(this.focusedId);
    }

    setActive(id, active) {
        const vp = this.getViewport(id);
        if (!vp) return false;
        vp.active = !!active;
        if (!active && this.focusedId === id) {
            this.focusedId = null;
        }
        return true;
    }

    getAllViewports() {
        return this.viewports.slice();
    }
}

export const viewportManager = new ViewportManager();

