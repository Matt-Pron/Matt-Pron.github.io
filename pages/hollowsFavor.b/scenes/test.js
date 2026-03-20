import { MenuViewport } from "./menuViewport.js";
import { UIButton, UIContainer, UIHBox, UILabel, UISlider, UISpacer, UISpinner, UIVBox } from "../ui/widgets.js";
import { Globals } from "../globals.js";

export class Test extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        // this.index = Globals.mainMenuLast || 4;
        this.index = 0;
        this.spinner = ["a", "b", "c", "d", "e"];
        this.spinnerId = 0;
        this.slider = 50;
        this.createUI();
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);

        this.menu = new UIVBox('fit', 'expand', 1)
            .setAlign("center", "center")
            .setBackground(true, 8);

        this.titleLabel = new UILabel("Test Menu")
            .setWeight(600)
            .setAlign("center")
            .setOffset(0, 1);

        this.speedSpinner = new UISpinner("Select", this.spinner[this.spinnerId], "test_spinner")
            .setSize('expand')
            .setBackground(true, 12);

        this.volumeSlider = new UISlider("Vol", this.slider, 100, "test_slider", 1)
            .setSize('expand', 2)
            .setOffset(0,1);

        this.exitBtn = new UIButton("EXIT", "exit")
            .setSize(6, 1)
            .setOffset(-1,0)
            .setAlign('right')
            .setBackground(true, 15);

        this.menu.add(this.titleLabel);
        this.menu.add(new UISpacer(0,2));
        this.menu.add(this.speedSpinner);
        this.menu.add(this.volumeSlider);

        this.row = new UIHBox('expand', 1, 1)
            .setOffset(1, 0)
            .setAlign("center")
            .setBackground(true, 7);

        this.rowY = new UIButton("Yes", "exit")
            .setSize('expand', 1)
            .setBackground(true, 15);

        this.rowN = new UIButton("No", "exit")
            .setSize(6, 1)
            .setBackground(true, 5);

        this.row.add(this.rowY);
        this.row.add(this.rowN);

        this.menu.add(this.row);

        this.menu.add(new UISpacer(0,3));
        this.menu.add(this.exitBtn);

        this.root.add(this.menu);

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);

        this.elements = this.getNavigableElements(this.root);
        this.onResize();
        this.updateFocus();
    }

    sync() { // Necesario si hay UI activable horizontal
        this.speedSpinner.value = this.spinner[this.spinnerId];
        this.volumeSlider.value = this.slider;

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);
    }

    onResize(newCols, newRows) {
        super.onResize(newCols, newRows - 1);
        this.sync();
    }

    // getNavigableElements(container) {
    //     let list = [];
    //     container.elements.forEach(el => {
    //         if (el instanceof UIContainer) {
    //             list = list.concat(this.getNavigableElements(el));
    //         } else if (el.focusable) {
    //             list.push(el);
    //         }
    //     });
    //     return list;
    // }

    navigate2D(dx, dy) {
        const current = this.elements[this.index];
        if (!current) return;

        let bestIdx = this.index;
        let minDist = Infinity;

        const cx = current.x + current.w / 2;
        const cy = current.y + current.h / 2;

        this.elements.forEach((el, idx) => {
            if (idx === this.index || !el.focusable) return;

            const ex = el.x + el.w / 2;
            const ey = el.y + el.h / 2;

            const distX = ex - cx;
            const distY = ey - cy;

            let valid = false;

            if (dx !== 0) {
                if (Math.abs(distY) <= Math.max(current.h, el.h) / 2) {
                    if ((dx > 0 && distX > 0) || (dx < 0 && distX < 0)) valid = true;
                }
            } else if (dy !== 0) {
                if ((dy > 0 && distY > 0) || (dy < 0 && distY < 0)) valid = true;
            }

            if (valid) {
                const dist = Math.abs(distX) * (dx !== 0 ? 1 : 10) + Math.abs(distY) * (dy !== 0 ? 1 : 10);
                if (dist < minDist) {
                    minDist = dist;
                    bestIdx = idx;
                }
            }
        });

        if (bestIdx !== this.index) {
            this.index = bestIdx;
            this.updateFocus();
            this.sync();
        }
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

    handleInput(data) {
        let action, payload = null;
        if (typeof data === "string") action = data;
        else { action = data.action; payload = data; }

        const current = this.elements[this.index];

        // Nav
        if (action ===  "move_up") return this.navigate2D(0, -1);
        if (action ===  "move_down") return this.navigate2D(0, 1);
        if (action === "move_left" || action === "move_right") {
            const dir = action === "move_right" ? 1 : -1;

            // Selection
            if (current && current.horizontalAction) {
                if (current?.handleKey) {
                    current.handleKey(dir, (act, payload) => {
                        if (act === "test_spinner") {
                            this.spinnerId = (this.spinnerId + payload + this.spinner.length) % this.spinner.length;
                        } else if (act === "test_slider") {
                            this.slider = payload;
                        }
                        this.sync();
                    });
                    return;
                }

            }
            return this.navigate2D(dir, 0);

        }

        // Execution
        if (action === "confirm") {
            this.applyChange(current.action);
            return;
        }

        if (action) {
            if (payload) {
                const idx = this.elements.findIndex(el => el.action === action);
                if (idx !== -1) {
                    this.index = idx;
                }

                if (action === "test_spinner") {
                    const dir = payload.dir || 0;
                    if (dir) {
                        this.spinnerId = (this.spinnerId + dir + this.spinner.length) % this.spinner.length;
                        this.sync();
                    }
                    return;
                }

                if (action === "test_slider") {
                    this.slider = payload.value;
                    this.sync();
                    return;
                }
            } else {
                this.applyChange(action);
            }
        }
    }

    handleKey(key, isDown) {
        if (!isDown) return;

        const action = Globals.hotkeys[key];
        const current = this.elements[this.index];

        if (action === "move_left" || action === "move_right") {
            const dir = action === "move_right" ? 1 : -1;
            
            if (current?.handleKey) {
                current.handleKey(dir, (act, val) => this.applyChange(act, val));
                return;
            }
            
            this.navigate2D(dir, 0);
            return;
        }

        if (action === "move_up" || action === "move_down") {
            const dir = action === "move_down" ? 1 : -1;
            this.navigate2D(0, dir);
            return;
        }

        if (action === "confirm") {
            this.applyChange(current.action);
            return;
        }
    }

    applyChange(action) {
        if (action ===  "test_button");
        this.sync();
    }
}

