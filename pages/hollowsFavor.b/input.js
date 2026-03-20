import { HOTKEYS } from "./data/hotkeys.js";
import { Renderer } from "./renderer.js";
import { RendererUtils } from "./rendererUtils.js";
import { TouchpadUI } from "./ui/touchpad.js";
import { UISlider } from "./ui/widgets.js";
import { viewportManager } from "./viewportManager.js";

function findViewportAt(gridX, gridY) {
    const topToBottom = viewportManager.getActiveViewports().reverse();
    for (const vp of topToBottom) {
        if (gridX >= vp.x && gridX < vp.x + vp.width &&
            gridY >= vp.y && gridY < vp.y + vp.height) {

            return vp;
        }
    }
    return null;
}

class inputHandler {
    constructor() {
        this.heldActions = new Set();
        this.repeatTimers = {};
        this.dragging = { active: false, element: null };

        this.setupListeners();
    }

    setupListeners() {
        // window.addEventListener("blur", () => {
        //     this.heldActions.clear();
        //
        //     for (const action in this.repeatTimers) {
        //         clearTimeout(this.repeatTimers[action]);
        //         clearInterval(this.repeatTimers[action]);
        //         delete this.repeatTimers[action];
        //     }
        // });

        window.addEventListener("keydown", (e) => this.handleKey(e, true));
        window.addEventListener("keyup", (e) => this.handleKey(e, false));

        Renderer.canvas.addEventListener("pointerdown", (e) => this.handlePointer(e, 'down'));
        Renderer.canvas.addEventListener("pointermove", (e) => this.handlePointer(e, 'move'));
        Renderer.canvas.addEventListener("pointerup", (e) => this.handlePointer(e, 'up'));
        Renderer.canvas.addEventListener("pointercancel", (e) => this.handlePointer(e, 'up'));
    }

    startRepeat(action) {
        const mode = "ui";
        const config = { delay: 200, rate: 35 };

        if (action === "confirm" || action === "reset") return;
        this.stopRepeat(action);

        this.repeatTimers[action] = {
            timeout: setTimeout(() => {
                this.dispatch({ action: action });
                this.repeatTimers[action].interval = setInterval(() => this.dispatch({ action: action }), config.rate);
            }, config.delay)
        };
    }

    stopRepeat(action) {
        const timers = this.repeatTimers[action];
        if (timers) {
            clearTimeout(timers.timeout);
            clearInterval(timers.interval);
            delete this.repeatTimers[action];
        }
    }

    handleKey(event, isDown) {
        if (event.repeat) return;
        const action = HOTKEYS[event.key.toLowerCase()];
        if (!action) return;

        const input = { action: action };
        if (isDown) {
            if (!this.heldActions.has(action)) {
                this.heldActions.add(action);
                this.dispatch(input);
                this.startRepeat(action);
            }
        } else {
            this.heldActions.delete(action);
            this.stopRepeat(action);
        }
    }

    handlePointer(e, type) {
        if (e.pointerType === "touch") e.preventDefault();
        const rect = Renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const grid = RendererUtils.pxToGrid(x, y);

        // Looking for touchpad
        // const tpx = grid.x - TouchpadUI.x;
        // const tpy = grid.y - TouchpadUI.y;
        //
        // if (TouchpadUI.active) {
        //     const touchAction = TouchpadUI.getActionAt(tpx, tpy);
        //
        //     if (type === "down" && touchAction) {
        //         this.emulateKey(touchAction);
        //         this.dragging.touchpadAction = touchAction;
        //         return;
        //     }
        //
        //     if (type === "move" && this.dragging.touchpadAction) {
        //         return;
        //     }
        // }
        //
        // if (type === "up" && this.dragging.touchpadAction) {
        //     this.stopEmulateKey(this.dragging.touchpadAction);
        //     this.dragging.touchpadAction = null;
        //     return;
        // }
        //touchpad end

        const targetVp = findViewportAt(grid.x, grid.y);
        if (!targetVp) return;

        const localX = grid.x - targetVp.x;
        const localY = grid.y - targetVp.y;

        if (type === "down") {
            Renderer.canvas.setPointerCapture(e.pointerId);

            targetVp.setHoverFocus?.(localX, localY);

            const result = targetVp.getActionAt?.(localX, localY);

            if (result) {
                if (result.element && result.element instanceof UISlider) {
                    this.dragging.element = result.element;
                    this.dragging.active = true;
                    this.dispatch(result);
                } else {
                    this.dispatch(result);
                }
            } else {
                this.dispatch({ action: "click" });
            }
        }
        else if (type === "move") {
            if (this.dragging.active && this.dragging.element) {

                if (this.dragging.element instanceof UISlider) {
                    const val = this.dragging.element.getValueAt(localX);
                    this.dispatch({
                        action: this.dragging.element.action,
                        value: val
                    });
                }

            } else {
                targetVp.setHoverFocus?.(localX, localY);
            }
        }
        else if (type === "up") {
            this.dragging.active = false;
            this.dragging.element = null;
        }
    }

    dispatch(input) {
        if (!input || !input.action) return;

        if (input.action.slice(0, 4) !== "move") {
            this.heldActions.delete(input.action);
            this.stopRepeat(input.action);
        }

        const targetVp = viewportManager.getFocusedViewport();
        if (targetVp?.handleInput) targetVp.handleInput(input);
    }

    emulateKey(key) {
        if (!this.heldActions.has(key.action)) {
            this.heldActions.add(key.action);
            this.dispatch(key);
            this.startRepeat(key.action);
        }
    }

    stopEmulateKey(action) {
        this.heldActions.delete(action.action);
        this.stopRepeat(action.action);
    }
}

export const InputHandler = new inputHandler();

