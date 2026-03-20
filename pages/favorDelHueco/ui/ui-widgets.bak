import { UIElement } from "./ui-elements.js";
import { ALIGN } from "./ui-utils.js";

// --- BUTTON ---
export class UIButton extends UIElement {
    constructor(id, text) {
        super(id);
        this.rawText = text;
        this.setInteractive(true);
        this.setAlignment(ALIGN.HORIZONTAL.CENTER, ALIGN.VERTICAL.CENTER);
        this.updateContent();
    }

    // Override setFocus to add the [ ] brackets dynamically
    setFocus(focused = true) {
        super.setFocus(focused);
        this.updateContent();
        return this;
    }

    updateContent() {
        // Mimics your old Button logic from widgets.js
        this.setContent(this.isFocused ? `[ ${this.rawText} ]` : `  ${this.rawText}  `);
    }
}

// --- SPINNER ---
export class UISpinner extends UIElement {
    constructor(id, options) {
        super(id);
        this.options = options;
        this.selectedIndex = 0;
        this.setInteractive(true);
        this.setAlignment(ALIGN.HORIZONTAL.CENTER, ALIGN.VERTICAL.CENTER);
        this.updateContent();
    }

    setFocus(focused = true) {
        super.setFocus(focused);
        this.updateContent();
        return this;
    }

    updateContent() {
        // Mimics the < text > look from old widgets.js
        const text = `< ${this.options[this.selectedIndex]} >`;
        this.setContent(this.isFocused ? `[${text}]` : ` ${text} `);
    }

    getHit(x, y) {
        const hit = super.getHit(x, y);
        if (hit && hit.element === this) {
            // Split click logic: Left half = Previous, Right half = Next
            const localX = x - this.globalX;
            if (localX < this.computedW / 2) {
                this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            } else {
                this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            }

            this.updateContent();
            hit.value = this.options[this.selectedIndex];
        }
        return hit;
    }
}

// --- SLIDER ---
export class UISlider extends UIElement {
    constructor(id, min = 0, max = 100, value = 50) {
        super(id);
        this.min = min;
        this.max = max;
        this.value = value;
        this.setInteractive(true);
        // We ensure it has enough height to draw a line of text
        this.setContent(" "); 
    }

    getHit(x, y) {
        const hit = super.getHit(x, y);
        if (hit && hit.element === this) {
            const p = this.padding || { l: 0, r: 0 };
            const innerW = this.computedW - p.l - p.r;

            // Calculate value based on where they clicked inside the padded area
            const localX = Math.max(0, Math.min(x - this.globalX - p.l, innerW - 1));
            const percent = innerW > 1 ? localX / (innerW - 1) : 0;

            this.value = Math.round(percent * (this.max - this.min) + this.min);
            hit.value = this.value;
        }
        return hit;
    }

    // Override draw to custom render the [###---] bar
    draw(renderer) {
        // Draw the standard background
        const bg = this.isFocused && this.focusBgColor ? this.focusBgColor : this.bgColor;
        if (bg !== undefined && bg !== null) {
            renderer.drawRect(this.globalX, this.globalY, this.computedW, this.computedH, bg);
        }

        const p = this.padding || { t: 0, l: 0, b: 0, r: 0 };
        const innerW = Math.floor(this.computedW - p.l - p.r);

        if (innerW >= 2) {
            // Replicate the exact visual logic from old widgets.js Slider
            const availableBarSpaces = innerW - 2; // -2 for the brackets
            const fillWidth = Math.round(((this.value - this.min) / (this.max - this.min)) * availableBarSpaces);

            let barString = '';
            if (this.isFocused) {
                barString = '[' + '#'.repeat(fillWidth) + '-'.repeat(availableBarSpaces - fillWidth) + ']';
            } else {
                barString = ' ' + '#'.repeat(fillWidth) + '-'.repeat(availableBarSpaces - fillWidth) + ' ';
            }

            // Apply vertical alignment to the bar
            const vAlign = this.alignment?.v || 0;
            let offsetY = 0;
            if (vAlign === 1) offsetY = Math.floor((this.computedH - p.t - p.b - 1) / 2);
            else if (vAlign === 2) offsetY = this.computedH - p.t - p.b - 1;

            const fg = this.isFocused && this.focusFgColor ? this.focusFgColor : (this.fgColor || '#000');
            renderer.drawText(barString, this.globalX + p.l, this.globalY + p.t + offsetY, fg);
        }

        // Draw children (if any were added to the slider)
        this.children.forEach(ch => ch.draw(renderer));
    }
}

