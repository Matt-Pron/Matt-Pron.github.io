import { Input } from "../input.js";
import { ACTIONS, createAction, GAME_KEY_MAP, REPEATABLE_ACTIONS, UI_KEY_MAP } from "../data/actions.js";
import { eventBus } from "../eventBus.js";
import { UIElement } from "../ui/ui-element.js";
import { Globals } from "../globals.js";

export class Viewport extends UIElement {
    constructor() {
        super('Viewport');

        this.setPosition(0, 0);
        this.setSize(Globals.cols, Globals.rows);

        this.z = 0;                 // scenes 0, ui 10, important 100
        this.fullscreen = true;     // fullscreen or window
        this.active = true;         // active or inactive
        this.fixed = true;          // fixed or draggable

        this.mode = 'ui';           // Override only in game scenes
        this.prevPointer = { x: 0, y: 0 };
        this.actionsQueue = [];
    }

    init() {
        eventBus.emit("SCENE_READY");
    }

    onResize(newCols, newRows) {
        if (this.fullscreen === true) {
            this.setSize(newCols, newRows);
        }
        this.computeLayout();
    }

    onFocus() {
        if (this.mode === 'ui') {
            Input.repeatDelay = 200;
            Input.repeatRate = 35;
        } else {
            Input.repeatDelay = 150;
            Input.repeatRate = 150;
        }
        this.computeLayout();
    }

    getMapping() {
        return this.mode === 'ui' ? UI_KEY_MAP : GAME_KEY_MAP;
    }

    handleInput(rawState, dt) {
        const actions = this.translateToActions(rawState);
        this.actionsQueue.push(...actions);
    }

    translateToActions(rawState) {
        const mapping = this.getMapping();
        const actions = [];
        const now = performance.now();

        for (const key of rawState.keys) {
            const actionType = mapping.get(key);
            if (actionType === undefined) {
                // console.debug(`Unhandled key: ${key}`);
                continue;
            }

            let state = Input.keyStates.get(key);
            let isJustPressed = false;

            if (!state) {
                state = { pressTime: now, lastRepeatTime: now };
                Input.keyStates.set(key, state);
                isJustPressed = true;
            } else {
                const timeHeld = now - state.pressTime;
                if (timeHeld > Input.repeatDelay) {
                    const timeSinceLast = now - state.lastRepeatTime;
                    if (timeSinceLast >= Input.repeatRate) {
                        state.lastRepeatTime = now;
                        actions.push(createAction(actionType, true, { justPressed: false }));
                    }
                }
                continue;
            }

            actions.push(createAction(actionType, true, { justPressed: isJustPressed }));
        }

        for (const [key] of Input.keyStates) {
            if (!rawState.keys.has(key)) {
                Input.keyStates.delete(key);
            }
        }

        if (rawState.pointer.isDown) {
            actions.push(createAction(ACTIONS.POINTER_DOWN, true, {
                x: rawState.pointer.x,
                y: rawState.pointer.y,
                justPressed: rawState.pointer.justPressed, // Recien clickeado
                captureTarget: rawState.pointer.captureTarget, // Quien tiene el puntero
            }));
        } else if (rawState.pointer.x !== this.prevPointer.x ||
            rawState.pointer.y !== this.prevPointer.y) {
            actions.push(createAction(ACTIONS.POINTER_MOVE, false, {
                x: rawState.pointer.x,
                y: rawState.pointer.y,
                captureTarget: rawState.pointer.captureTarget
            }));
            this.prevPointer.x = rawState.pointer.x;
            this.prevPointer.y = rawState.pointer.y;
        }

        return actions;
    }

    update(dt) {
        this.executeActions(this.actionsQueue, dt);
        this.actionsQueue = [];
    }

    interact() {}

    executeActions(actions, dt) {
        for (const a of actions) {
            if (a.action === ACTIONS.POINTER_MOVE) {
                continue;
            }

            const isRepeatable = REPEATABLE_ACTIONS.has(a.action);
            // const isRepeatable = false;
            const shouldTrigger = isRepeatable ? a.isPressed : a.justPressed;

            if (!shouldTrigger) continue;

            switch (a.action) {
                case ACTIONS.POINTER_DOWN:
                    if (a.justPressed) {
                        const hit = this.getHit ? this.getHit(a.x, a.y) : null;
                        if (hit && hit.action) {
                            this.interact(hit);
                        }
                    }
                    break;
                default:
                    console.warn('Unhandled action: ', a.action);
            }
        }
    }
}

