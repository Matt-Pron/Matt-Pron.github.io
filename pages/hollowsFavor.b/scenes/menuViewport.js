import { Globals } from "../globals.js";
import { UIContainer, UIVBox } from "../ui/widgets.js";
import { Viewport } from "../viewport.js";

export class MenuViewport extends Viewport {
    constructor(x = 0, y = 0, w = Globals.cols || 6, h = Globals.rows || 6, z = 0, c = 0) {
        super(x, y, w, h, z);
        this.index = 0;
        this.elements = [];
        this.c = c;
        // this.createUI();
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);
        this.menu = new UIVBox()
            .setSize('fit', 'fit')
            .setAlign("center", "center")
            .setBackground(true, 8);

        this.root.add(this.menu);
        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);
        this.elements = this.getNavigableElements(this.root);
    }

    ensureValidFocus() {
        if (this.elements.length === 0) return;
        const start = this.index;
        while (!this.elements[this.index].focusable) {
            this.index = (this.index + 1) % this.elements.length;
            if (this.index === start) break;
        }
        this.updateFocus();
    }

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
                // if (Math.abs(distY) <= Math.max(current.h, el.h) / 2) {
                //     if ((dx > 0 && distX > 0) || (dx < 0 && distX < 0)) valid = true;
                // }
                if (Math.abs(distY) < Math.max(current.h, el.h) && ((dx > 0 && distX > 0) || (dx < 0 && distX < 0))) {
                    valid = true;
                }
            } else if (dy !== 0) {
                if ((dy > 0 && distY > 0) || (dy < 0 && distY < 0)) valid = true;
            }

            if (valid) {
                // const dist = Math.abs(distX) * (dx !== 0 ? 1 : 10) + Math.abs(distY) * (dy !== 0 ? 1 : 10);
                const dist = Math.abs(distX) * 2 + Math.abs(distY);
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

    updateFocus() {
        this.elements.forEach((el, i) => {
            if (el.setFocus) el.setFocus(i === this.index);
        });
    }

    getNavigableElements(root) {
        let elements = [];
        if (root.focusable) elements.push(root);
        if (root.elements) {
            root.elements.forEach(el => {
                elements = elements.concat(this.getNavigableElements(el));
            });
        }
        return elements;
    }

    getActionAt(lx, ly) {
        if (this.root) return this.root.getActionAt(lx, ly);
        return null;
    }

    setHoverFocus(lx, ly) {
        for (let i = 0; i < this.elements.length; i++) {
            const el = this.elements[i];
            if (el.focusable && el.isHit(lx, ly)) {
                if (this.index !== i) {
                    this.index = i;
                    this.updateFocus();
                }
                return;
            }
        }
    }

    // handleKey(key, isDown) {
    //     if (!isDown) return;
    //     const action = Globals.hotkeys[key];
    //     if (action) this.handleInput({ action: action });
    // }

    handleInput(input) {
        const current = this.elements[this.index];

        // Vertical Navigation
        if (input.action ===  "move_up") return this.navigate2D(0, -1);
        if (input.action ===  "move_down") return this.navigate2D(0, 1);
        
        // Side Navigation
        if (input.action === "move_left" || input.action === "move_right") {
            // const navDir = input.action === "move_right" ? 1 : -1;
            input.dir = input.dir === undefined ? (input.action === "move_right" ? 1 : -1) : input.dir;

            if (current?.handleKey) {
                current.handleKey(input.dir, (resultInput) => {
                    this.interact(resultInput);
                    // this.interact({
                    //     action: inputObj,
                    //     dir: input.dir,
                    //     value: input.value,
                    //     element: (input.element || this)
                    // });
                });
                return;
            }
            return this.navigate2D(input.dir, 0);
        }

        // Confirm
        if (input.action === "confirm") {
            if (current?.action) {
                this.interact({
                    action: current.action,
                    dir: input.dir,
                    value: input.value,
                    element: (input.element || this)
                });
            }
            return;
        }

        // Mouse
        this.interact({
            action: current.action,
            dir: input.dir,
            value: input.value,
            element: (input.element || this)
        });
    }

    drawContent(renderer) {
        renderer.addLocalRect(0, 0, this.width, this.height, this.c);

        if (this.root) this.root.draw(renderer);
    }

    sync() {
        this.root?.measure();
        this.root?.layout(0, 0, this.width, this.height);
    }

    onResize(newCols, newRows) {
        super.onResize(newCols, newRows);
        this.sync();
        if (this.root) {
            this.root.setSize(this.width, this.height);
            this.root.measure();
            this.root.layout(0, 0, this.width, this.height);
        }
    }

    interact(input) {
    }
}

