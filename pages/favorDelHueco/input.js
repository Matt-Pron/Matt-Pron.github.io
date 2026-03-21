import { eventBus } from "./eventBus.js";
import { Renderer } from "./renderer.js";
import { RendererUtils } from "./rendererUtils.js";
import { TouchpadUI } from "./scenes/touchpad.js";
import { viewportManager } from "./viewportManager.js";

// Estado del Input
export const Input = {
    keysPressed: new Set(),
    keyStates: new Map(),
    pointer: {
        x: 0,
        y: 0,
        isDown: false, // El click esta o no apretado
        justPressed: false, // Recien clickeado
        captureTarget: null, // Quien tiene el puntero
    },

    repeatDelay: 200,
    repeatRate: 35,

    // listeners de puntero
    init() {
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
        window.addEventListener("pointerdown", (e) => this.handlePointer(e, 'down'));
        window.addEventListener("pointermove", (e) => this.handlePointer(e, 'move'));
        window.addEventListener("pointerup", (e) => this.handlePointer(e, 'up'));
        window.addEventListener("pointercancel", (e) => this.handlePointer(e, 'up'));

        eventBus.on("emulate_key", (e) => this.handleKey(e, true));
    },

    handleKey(e, isDown) {
        // if (event.repeat) return;
        if (isDown) this.keysPressed.add(e.key.toLowerCase());
        else this.keysPressed.delete(e.key.toLowerCase());
    },

    handlePointer(e, type) {
        if (e.pointerType === "touch") e.preventDefault();
        Renderer.canvas.setPointerCapture(e.pointerId);
        
        const rect = Renderer.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        const grid = RendererUtils.pxToGrid(canvasX, canvasY);

        this.pointer.x = grid.x;
        this.pointer.y = grid.y;
        
        this.pointer.canvasX = canvasX;
        this.pointer.canvasY = canvasY;
        this.pointer.canvasW = rect.width;
        this.pointer.canvasH = rect.height;

        if (type === 'down') {
            if (e.button !== 0 && e.pointerType !== 'touch') return;
            this.pointer.isDown = true;
            this.pointer.justPressed = true;
        }
        else if (type === 'up' || type === 'cancel') {
            this.pointer.isDown = false;
            this.pointer.captureTarget = null;
        }
    },

    consumeAll() {
        this.keysPressed.clear();
        this.keyStates.clear();
        this.pointer.isDown = false;
        this.pointer.justPressed = false;
        this.pointer.captureTarget = null;
    },

    flush() {
        this.pointer.justPressed = false;
    }
};

let focusedViewport;

export function processInput(dt) {
    focusedViewport = viewportManager.getFocusedViewport() || null;

    // Prioridad si pasas el puntero apretado sobre el touchpad
    // const hitRed = checkHit(Input.pointer, redButton);
    //
    // if (Input.pointer.isDown && hitRed) {
    //     redButton.active = true;
    //     // Si toca el touchpad cancelar drag anterior TODO
    // } else {
    //     redButton.active = false;
    // }
    if (TouchpadUI && TouchpadUI.active) {
        const touchpadConsumed = TouchpadUI.processInput(Input.pointer);
        if (touchpadConsumed) {
            Input.pointer.justPressed = false;
            Input.pointer.captureTarget = null;
        }
    }

    // Capturar el puntero en el VP clickeado
    if (Input.pointer.captureTarget) {
        const ct = Input.pointer.captureTarget;

        if (ct.isResizing) {
            const dx = Input.pointer.x - ct.lastDragX;
            const dy = Input.pointer.y - ct.lastDragY;

            if (dx !== 0 || dy !== 0) {
                const currentW = ct.computedW !== undefined ? ct.computedW : ct.width;
                const currentH = ct.computedH !== undefined ? ct.computedH : ct.height;

                const newW = Math.max(2, currentW + dx);
                const newH = Math.max(2, currentH + dy);

                if (ct.setSize) ct.setSize(newW, newH);
                else { ct.width = newW; ct.height = newH; }

                if (ct.computeLayout) ct.computeLayout();

                ct.lastDragX = Input.pointer.x;
                ct.lastDragY = Input.pointer.y;

                ct.onResize();
            }
        }
        // Moviendo un viewport
        else if ((ct.fixed !== undefined && !ct.fixed) || viewportManager.editMode) {
            ct.x += Input.pointer.x - ct.lastDragX;
            ct.y += Input.pointer.y - ct.lastDragY;

            if (ct.computeLayout) ct.computeLayout();

            ct.lastDragX = Input.pointer.x;
            ct.lastDragY = Input.pointer.y;
        }

        else if (typeof ct.getValueAt === 'function') {
            const newVal = ct.getValueAt(Input.pointer.x);
            if (newVal !== ct.value) {
                let owner = ct;
                while (owner && typeof owner.interact !== 'function') {
                    owner = owner.parent;
                }
                if (owner && typeof owner.interact === 'function') {
                    owner.interact({
                        action: ct.action,
                        value: newVal,
                        element: ct
                    });
                }
            }
        }
    }

    // Si no hay dragging, cambiar focus
    else if (Input.pointer.justPressed) {
        let clickedSomething = false;

        const orderedVPs = viewportManager.getActiveViewports().reverse();
        for (const vp of orderedVPs) {
            if (!vp.fixed && vp.editMode && checkResizeHit(Input.pointer, vp)) {
                viewportManager.updateFocus(vp);
                focusedViewport = viewportManager.getFocusedViewport();

                Input.pointer.captureTarget = vp;
                vp.isResizing = true;
                vp.lastDragX = Input.pointer.x;
                vp.lastDragY = Input.pointer.y;

                vp.onResize();

                clickedSomething = true;
                break;
            }

            else if (checkHit(Input.pointer, vp)) {
                viewportManager.updateFocus(vp);
                focusedViewport = viewportManager.getFocusedViewport();

                const innerHit = vp.getHit ? vp.getHit(Input.pointer.x, Input.pointer.y) : null;

                if (innerHit && innerHit.element && typeof innerHit.element.getValueAt === 'function') {
                    Input.pointer.captureTarget = innerHit.element;
                } else {
                    Input.pointer.captureTarget = focusedViewport;
                    focusedViewport.isResizing = false;
                    focusedViewport.lastDragX = Input.pointer.x;
                    focusedViewport.lastDragY = Input.pointer.y;
                }

                clickedSomething = true;
                break;
            }
        }

        // Borrar focus clickeando afuera
        if (!clickedSomething) {
            focusedViewport = viewportManager.getFocusedViewport();
        }
    }

    // Envia el estado del Input al vp activo
    if (focusedViewport) {
        const rawState = {
            keys: new Set(Input.keysPressed),
            pointer: { ...Input.pointer },
        };

        if (focusedViewport.handleInput) focusedViewport.handleInput(rawState, dt);
    }

    Input.flush();
}

function checkHit(mouse, rect) {
    const rx = rect.globalX !== undefined ? rect.globalX : rect.x;
    const ry = rect.globalY !== undefined ? rect.globalY : rect.y;
    const rw = rect.computedW !== undefined ? rect.computedW : rect.width;
    const rh = rect.computedH !== undefined ? rect.computedH : rect.height;

    return mouse.x >= rx && mouse.x <= rx + rw &&
           mouse.y >= ry && mouse.y <= ry + rh;
}

function checkResizeHit(mouse, rect) {
    const rx = rect.globalX !== undefined ? rect.globalX : rect.x;
    const ry = rect.globalY !== undefined ? rect.globalY : rect.y;
    const rw = rect.computedW !== undefined ? rect.computedW : rect.width;
    const rh = rect.computedH !== undefined ? rect.computedH : rect.height;

    return mouse.x >= (rx + rw - 2) && mouse.x <= (rx + rw) &&
           mouse.y >= (ry + rh - 2) && mouse.y <= (ry + rh);
}

// export function processInput(dt) {
//     focusedViewport = viewportManager.getFocusedViewport() || null;
//
//     // Prioridad si pasas el puntero apretado sobre el touchpad
//     // const hitRed = checkHit(Input.pointer, redButton);
//     //
//     // if (Input.pointer.isDown && hitRed) {
//     //     redButton.active = true;
//     //     // Si toca el touchpad cancelar drag anterior TODO
//     // } else {
//     //     redButton.active = false;
//     // }
//
//     // Capturar el puntero en el VP clickeado
//     if (Input.pointer.captureTarget) {
//         const vp = Input.pointer.captureTarget;
//
//         // Moviendo un viewport
//         if (!vp.fixed) {
//             vp.x += Input.pointer.x - vp.lastDragX;
//             vp.y += Input.pointer.y - vp.lastDragY;
//
//             if (vp.computeLayout) vp.computeLayout();
//
//             vp.lastDragX = Input.pointer.x;
//             vp.lastDragY = Input.pointer.y;
//         }
//     }
//
//     // Si no hay dragging, cambiar focus
//     else if (Input.pointer.justPressed) {
//         let clickedSomething = false;
//
//         const orderedVPs = viewportManager.getActiveViewports().reverse();
//         for (const vp of orderedVPs) {
//             if (checkHit(Input.pointer, vp)) {
//                 viewportManager.updateFocus(vp);
//                 focusedViewport = viewportManager.getFocusedViewport();
//
//                 Input.pointer.captureTarget = focusedViewport;
//                 vp.lastDragX = Input.pointer.x;
//                 vp.lastDragY = Input.pointer.y;
//
//                 clickedSomething = true;
//                 break;
//             }
//         }
//
//         // Borrar focus clickeando afuera
//         if (!clickedSomething) {
//             focusedViewport = viewportManager.getFocusedViewport();
//         }
//     }
//
//     // Envia el estado del Input al vp activo
//     if (focusedViewport) {
//         const rawState = {
//             keys: new Set(Input.keysPressed),
//             pointer: { ...Input.pointer },
//         };
//
//         if (focusedViewport.handleInput) focusedViewport.handleInput(rawState, dt);
//     }
//
//     Input.flush();
// }

// To find a viewport at x, y
//
// function findViewportAt(gridX, gridY) {
//     const topToBottom = viewportManager.getActiveViewports().reverse();
//     for (const vp of topToBottom) {
//         if (gridX >= vp.x && gridX < vp.x + vp.width &&
//             gridY >= vp.y && gridY < vp.y + vp.height) {
//
//             return vp;
//         }
//     }
//     return null;
// }
//
//     emulateKey(key) {
//     }
//
//     stopEmulateKey(action) {
//     }
// }
