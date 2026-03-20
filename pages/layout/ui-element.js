import * as Utils from "./ui-utils.js";

export class UIElement {
    constructor(id = '') {
        this.id = id;
        this.parent = null;
        this.children = [];

        this.setPosition(0, 0);
        this.setSize(Utils.FIT, Utils.FIT);
        this.setFlow(Utils.FLOW.HORIZONTAL);
        this.setBackground('#333');
        this.setAlignment(Utils.ALIGN.HORIZONTAL.LEFT, Utils.ALIGN.VERTICAL.TOP);
    }

    setPosition(x, y) { Utils.createPosition(this, x, y); return this; }

    setSize(w, h) { Utils.createSize(this, w, h); return this; }

    setBackground(color) { Utils.createBackground(this, color); return this; }

    setColor(color) { Utils.createForeground(this, color); return this; }

    setFocusColor(bg, fg) { Utils.createFocusColors(this, bg, fg); return this; }

    setFocus(focused = true) { this.isFocused = focused; return this; }

    setInteractive(interactive = true) { this.isInteractive = interactive; return this; }

    setPadding(t, l, b, r) { Utils.createPadding(this, t, l, b, r); return this; }

    setMargin(t, l, b, r) { Utils.createMargin(this, t, l, b, r); return this; }

    setGap(gap) { Utils.createGap(this, gap); return this; }

    setFlow(flow) { Utils.createFlow(this, flow); return this; }

    setAlignment(h, v) { Utils.createAlignment(this, h, v); return this; }

    setContent(content) { Utils.createText(this, content); return this; }

    setAction(action) { Utils.createAction(this, action); return this; }

    add(child) {
        child.parent = this;
        this.children.push(child);
        return this;
    }

    p_fit(isWidth = true) {
        if (isWidth && this.content) {
            const words = this.content.split(' ');
            const longestWord = Math.max(...words.map(w => w.length));
            this.contentW = this.content.length - 1; // HACE FALTA O LA GRILLA DEL TEXTO NO COINCIDE CON LA REAL?
            this.minW = Math.max(this.minW || 0, longestWord + (this.padding?.l || 0) + (this.padding?.r || 0));
        }

        this.children.forEach(ch => ch.p_fit(isWidth));

        const type = isWidth ? this.typeW : this.typeH;

        if (type === Utils.FIT.type) {
            let totalChildrenSize = 0;

            this.children.forEach(ch => {
                const isGrow = (isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type;
                const childSize = isGrow
                    ? (isWidth ? ch.minW : ch.minH)
                    : (isWidth ? ch.computedW : ch.computedH);

                const m = ch.margin || { t:0, l:0, b:0, r:0 };
                const totalChildFootprint = childSize + (isWidth ? m.l + m.r : m.t + m.b);

                const flowMatch = (isWidth && this.flow === Utils.FLOW.HORIZONTAL) ||
                                  (!isWidth && this.flow === Utils.FLOW.VERTICAL);

                if (flowMatch) {
                    totalChildrenSize += totalChildFootprint + (this.gap || 0);
                } else {
                    totalChildrenSize = Math.max(totalChildrenSize, totalChildFootprint);
                }
            });

            const flowMatch = (isWidth && this.flow === Utils.FLOW.HORIZONTAL) ||
                              (!isWidth && this.flow === Utils.FLOW.VERTICAL);
            if (flowMatch && this.children.length > 0) totalChildrenSize -= (this.gap || 0);

            const myPad = this.padding || { t:0, l:0, b:0, r:0 };
            totalChildrenSize += isWidth ? (myPad.l + myPad.r) : (myPad.t + myPad.b);

            if (isWidth) {
                const textRequired = (this.contentW || 0) > 0 ? this.contentW + myPad.l + myPad.r : 0;
                this.computedW = Math.max(this.minW || 0, totalChildrenSize, textRequired);
            } else {
                const textRequired = (this.contentH || 0) > 0 ? this.contentH + myPad.t + myPad.b : 0;
                this.computedH = Math.max(this.minH || 0, totalChildrenSize, textRequired);
            }
        }
    }

    p_growShrink(isWidth = true) {
        if (!this.children || this.children.length === 0) return;

        const flowMatch = isWidth ? (this.flow === Utils.FLOW.HORIZONTAL) : (this.flow === Utils.FLOW.VERTICAL);

        const padding = this.padding || { t: 0, l: 0, b: 0, r: 0 };
        const totalPadding = isWidth ? (padding.l + padding.r) : (padding.t + padding.b);
        const parentAvailable = (isWidth ? this.computedW : this.computedH) - totalPadding;

        let occupied = 0;
        let growable = [];

        this.children.forEach(ch => {
            const chSize = isWidth ? ch.computedW : ch.computedH;
            const m = ch.margin || { t:0, l:0, b:0, r:0 };
            const childMargin = isWidth ? (m.l + m.r) : (m.t + m.b);

            if ((isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type) {
                growable.push(ch);
                if (flowMatch) occupied += childMargin + (this.gap || 0);
            } else { 
                if (flowMatch) occupied += chSize + childMargin + (this.gap || 0);
                else occupied = Math.max(occupied, chSize + childMargin);
            }
        });

        if (flowMatch && this.children.length > 0) occupied -= (this.gap || 0);

        let remaining = parentAvailable - occupied;

        if (remaining > 0 && growable.length > 0) {
            if (flowMatch) {
                while (remaining > 0.1 && growable.length > 0) {
                    let smallest = Math.min(...growable.map(c => isWidth ? c.computedW : c.computedH));
                    let targets = growable.filter(c => (isWidth ? c.computedW : c.computedH) <= smallest + 0.1);

                    let others = growable.filter(c => !targets.includes(c));
                    let nextSmallest = others.length > 0 
                        ? Math.min(...others.map(c => isWidth ? c.computedW : c.computedH)) 
                        : Infinity;

                    let sizeToAdd = Math.min(nextSmallest - smallest, remaining / targets.length);

                    targets.forEach(ch => {
                        const current = isWidth ? ch.computedW : ch.computedH;
                        const max = isWidth ? ch.maxW : ch.maxH;
                        const added = Math.min(sizeToAdd, max - current);

                        if (isWidth) ch.computedW += added;
                        else ch.computedH += added;

                        remaining -= added;
                        if (current + added >= max) {
                            growable = growable.filter(g => g !== ch);
                        }
                    });

                    if (sizeToAdd <= 0) break;
                }
            } else {
                growable.forEach(ch => {
                    const max = isWidth ? ch.maxW : ch.maxH;
                    const min = isWidth ? (ch.minW || 0) : (ch.minH || 0);
                    const m = ch.margin || { t:0, l:0, b:0, r:0 };
                    const marginInDim = isWidth ? (m.l + m.r) : (m.t + m.b);
                    const target = Math.max(0, parentAvailable - marginInDim);

                    if (isWidth) ch.computedW = Math.max(min, Math.min(target, max));
                    else ch.computedH = Math.max(min, Math.min(target, max));
                });
            }
        }

        this.children.forEach(ch => ch.p_growShrink(isWidth));
    }

    p_wrapText() {
        if (this.content) {
            const padding = this.padding || { t:0, l:0, b:0, r:0 };
            const availableW = Math.max(1, this.computedW - (padding.l + padding.r));

            const words = this.content.split(' ');
            let currentLine = '';
            this.lines = [];

            words.forEach(word => {
                if ((currentLine + word).length <= availableW) {
                    currentLine += (currentLine === '' ? '' : ' ') + word;
                } else {
                    if (currentLine !== '') this.lines.push(currentLine);
                    currentLine = word;
                }
            });
            if (currentLine !== '') this.lines.push(currentLine);

            this.contentH = this.lines.length;

            // if (this.typeH === 1) {
                this.minH = Math.max(this.minH || 0, this.contentH + padding.t + padding.b);
            // }
        }

        this.children.forEach(ch => ch.p_wrapText());
    }

    p_position() {
        if (!this.parent) {
            this.globalX = this.x || 0;
            this.globalY = this.y || 0;
        }

        const isHFlow = this.flow === Utils.FLOW.HORIZONTAL;

        let totalMainSize = 0;
        this.children.forEach(ch => {
            const m = ch.margin || { t:0, l:0, b:0, r:0 };
            const mainSize = isHFlow ? ch.computedW + m.l + m.r : ch.computedH + m.t + m.b;
            totalMainSize += mainSize + (this.gap || 0);
        });
        if (this.children.length > 0) totalMainSize -= (this.gap || 0);

        const availableMain = isHFlow
            ? this.computedW - (this.padding?.l || 0) - (this.padding?.r || 0)
            : this.computedH - (this.padding?.t || 0) - (this.padding?.b || 0);

        let mainOffset = 0;
        const mainExtra = availableMain - totalMainSize;
        const mainAlign = isHFlow ? (this.alignment?.h ?? 0) : (this.alignment?.v ?? 0);

        if (mainExtra > 0) {
            if (mainAlign === 1) mainOffset = Math.floor(mainExtra / 2);
            else if (mainAlign === 2) mainOffset = mainExtra;
        }

        let currentX = (this.padding?.l || 0) + (isHFlow ? mainOffset : 0);
        let currentY = (this.padding?.t || 0) + (!isHFlow ? mainOffset : 0);

        const crossAlign = isHFlow ? (this.alignment?.v ?? 0) : (this.alignment?.h ?? 0);
        const availableCross = isHFlow
            ? this.computedH - (this.padding?.t || 0) - (this.padding?.b || 0)
            : this.computedW - (this.padding?.l || 0) - (this.padding?.r || 0);

        this.children.forEach(ch => {
            const m = ch.margin || { t:0, l:0, b:0, r:0 };

            let crossOffset = 0;
            const childCrossSize = isHFlow ? ch.computedH + m.t + m.b : ch.computedW + m.l + m.r;
            const crossExtra = availableCross - childCrossSize;

            if (crossExtra > 0) {
                if (crossAlign === 1) crossOffset = Math.floor(crossExtra / 2);
                else if (crossAlign === 2) crossOffset = crossExtra;
            }

            ch.globalX = this.globalX + currentX + m.l + (!isHFlow ? crossOffset : 0);
            ch.globalY = this.globalY + currentY + m.t + (isHFlow ? crossOffset : 0);

            if (isHFlow) {
                currentX += ch.computedW + m.l + m.r + (this.gap || 0);
            } else {
                currentY += ch.computedH + m.t + m.b + (this.gap || 0);
            }

            ch.p_position();
        });
    }

    getHit(x, y) {
        if (x < this.globalX || x >= this.globalX + this.computedW ||
            y < this.globalY || y >= this.globalY + this.computedH) {
            return null;
        }

        if (this.children && this.children.length > 0) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                const hit = this.children[i].getHit(x, y);
                if (hit) return hit;
            }
        }

        if (this.isInteractive) {
            return {
                id: this.id,
                action: this.action,
                element: this
            };
        }

        return null;
    }

    update() {
        this.p_fit();
        this.p_growShrink();
        this.p_wrapText();
        this.p_fit(false);
        this.p_growShrink(false);
        this.p_position();
    }

    draw(renderer) {
        const bg = (this.isFocused && this.focusBgColor) ? this.focusBgColor : this.bgColor;
        const fg = (this.isFocused && this.focusFgColor) ? this.focusFgColor : this.fgColor;

        if (this.bgColor) {
            renderer.drawRect(this.globalX, this.globalY, this.computedW, this.computedH, bg);
        }

        if (this.lines) {
            const p = this.padding || { t: 0, l: 0 };
            this.lines.forEach((line, i) => {
                renderer.drawText(
                    line,
                    this.globalX + p.l,
                    this.globalY + p.t + i,
                    fg || '#000'
                );
            });
        }

        this.children.forEach(ch => ch.draw(renderer));
    }
}

