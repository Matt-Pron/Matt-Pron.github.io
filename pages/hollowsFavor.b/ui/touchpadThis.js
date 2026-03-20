import { Globals } from "../globals.js";
import { InputHandler } from "../input.js";
import { Viewport } from "../viewport.js";
import { viewportManager } from "../viewportManager.js";
import { UIButton } from "./widgets.js";

export class TouchpadViewport extends Viewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        this.active = Globals.touchpad;// && isInGame();
        this.elements = [];

        this.button = new UIButton("Joystick", "move_up");
        this.button.setSize(5, 5);
        const cx = Math.floor(w / 2 - this.button.w / 2);
        const cy = Math.floor(h / 2 - this.button.h / 2);
        this.button.setPosition(cx, cy);

        this.add(this.button);
    }

    add(element) {
        this.elements.push(element);
    }

    getActionAt(lx, ly) {
        if (!this.active) return null;
        return this.button.getActionAt(lx, ly);
    }

    onResize(newCols, newRows) {
        super.onResize(newCols, newRows);
        this.width = newCols;
        this.height = 6;
    }

    handleInput(input) {
        const lowerVp = this.getLowerViewport();
        lowerVp?.handleInput?.(input);
    }

    handlePointer(type, gridX, gridY, localX, localY, event) {
        if (!this.active) return;

        const action = this.button.getActionAt(localX, localY);
        if (action) {
            if (type === 'down' || type === 'move') {
                InputHandler.emulateKey(action.action);
            } else if (type === 'up' || type === 'cancel') {
                InputHandler.stopEmulateKey(action.action);
            }
            return;
        }

        const lowerVp = this.getLowerViewport();
        lowerVp?.handlePointer?.(type, gridX, gridY, localX, localY, event);
    }

    getLowerViewport() {
        const all = viewportManager.getAllViewports();
        const myIdx = all.findIndex(vp => vp === this);
        return myIdx > 0 ? all[myIdx - 1] : null;
    }

    drawContent(renderer) {
        renderer.addLocalRect(0, 0, this.width, this.height, this.c);
        this.elements.forEach(el => el.draw(renderer));
    }
}
