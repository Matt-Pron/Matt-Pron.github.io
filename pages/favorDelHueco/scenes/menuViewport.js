import { Viewport } from "./viewport.js";
import { ACTIONS, REPEATABLE_ACTIONS } from "../data/actions.js";

export class MenuViewport extends Viewport {
    constructor() {
        super();
        this.index = 0;
        this.navElements = [];
    }

    collectElements() {
        this.navElements = this.getNavigableElements(this);
    }

    ensureValidFocus() {
        if (this.navElements.length === 0) return;
        if (this.index >= this.navElements.length || this.index < 0) {
            this.index = 0;
        }
        this.updateFocus();
    }

    navigate2D(dx, dy) {
        const current = this.navElements[this.index];
        if (!current) return;

        let bestIdx = this.index;
        let minDist = Infinity;

        const cx = current.globalX + current.computedW / 2;
        const cy = current.globalY + current.computedH / 2;

        this.navElements.forEach((el, idx) => {
            if (idx === this.index) return;

            const ex = el.globalX + el.computedW / 2;
            const ey = el.globalY + el.computedH / 2;

            const distX = ex - cx;
            const distY = ey - cy;

            let valid = false;
            if (dx !== 0) {
                if (Math.abs(distY) < Math.max(current.computedH, el.computedH) && ((dx > 0 && distX > 0) || (dx < 0 && distX < 0))) {
                    valid = true;
                }
            } else if (dy !== 0) {
                if ((dy > 0 && distY > 0) || (dy < 0 && distY < 0)) valid = true;
            }

            if (valid) {
                // const dist = Math.abs(distX) * 2 + Math.abs(distY);
                const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
                if (dist < minDist) {
                    minDist = dist;
                    bestIdx = idx;
                }
            }
        });

        if (bestIdx !== this.index) {
            this.index = bestIdx;
            this.updateFocus();
        }
    }

    updateFocus() {
        this.navElements.forEach((el, i) => {
            el.setFocus(i === this.index);
        });
         super.computeLayout()
    }

    getNavigableElements(root) {
        let elements = [];
        if (root.isInteractive && root.action) elements.push(root);
        if (root.children) {
            root.children.forEach(ch => {
                elements = elements.concat(this.getNavigableElements(ch));
            });
        }
        return elements;
    }

    setHoverFocus(lx, ly) {
        for (let i = 0; i < this.navElements.length; i++) {
            const el = this.navElements[i];
            if (el.focusable && el.getHit && el.getHit(lx - this.x, ly - this.y)) {
                if (this.index !== i) {
                    this.index = i;
                    this.ensureValidFocus();
                    this.updateFocus();
                }
                return;
            }
        }
    }

    // executeActions(actions, dt) {
    //     for (const a of actions) {
    //
    //         if (a.action === ACTIONS.POINTER_MOVE) {
    //             if (a.captureTarget && this.dragElement) {
    //                 if (typeof this.dragElement.getValueAt === 'function') {
    //                     const val = this.dragElement.getValueAt(a.x);
    //                     this.interact({ action: this.dragElement.action, value: val, element: this.dragElement });
    //                 }
    //                 continue;
    //             }
    //
    //             if (!a.captureTarget) {
    //                 this.dragElement = null;
    //             }
    //
    //             const hit = this.getHit(a.x, a.y);
    //             if (hit && hit.element) {
    //                 const newIdx = this.navElements.findIndex(el => el === hit.element);
    //                 if (newIdx !== -1 && newIdx !== this.index) {
    //                     this.index = newIdx;
    //                     this.updateFocus();
    //                 }
    //             }
    //             continue;
    //         }
    //
    //         const isRepeatable = REPEATABLE_ACTIONS.has(a.action);
    //         const shouldTrigger = isRepeatable ? a.isPressed : a.justPressed;
    //
    //         if (!shouldTrigger) continue;
    //
    //         switch (a.action) {
    //             case ACTIONS.MOVE_UP:
    //                 this.navigate2D(0, -1);
    //                 break;
    //             case ACTIONS.MOVE_DOWN:
    //                 this.navigate2D(0, 1);
    //                 break;
    //             case ACTIONS.MOVE_LEFT:
    //             case ACTIONS.MOVE_RIGHT:
    //                 const currentLR = this.navElements[this.index];
    //                 const dir = (a.action === ACTIONS.MOVE_RIGHT) ? 1 : -1;
    //
    //                 if (currentLR && typeof currentLR.handleKey === 'function') {
    //                     currentLR.handleKey(dir, (resultInput) => {
    //                         this.interact(resultInput);
    //                     });
    //                 } else {
    //                     this.navigate2D(dir, 0);
    //                 }
    //                 break;
    //             case ACTIONS.CONFIRM:
    //                 const current = this.navElements[this.index];
    //                 if (current && current.action) {
    //                     this.interact({ action: current.action, element: current });
    //                 }
    //                 break;
    //             case ACTIONS.CANCEL:
    //                 this.interact({ action: "escape" });
    //                 break;
    //             case ACTIONS.POINTER_DOWN:
    //                 if (a.justPressed) {
    //                     const hit = this.getHit(a.x, a.y);
    //                     if (hit && hit.action) {
    //                         const newIdx = this.navElements.findIndex(el => el === hit.element);
    //                         if (newIdx !== -1) {
    //                             this.index = newIdx;
    //                             this.updateFocus();
    //                         }
    //                         this.dragElement = hit.element;
    //                         this.interact(hit);
    //                     } else {
    //                         this.dragElement = null;
    //                     }
    //                 } else {
    //                     if (a.captureTarget && this.dragElement) {
    //                         if (typeof this.dragElement.getValueAt === 'function') {
    //                             const val = this.dragElement.getValueAt(a.x);
    //                             this.interact({ action: this.dragElement.action, value: val, element: this.dragElement });
    //                         }
    //                     }
    //                 }
    //                     //     // handle click at a.x, a.y
    //                     // } else if (a.isPressed) {
    //                     //     // handle drag/hold
    //                     // }
    //                     // if (a.captureTarget) {
    //                     //     // Si algo esta capturando el mouse
    //                 break;
    //             default:
    //                 console.warn('Unhandled action: ', a.action);
    //         }
    //     }
    // }

    executeActions(actions, dt) {
        for (const a of actions) {

            if (a.action === ACTIONS.POINTER_MOVE) {
                if (a.captureTarget && typeof a.captureTarget.getValueAt === 'function') {
                    continue;
                }

                const hit = this.getHit(a.x, a.y);
                if (hit && hit.element) {
                    const newIdx = this.navElements.findIndex(el => el === hit.element);
                    if (newIdx !== -1 && newIdx !== this.index) {
                        this.index = newIdx;
                        this.updateFocus();
                    }
                }
                continue;
            }

            const isRepeatable = REPEATABLE_ACTIONS.has(a.action);
            const shouldTrigger = isRepeatable ? a.isPressed : a.justPressed;

            if (!shouldTrigger) continue;

            switch (a.action) {
                case ACTIONS.MOVE_UP:
                    this.navigate2D(0, -1);
                    break;
                case ACTIONS.MOVE_DOWN:
                    this.navigate2D(0, 1);
                    break;
                case ACTIONS.MOVE_LEFT:
                case ACTIONS.MOVE_RIGHT:
                    const currentLR = this.navElements[this.index];
                    const dir = (a.action === ACTIONS.MOVE_RIGHT) ? 1 : -1;

                    if (currentLR && typeof currentLR.handleKey === 'function') {
                        currentLR.handleKey(dir, (resultInput) => {
                            this.interact(resultInput);
                        });
                    } else {
                        this.navigate2D(dir, 0);
                    }
                    break;
                case ACTIONS.CONFIRM:
                    const current = this.navElements[this.index];
                    if (current && current.action) {
                        this.interact({ action: current.action, element: current });
                    }
                    break;
                case ACTIONS.CANCEL:
                    this.interact({ action: "escape" });
                    break;
                case ACTIONS.POINTER_DOWN:
                    if (a.justPressed) {
                        const hit = this.getHit(a.x, a.y);
                        if (hit && hit.action) {
                            const newIdx = this.navElements.findIndex(el => el === hit.element);
                            if (newIdx !== -1) {
                                this.index = newIdx;
                                this.updateFocus();
                            }
                            this.interact(hit);
                        }
                    }
                    break;
                default:
                    console.warn('Unhandled action: ', a.action);
            }
        }
    }

    computeLayout() {
        super.computeLayout();
        this.collectElements();
        this.ensureValidFocus();

        this.navElements.forEach(el => {
            if (typeof el.refreshTextLayout === 'function') {
                el.refreshTextLayout();
            }
        });
    }

    getActionAt(lx, ly) {
        for (let i = this.navElements.length - 1; i >= 0; i--) {
            const el = this.navElements[i];
            if (el.getHit && el.getHit(lx - this.x, ly - this.y)) {
                if (el.getActionAt) {
                    return el.getActionAt(lx - this.x, ly - this.y);
                } else if (el.action) {
                    return { action: el.action, element: el };
                }
            }
        }
        return null;
    }
}

