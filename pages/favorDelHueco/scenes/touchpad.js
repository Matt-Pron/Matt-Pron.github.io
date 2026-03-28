import { UIElement } from "../ui/ui-element.js";
import { Viewport } from "./viewport.js";
import { UITouchpad, UIButton } from "../ui/ui-widgets.js";
import { Input } from "../input.js";
import { Globals } from "../globals.js";
import { BOTTOM, CENTER, RIGHT, TOP, GROW, FIT, HORIZONTAL } from "../ui/ui-utils.js";
import { eventBus } from "../eventBus.js";

class Touchpad extends Viewport {
    constructor() {
        super();

        this.pad = new UITouchpad('Touchpad')
            .setSize(13,9)
            .setAction('touchpad');

        this.setSize(Globals.cols, Globals.rows)
            // .setPadding(0,0,1,0)
            .setPadding(1)
            .setAlignment(CENTER, BOTTOM)
            .add(
                new UIElement('Virtual keyboard')
                    .setSize(GROW, FIT)
                    .setFlow(HORIZONTAL)
                    .setGap(1)
                    .setAlignment(CENTER, TOP)
                    .add(
                        new UIButton('Menu', 'X', 'menu')
                            .setSize(3, 3)
                            .setBackground(0)
                            .setColor(4)
                            .setBorderLine(4)
                    )
                    // .add(
                    //     new UIButton('Target', 'Q', 'target')
                    //         .setSize(3, 3)
                    //         .setBackground(0)
                    //         .setColor(4)
                    //         .setBorderLine(4)
                    // )
                    .add(
                        new UIButton('Confirm', 'E', 'confirm')
                            .setSize(3, 3)
                            .setBackground(0)
                            .setColor(4)
                            .setBorderLine(4)
                    )
                    .add(
                        new UIButton('Extra', 'R', 'extra')
                            .setSize(3, 3)
                            .setBackground(0)
                            .setColor(4)
                            .setBorderLine(4)
                    )
                    .add(new UIElement('space').setSize(GROW, FIT))
                    .add(
                        this.pad
                        .setColor(4)
                        // .setBackground(0)
                        // .setBorderLine(4)
                    )
            );

        // this.pad.computeLayout();
        this.computeLayout();
        this.activeEmulatedKey = null;
        this.active = false;
    }

    onResize(newCols, newRows) {
        this.setSize(newCols, newRows);
        this.computeLayout();
    }

    processInput(pointer) {
        if (!this.active) return false;

        let currentEmulatedKey = null;
        let hitTouchpad = false;

        if (pointer.isDown) {
            const cellW = pointer.canvasW / Globals.cols;
            const cellH = pointer.canvasH / Globals.rows;

            const pxX = this.pad.globalX * cellW;
            const pxY = this.pad.globalY * cellH;
            const pxW = this.pad.computedW * cellW;
            const pxH = this.pad.computedH * cellH;

            const padHit = this.pad.getHit(pointer.canvasX, pointer.canvasY, pxX, pxY, pxW, pxH);

            if (padHit && padHit.emulatedKey) {
                currentEmulatedKey = padHit.emulatedKey;
                hitTouchpad = true;
            }

            if (!padHit) {
                const uiHit = this.getHit(pointer.x, pointer.y);
                if (uiHit && uiHit.action) {
                    const actionToKey = {
                        'menu': 'escape', // and the rest of the buttons
                        'confirm': 'e',
                        'extra': 'r',
                    };
                    currentEmulatedKey = actionToKey[uiHit.action];
                    hitTouchpad = true;
                }
            }
        }

        if (currentEmulatedKey) {
            eventBus.emit("touchpad_isDown");

            if (this.activeEmulatedKey !== currentEmulatedKey) {
                if (this.activeEmulatedKey) {
                    Input.handleKey({ key: this.activeEmulatedKey }, false);
                }
                this.activeEmulatedKey = currentEmulatedKey;
                Input.handleKey({ key: this.activeEmulatedKey }, true);
            }

        } else if (this.activeEmulatedKey) {
            Input.handleKey({ key: this.activeEmulatedKey }, false);
            this.activeEmulatedKey = null;
        }

        return hitTouchpad;
    }

    draw(renderer) {
        if (!this.active) return;
        super.draw(renderer);
    }
}

export const TouchpadUI = new Touchpad();

