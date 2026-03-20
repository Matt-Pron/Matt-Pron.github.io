import { MenuViewport } from "./menuViewport.js";
import { UIButton, UILabel, UISlider, UISpacer, UISpinner } from "../ui/widgets.js";
import { Globals } from "../globals.js";

export class Touchpad2 extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        // this.index = Globals.mainMenuLast || 4;
        this.index = 2;
        this.spinner = ["a", "b", "c", "d", "e"];
        this.spinnerId = 0;
        this.slider = 50;
        this.build();
    }

    build() {
        this.elements = [
            // label: text, color
            new UILabel("Touchpad"),
            // Btn: text, action
            new UIButton("W", "move_up"),
            new UIButton("A", "move_left"),
            new UIButton("S", "move_down"),
            new UIButton("D", "move_right"),
        ];
        this.layoutElements();
    }

    layoutElements() {
        let currentY = 0;
        this.elements.forEach(el => {
            el.y = currentY;
            if (typeof el.measure === "function") el.measure(this.width);
            currentY += el.h || 1;
        });
        this.ensureValidFocus();
    }

    onResize(newCols, newRows) {
        this.width = newCols - this.x * 2;
        this.height = newRows - this.y * 2;
        this.build();
    }

    handleInput(data) {
        let action, payload = null;
        if (typeof data === "string") action = data;
        else { action = data.action; payload = data; }
        if (payload) console.log(payload);

        const current = this.elements[this.index];

        // Nav
        if (action ===  "move_up") return this.navigate(-1);
        if (action ===  "move_down") return this.navigate(1);

        // Selection
        if (action ===  "move_left" || action ===  "move_right") {
            const dir = action === "move_right" ? 1 : -1;

            if (current.action === "test_spinner") {
                this.spinnerId = (this.spinnerId + dir + this.spinner.length) % this.spinner.length;
                console.log("spinner " + this.spinner[this.spinnerId]);
                this.build();
                return;
            }

            if (current.action === "test_slider") {
                this.slider = Math.max(0, Math.min(100, this.slider + dir * 10));
                console.log("slider " + this.slider);
                this.build();
                return;
            }
            return;
        }
       
        // Execution
        if (action === "confirm") {
            this.applyChange(current.action);
            return;
        }

        if (action) {
            if (payload) {
                const idx = this.elements.findIndex(el => el.action === action);
                if (idx !== -1) { this.index = idx; this.updateFocus(); }

                if (action === "test_spinner") {
                    const dir = payload.dir || 0;
                    if (dir) {
                        this.spinnerId = (this.spinnerId + dir + this.spinner.length) % this.spinner.length;
                        console.log("spinner " + this.spinner[this.spinnerId]);
                        this.build();
                    }
                    return;
                }

                if (action === "test_slider") {
                    const newVal = payload.value !== undefined ? payload.value : this.slider + (payload.dir || 0) * 10;
                this.slider = Math.max(0, Math.min(100, newVal));
                console.log("slider " + this.slider);
                    this.build();
                    return;
                }
            } else {
                this.applyChange(action);
            }
        }
    }

    applyChange(action) {
        if (action ===  "test_button") { this.build(); console.log("button"); }
        this.build();
    }
}


