import { UIElement } from "../ui/ui-element.js";
import { Viewport } from "./viewport.js";
import { UITouchpad } from "../ui/ui-widgets.js";
import { Input } from "../input.js";
import { Globals } from "../globals.js";
import { BOTTOM, RIGHT } from "../ui/ui-utils.js";
import { eventBus } from "../eventBus.js";

class Touchpad extends Viewport {
    constructor() {
        super();

        this.pad = new UITouchpad('Touchpad')
            .setSize(7,5)
            .setAction('touchpad');

        this.setSize(Globals.cols, Globals.rows)
            .setPadding(1)
            .setAlignment(RIGHT, BOTTOM)
            .add(this.pad);

        // this.pad.computeLayout();
        this.computeLayout();
        this.activeEmulatedKey = null;
        this.active = false;
    }

    processInput(pointer) {
        if (!this.active) return false;

        if (pointer.isDown) {
            const hit = this.pad.getHit(pointer.x, pointer.y);

            if (hit && hit.emulatedKey) {
                eventBus.emit("touchpad_isDown");
                if (this.activeEmulatedKey && this.activeEmulatedKey !== hit.emulatedKey) {
                    Input.handleKey({ key: this.activeEmulatedKey }, false);
                }
                this.activeEmulatedKey = hit.emulatedKey;
                Input.handleKey({ key: this.activeEmulatedKey }, true);

                return true;
            } else if (this.activeEmulatedKey) {
                Input.handleKey({ key: this.activeEmulatedKey }, false);
                this.activeEmulatedKey = null;
            }
        } else if (this.activeEmulatedKey) {
            Input.handleKey({ key: this.activeEmulatedKey }, false);
            this.activeEmulatedKey = null;
        }

        return null;
    }

    draw(renderer) {
        if (!this.active) return;
        this.pad.draw(renderer);
    }
}

export const TouchpadUI = new Touchpad();

