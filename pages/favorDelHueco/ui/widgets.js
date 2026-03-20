const C_FOCUS = 1;
const C_TITLE = 13;
const C_OPTION = 3;

export class UIElement {
    constructor(action = null) {
        this.x = 0; this.y = 0;
        this.w = 1; this.h = 1;
        this.prefW = 1;
        this.prefH = 1;

        this.action = action;
        this.focused = false;
        this.focusable = true;

        this.alignX = 'left';
        this.alignY = 'top';
        this.offsetX = 0;
        this.offsetY = 0;

        this.marginL = 0;
        this.marginR = 0;
        this.marginT = 0;
        this.marginB = 0;

        this.expandW = false;
        this.expandH = false;
        this.autofitW = false;
        this.autofitH = false;

        this.showBg = false;
        this.bgColor = 0;
    }

    setSize(w, h = null) {
        if (typeof w === "string") {
            if (w === "expand") {
                this.expandW = true;
                this.autofitW = false;
            } else if (w === "fit") {
                this.autofitW = true;
                this.expandW = false;
            }
        } else if (typeof w === "number") {
            this.prefW = w;
            this.expandW = false;
            this.autofitW = false;
        }

        if (h !== null) {
            if (typeof h === "string") {
                if (h === "expand") {
                    this.expandH = true;
                    this.autofitH = false;
                } else if (h === "fit") {
                    this.autofitH = true;
                    this.expandH = false;
                }
            } else if (typeof h === "number") {
                this.prefH = h;
                this.expandH = false;
                this.autofitH = false;
            }
        }
        return this;
    }

    setMargin(top, right = top, bottom = top, left = right) {
        this.marginT = top;
        this.marginR = right;
        this.marginB = bottom;
        this.marginL = left;
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    setAlign(xAlign, yAlign = "top") {
        this.alignX = xAlign;
        this.alignY = yAlign;
        return this;
    }

    setOffset(x, y) {
        this.offsetX = x;
        this.offsetY = y;
        return this;
    }

    setBackground(show, color = 0) {
        this.showBg = show;
        this.bgColor = color;
        return this;
    }

    getOuterW() { return this.prefW + this.marginL + this.marginR; }
    getOuterH() { return this.prefH + this.marginT + this.marginB; }

    layout(parentX, parentY, parentW, parentH) {
        const innerW = parentW - this.marginL - this.marginR;
        const innerH = parentH - this.marginT - this.marginB;
        const startX = parentX + this.marginL;
        const startY = parentY + this.marginT;

        if (this.expandW) {
            this.x = startX + this.offsetX;
            this.w = innerW - (this.offsetX * 2);
        } else {
            if (this.alignX === "center") this.x = startX + Math.floor((innerW - this.prefW) / 2);
            else if (this.alignX === "right") this.x = startX + innerW - this.prefW;
            else this.x = startX;
            
            this.x += this.offsetX;
            this.w = this.prefW;
        }

        if (this.expandH) {
            this.y = startY + this.offsetY;
            this.h = innerH - (this.offsetY * 2);
        } else {
            if (this.alignY === "center") this.y = startY + Math.floor((innerH - this.prefH) / 2);
            else if (this.alignY === "bottom") this.y = startY + innerH - this.prefH;
            else this.y = startY;

            this.y += this.offsetY;
            this.h = this.prefH;
        }
    }

    isHit(lx, ly) {
        return lx >= this.x && lx < this.x + this.w &&
               ly >= this.y && ly < this.y + this.h;
    }

    getActionAt(lx, ly) { return null; }

    draw(renderer) {
        if (this.showBg) {
            renderer.addLocalRect(this.x, this.y, this.w, this.h, this.bgColor);
        }

        renderer.markDirty(this.x, this.y, this.w, this.h);
    }

    setFocus(val) { this.focused = val; }

    measure() {}
}

export class UIContainer extends UIElement {
    constructor() {
        super();
        this.elements = [];
        this.spacing = 0;
        this.focusable = false;
    }

    add(element) {
        this.elements.push(element);
        return this;
    }

    measure() {
        this.elements.forEach(el => el.measure?.());

        let maxW = 0;
        let maxH = 0;

        this.elements.forEach(el => {
            const childW = (el.offsetX || 0) + el.getOuterW();
            const childH = (el.offsetY || 0) + el.getOuterH();

            if (childW > maxW) maxW = childW;
            if (childH > maxH) maxH = childH;
        });

        if (this.autofitW) this.prefW = maxW;
        if (this.autofitH) this.prefH = maxH;
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);
        this.layoutChildren();
    }

    layoutChildren() {
        this.elements.forEach(el => {
            // if (el instanceof UIContainer) {
                el.layout(this.x, this.y, this.w, this.h);
            // }
        });
    }

    getActionAt(lx, ly) {
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const action = this.elements[i].getActionAt(lx, ly);
            if (action) return action;
        }
        return null;
    }

    draw(renderer) {
        super.draw(renderer);
        this.elements.forEach(el => el.draw?.(renderer));
    }
}

export class UIVBox extends UIContainer {
    constructor(w = 1, h = 1, spacing = 0) {
        super();
        this.setSize(w, h);
        this.spacing = spacing;
    }

    measure() {
        this.elements.forEach(el => {
            if (typeof el.measure === 'function') el.measure();
        });

        let totalH = 0;
        let maxW = 0;

        this.elements.forEach(el => {
            totalH += el.getOuterH() + (el.offsetY || 0);
            maxW = Math.max(maxW, el.getOuterW() + (el.offsetX || 0));
        });

        if (this.elements.length > 1) totalH += (this.elements.length - 1) * (this.spacing || 0);

        if (this.autofitW) this.prefW = maxW;
        if (this.autofitH) this.prefH = totalH;
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);

        let totalFixedHeight = (this.elements.length - 1) * this.spacing;
        let expandCount = 0;
        this.elements.forEach(el => {
            if (el.expandH) expandCount++;
            else totalFixedHeight += el.getOuterH() + el.offsetY;
        });

        const availableSpace = Math.max(0, this.h - totalFixedHeight);
        const spacePerExpand = expandCount ? Math.floor(availableSpace / expandCount) : 0;
        // const remainder = availableSpace % expandCount;


        let currentY = 0;
        this.elements.forEach(el => {
            const allottedHeight = el.expandH ? spacePerExpand : el.getOuterH();

            el.layout(this.x, this.y + currentY, this.w, allottedHeight);

            currentY += allottedHeight + this.spacing + el.offsetY; 
        });
    }
}

export class UIHBox extends UIContainer {
    constructor(w = 1, h = 1, spacing = 0) {
        super();
        this.setSize(w, h);
        this.spacing = spacing;
    }

    measure() {
        super.measure();

        if (this.autofitW || this.autofitH) {
            let totalW = this.elements.length ? (this.elements.length - 1) * this.spacing : 0;
            let maxH = 0;

            this.elements.forEach(el => {
                if (!el.expandW) totalW += el.getOuterW() + el.offsetX;
                if (!el.expandH) maxH = Math.max(maxH, (el.getOuterH() + el.offsetY));
            });

            if (this.autofitW) this.prefW = totalW;
            if (this.autofitH) this.prefH = maxH;
        }
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);

        let totalFixedWidth = (this.elements.length - 1) * this.spacing;
        let expandCount = 0;
        this.elements.forEach(el => {
            if (el.expandW) expandCount++;
            else totalFixedWidth += el.getOuterW() + el.offsetX;
        });

        const availableSpace = Math.max(0, this.w - totalFixedWidth);
        const spacePerExpand = expandCount ? Math.floor(availableSpace / expandCount) : 0;
        // const remainder = availableSpace % expandCount;


        let currentX = 0;
        this.elements.forEach(el => {
            const allottedWidth = el.expandW ? spacePerExpand : el.getOuterW();

            el.layout(this.x + currentX, this.y, allottedWidth, this.h);

            currentX += allottedWidth + this.spacing + el.offsetX;
        });
    }
}

export class UIScrollBox extends UIContainer {
    constructor(scrollDir = 'vertical') {
        super();
        this.scrollOffset = 0;
        this.scrollDir = scrollDir;
        this.contentW = 0;
        this.contentH = 0;
        this.focusable = true;
    }

    measure() {
        super.measure();
        this.elements.forEach(el => el.measure());
        this.contentH = this.elements.reduce((sum, el) => sum + el.prefH, 0);
        this.contentW = this.elements.reduce((sum, el) => sum + el.prefW, 0);
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);

        let curY = -this.scrollOffset;
        this.elements.forEach(el => {
            el.layout(this.x, this.y + curY, this.w, el.prefH);
            curY += el.h;
        });
    }

    handleInput(input) {
        if (input.action === 'move_up' && this.scrollDir === 'vertical') {
            this.scrollOffset = Math.max(0, this.scrollOffset - 1);
            this.sync();
        } else if (input.action === 'move_down' && this.scrollDir === 'vertical') {
            this.scrollOffset = Math.min(this.contentH - this.h, this.scrollOffset + 1);
            this.sync();
        }

        if (input.action === 'drag_move') {
            this.scrollOffset -= input.dy;
            this.sync();
        }
    }

    draw(renderer) {
        super.draw(renderer);

        renderer.addClip(this.x, this.y, this.w, this.h);

        this.elements.forEach(el => el.draw(renderer));

        renderer.removeClip();
    }
}

export class UISpacer extends UIElement {
    constructor(w = 0, h = 0) {
        super();
        this.prefW = w;
        this.prefH = h;
        this.focusable = false;
    }

    getActionAt(lx, ly) { return null }

    measure() {}
    draw() {}
}

export class UILabel extends UIElement {
    constructor(text, color = C_TITLE, bold = false, italic = false) {
        super();
        this.text = text;
        this.color = color;
        this.focusable = false;
        this.bold = bold;
        this.italic = italic;
        this.counter = 0;
    }

    setFont (b = "", i = "") {
        this.bold = b === 'bold';
        this.italic = i === 'italic';
        return this;
    }

    setColor (color) {
        this.color = color;
        return this;
    }

    measure() {
        this.prefW = this.text.length;
        this.prefH = 1;
    }

    getActionAt(lx, ly) { return null }

    draw(renderer) {
        super.draw(renderer);

        const startX = this.x + Math.floor((this.w - this.text.length) / 2);

        for (let i = 0; i < this.text.length; i++) {
            renderer.addLocalChar(this.text[i], startX + i, this.y, this.color, this.bold, this.italic);
        }

        renderer.markDirty(startX, this.y, this.w, this.h);
    }
}

export class UIParagraph extends UIElement {
    constructor(text, color = 1, alignment = "left") {
        super();
        this.text = text;
        this.color = color;
        this.alignment = alignment;
        this.lines = [];
        this.focusable = false;
    }

    measure() {
        this.lines = this.wrapText(this.text, this.prefW);
        this.prefH = this.lines.length;
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (testLine.length <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    draw(renderer) {
        super.draw(renderer);

        this.lines.forEach((line, i) => {
            let startX = this.x;
            if (this.alignment === 'center') startX += Math.floor((this.w - line.length) / 2);
            else if (this.alignment === 'right') startX += this.w - line.length;

            for (let j = 0; j < line.length; j++) {
                renderer.addLocalChar(line[j], startX + j, this.y + i, this.color, false, false);
            }
        });

        renderer.markDirty(this.x, this.y, this.w, this.lines.length);
    }
}

export class UIButton extends UIElement {
    constructor(label, action) {
        super(action);
        this.label = label;
    }

    measure() {
        const normal = ` ${this.label} `.length;
        const focused = `[${this.label}]`.length;
        this.prefW = Math.max(Math.max(normal, focused), this.prefW);
        this.prefH = 1;
    }

    getActionAt(lx, ly) {
        return this.isHit(lx, ly) ? { action: this.action, element: this } : null;
    }

    draw(renderer) {
        super.draw(renderer);

        const color = this.focused ? C_FOCUS : C_OPTION;
        const text = this.focused ? `[${this.label}]` : ` ${this.label} `;

        const startX = this.x + Math.floor((this.w - text.length) / 2);

        for (let i = 0; i < text.length; i++) {
            renderer.addLocalChar(text[i], startX + i, this.y, color, this.focused, false);
        }

        renderer.markDirty(startX, this.y, this.w, this.h);
    }
}

export class UISpinner extends UIElement {
    constructor(label, value, action, display = "") {
        super(action);
        this.label = label;
        this.value = value;
        this.display = display;
        this.horizontalAction = true;
        this.renderText = "";
    }

    measure() {
        this.calculateRenderData();
        this.prefW = `◄ ${this.renderText} ►`.length;
        // if (this.display === 'label') {
        //     this.prefW = `◄ ${this.label} ►`.length;
        // } else if (this.display === 'value') {
        //     this.prefW = `◄ ${this.value} ►`.length;
        // }
        this.prefH = 1;
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);
        this.calculateRenderData();
    }

    calculateRenderData() {
        if (this.display === 'label') {
            this.renderText = this.label;
        } else if (this.display === 'value') {
            this.renderText = this.value;
        } else {
            this.renderText = `${this.label}: ${this.value}`;
        }

        if (this.renderText.length >= this.w - 4) {
            if (this.display !== 'label' && this.display !== 'value') {
                this.renderText = this.value;
            }
        }
        if (this.renderText.length >= this.w - 4) {
            this.renderText = this.renderText.substring(0, Math.max(0, this.w - 4));
        }
    }

    handleKey(dir, callback) {
        // callback(this.action, dir);
        callback({
            action: this.action,
            dir: dir,
            element: this
        });
    }

    getActionAt(lx, ly) {
        if (!this.isHit(lx, ly)) return null;

        return {
            action: this.action,
            dir: (lx - this.x < this.w / 2) ? -1 : 1,
            element: this
        };
    }

    draw(renderer) {
        super.draw(renderer);

        const color = this.focused ? C_FOCUS : C_OPTION;
        let text = this.renderText;
        if (this.focused) text = `◄ ${this.renderText} ►`;
        else text = `  ${this.renderText}  `;

        const startX = this.x + Math.floor((this.w - text.length) / 2);

        for (let i = 0; i < text.length; i++) {
            renderer.addLocalChar(text[i], startX + i, this.y, color, this.focused, false);
        }

        renderer.markDirty(startX, this.y, this.w, this.h);
    }
}

export class UISlider extends UIElement {
    constructor(label, value, max, action, step = 5) {
        super(action);
        this.label = label;
        this.value = value;
        this.max = max;
        this.step = step;
        this.horizontalAction = true;
        this.isDragging = false;

        this.renderText = "";
        this.barLeftOffset = 0;
        this.calculatedBarW = 0;
    }

    measure() {
        const maxValStr = String(this.max).padStart(3, ' ');
        const text = `${this.renderText} ${"█".repeat(this.calculatedBarW)} ${maxValStr}%`;
        this.prefW = text.length;
        this.prefH = this.prefH || 1;
        this.calculateRenderData();
    }

    layout(parentX, parentY, parentW, parentH) {
        super.layout(parentX, parentY, parentW, parentH);
        this.calculateRenderData();
    }

    calculateRenderData() {
        const valStr = ` ${String(this.value).padStart(3, ' ')}%`;
        const sep = ": ";
        let labelTxt = this.label;
        let showPercent = true;

        if (labelTxt.length + sep.length + 5 > this.w / 2) {
            labelTxt = labelTxt.slice(0, Math.max(3, Math.min((this.w - 1) / 4, labelTxt.length)));
        }

        if (labelTxt.length === 3) showPercent = false;

        const usedW = labelTxt.length + sep.length + (showPercent ? 5 : 0);
        this.calculatedBarW = Math.max(0, this.w - usedW);
        
        let bar = "";
        if (this.calculatedBarW > 0) {
            const filledW = Math.round((this.value / this.max) * this.calculatedBarW);
            bar = "█".repeat(filledW) + "░".repeat(this.calculatedBarW - filledW);
        }

        const finalText = labelTxt + sep + bar + (showPercent ? valStr : "");
        this.renderText = finalText.substring(0, this.w);
        
        const startX = Math.max(0, Math.floor((this.w - this.renderText.length) / 2));
        this.barLeftOffset = startX + labelTxt.length + sep.length;
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

    getActionAt(lx, ly) {
        if (!this.isHit(lx, ly)) return null;

        const barAbsLeft = this.x + this.barLeftOffset;
        const barAbsRight = barAbsLeft + this.calculatedBarW;

        if (lx < barAbsLeft || lx >= barAbsRight || this.calculatedBarW <= 0) return null;

        // const barPos = lx - barAbsLeft;
        // const percent = this.calculatedBarW > 1 ? barPos / (this.calculatedBarW - 1) : 0.5;
        // const value = Math.round(percent * this.max);

        return {
            action: this.action,
            // value: Math.max(0, Math.min(this.max, value)),
            value: this.getValueAt(lx),
            element: this
        };
    }

    getValueAt(lx) {
        const barAbsLeft = this.x + this.barLeftOffset;
        const barAbsRight = barAbsLeft + this.calculatedBarW - 1;

        const clampedLx = Math.max(barAbsLeft, Math.min(barAbsRight, lx));

        const barPos = clampedLx - barAbsLeft;
        const percent = this.calculatedBarW > 1 ? barPos / (this.calculatedBarW - 1) : 0.5;
        const value = Math.round(percent * this.max);

        return value;
    }

    draw(renderer) {
        super.draw(renderer);

        const color = this.focused ? C_FOCUS : C_OPTION;

        const startX = this.x + Math.floor((this.w - this.renderText.length) / 2);

        for (let i = 0; i < this.renderText.length; i++) {
            renderer.addLocalChar(this.renderText[i], startX + i, this.y, color, this.focused, false);
        }

        renderer.markDirty(startX, this.y, this.w, this.h);
    }
}

