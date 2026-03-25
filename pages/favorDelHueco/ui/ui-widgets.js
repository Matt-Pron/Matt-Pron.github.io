import { UIElement } from "./ui-element.js";
import { CENTER } from "./ui-utils.js";

export class UIButton extends UIElement {
    constructor(id, label, action) {
        super(id);
        this.label = label;
        this.setAction(action);
        this.setContentAlignment(CENTER, CENTER);
        this.updateContent();
    }

    setFocus(focused = true) {
        super.setFocus(focused);
        this.updateContent();
        return this;
    }

    updateContent() {
        this.setContent(this.label);
    }

    draw(renderer) {
        super.draw(renderer);

        if (this.isFocused && this.textPositions && this.textPositions.length > 0) {
            const pos = this.textPositions[0];
            const labelLen = this.content.length;
            const fg = (this.focusFgColor !== undefined) ? this.focusFgColor : (this.fgColor || 1);
            const bold = true;

            renderer.addChar('[', pos.x - 1, pos.y, fg, bold);
            renderer.addChar(']', pos.x + labelLen, pos.y, fg, bold);
        }
    }
}

export class UISpinner extends UIElement {
    constructor(id, label, value, action, display = "") {
        super(id);
        this.label = label;
        this.value = value;
        this.setAction(action);
        this.display = display;
        this.horizontalAction = true;
        this.renderText = "";
        this.setContentAlignment(CENTER, CENTER);
        this.updateContent();
    }

    setFocus(focused = true) {
        super.setFocus(focused);
        this.updateContent();
        return this;
    }

    setValue(val) {
        this.value = val;
        this.updateContent();
        return this;
    }

    p_wrapText() {
        if (this.content) {
            this.lines = [this.content];
            this.contentH = 1;
            const p = this.padding || { t:0, l:0, b:0, r:0 };
            this.minH = Math.max(this.minH || 0, this.contentH + p.t + p.b);
        }
        this.children.forEach(ch => ch.p_wrapText());
    }

    refreshTextLayout() {
        if (this.parent || this.globalX !== undefined) {
            this.p_wrapText();
            this.p_position();
        }
    }

    updateContent() {
        this.calculateRenderData();
        this.setContent(this.isFocused ? `◄ ${this.renderText} ►` : `  ${this.renderText}  `);
        this.refreshTextLayout();
    }

    getHit(x, y) {
        const hit = super.getHit(x, y);
        if (!hit || hit.element !== this) return null;

        const textLen = this.content ? this.content.length : 0;
        const textX = (this.textPositions && this.textPositions.length > 0) ? this.textPositions[0].x : this.globalX;

        if (x >= textX && x < textX + textLen) {
            hit.dir = (x < textX + textLen / 2) ? -1 : 1;
            return hit;
        }

        return null;
    }

    calculateRenderData() {
        if (this.display === 'label') {
            this.renderText = this.label;
        } else if (this.display === 'value') {
            this.renderText = this.value;
        } else {
            this.renderText = `${this.label}: ${this.value}`;
        }

        const width = this.computedW || 20;

        if (this.renderText.length >= width - 4) {
            if (this.display !== 'label' && this.display !== 'value') {
                this.renderText = this.value;
            }
        }
        if (this.renderText.length >= width - 4) {
            this.renderText = this.renderText.substring(0, Math.max(0, width - 4));
        }
    }

    handleKey(dir, callback) {
        callback({
            action: this.action,
            dir: dir,
            element: this
        });
    }
}

export class UISlider extends UIElement {
    constructor(id, label, value, max, action, step = 5) {
        super(id);
        this.label = label;
        this.value = value;
        this.max = max;
        this.setAction(action);
        this.step = step;
        this.horizontalAction = true;
        this.isDragging = false;
        this.setContentAlignment(CENTER, CENTER);

        this.renderText = "";
        this.barLeftOffset = 0;
        this.calculatedBarW = 0;

        this.updateContent();
    }

    setFocus(focused = true) {
        super.setFocus(focused);
        this.updateContent();
        return this;
    }

    setValue(val) {
        this.value = Math.max(0, Math.min(this.max, val));
        this.updateContent();
        return this;
    }

    p_wrapText() {
        if (this.content) {
            this.lines = [this.content];
            this.contentH = 3;
            const p = this.padding || { t:0, l:0, b:0, r:0 };
            this.minH = Math.max(this.minH || 0, this.contentH + p.t + p.b);
        }
        this.children.forEach(ch => ch.p_wrapText());
    }

    p_fit(isWidth = true) {
        if (isWidth) this.minW = 0;
        super.p_fit(isWidth);
        if (isWidth) this.minW = 0;
    }

    refreshTextLayout() {
        if (this.parent || this.globalX !== undefined) {
            this.calculateRenderData();
            this.p_wrapText();
            this.p_position();
        }
    }

    handleKey(dir, callback) {
        let newVal = this.value + dir * this.step;
        newVal = Math.max(0, Math.min(this.max, newVal));
        callback({
            action: this.action,
            dir: dir,
            value: newVal,
            element: this
        });
    }

    updateContent() {
        this.calculateRenderData();
        this.setContent(this.renderText);
        this.refreshTextLayout();
    }
    
    calculateRenderData() {
        const width = this.computedW || 0;
        if (width === 0) return;

        const sep = ": ";
        const valStr = ` ${String(this.value).padStart(3, ' ')}%`;
        let labelTxt = this.label;
        let showPercent = true;

        const minBar = 8;

        if (labelTxt.length + sep.length + minBar + valStr.length > width) {
            const availableForLabel = width - sep.length - minBar - valStr.length;
            if (availableForLabel < 3) {
                labelTxt = labelTxt.substring(0, 3);
                showPercent = false;
            } else {
                labelTxt = labelTxt.substring(0, availableForLabel);
            }
        }

        let usedW = labelTxt.length + sep.length + (showPercent ? valStr.length : 0);

        if (usedW > width && showPercent) {
            showPercent = false;
            usedW = labelTxt.length + sep.length;
        }

        if (usedW > width) {
            const remaining = Math.max(0, width);
            const finalStr = (labelTxt + sep).substring(0, remaining);
            this.calculatedBarW = 0;
            this.barLeftOffset = finalStr.length;
            this.renderText = finalStr;
            this.setContent(this.renderText);
            return;
        }

        this.calculatedBarW = Math.max(0, width - usedW);
        
        let bar = "";
        if (this.calculatedBarW > 0) {
            const filledW = Math.round((this.value / this.max) * this.calculatedBarW);
            bar = "█".repeat(filledW) + "░".repeat(this.calculatedBarW - filledW);
        }

        this.renderText = labelTxt + sep + bar + (showPercent ? valStr : "");
        this.barLeftOffset = labelTxt.length + sep.length;
        this.setContent(this.renderText);
    }

    getHit(x, y) {
        const hit = super.getHit(x, y);
        if (hit && hit.element === this) {
            const textX = (this.textPositions && this.textPositions.length > 0) ? this.textPositions[0].x : this.globalX;
            const barAbsLeft = textX + this.barLeftOffset;
            const barAbsRight = barAbsLeft + this.calculatedBarW;

            if (x >= barAbsLeft && x < barAbsRight) {
                hit.value = this.getValueAt(x);
                return hit;
            }
        }
        return null;
    }

    getValueAt(x) {
        if (this.calculatedBarW <= 0) return this.value;

        const textX = (this.textPositions && this.textPositions.length > 0) ? this.textPositions[0].x : this.globalX;
        const barAbsLeft = textX + this.barLeftOffset;
        const barAbsRight = barAbsLeft + this.calculatedBarW - 1;

        const clampedLx = Math.max(barAbsLeft, Math.min(barAbsRight, x));
        const barPos = clampedLx - barAbsLeft;

        const percent = this.calculatedBarW > 1 ? barPos / (this.calculatedBarW - 1) : 0.5;
        return Math.round(percent * this.max);
    }
}

export class UITouchpad extends UIElement {
    constructor(id) {
        super(id);
        this.currentKey = null;
        this.setInteractive(true);
    }

    getHit(argX, argY, pxX, pxY, pxW, pxH) {
        const isCanvasMode = pxX !== undefined;
        const boundsX = isCanvasMode ? pxX : this.globalX;
        const boundsY = isCanvasMode ? pxY : this.globalY;
        const boundsW = isCanvasMode ? pxW : this.computedW;
        const boundsH = isCanvasMode ? pxH : this.computedH;

        const centerX = boundsX + (boundsW / 2);
        const centerY = boundsY + (boundsH / 2);

        const dx = argX - centerX;
        const dy = argY - centerY;

        const radius = Math.min(boundsW, boundsH) / 2;
        const distanceSq = (dx * dx) + (dy * dy);

        if (distanceSq > radius * radius) {
            return null;
        }

        let key = null;

        if (Math.abs(dx) > Math.abs(dy)) {
            key = (dx > 0) ? 'd' : 'a';
        } else {
            key = (dy > 0) ? 's' : 'w';
        }

        return {
            id: this.id,
            action: this.action,
            element: this,
            emulatedKey: key
        };
    }

    draw(renderer) {
        super.draw(renderer);
        const cx = Math.floor(this.globalX + this.computedW / 2);
        const cy = Math.floor(this.globalY + this.computedH / 2);
        renderer.addText("▲", cx, cy - 2, 4);
        renderer.addText("▼", cx, cy + 2, 4);
        renderer.addText("◄", cx - 3, cy, 4);
        renderer.addText("►", cx + 3, cy, 4);
    }
}

