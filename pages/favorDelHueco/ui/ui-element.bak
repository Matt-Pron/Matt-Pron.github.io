import * as Utils from "./ui-utils.js";

export class UIElement {
    constructor(id = '') {
        this.id = id;
        this.parent = null;
        this.children = [];

        this.setPosition(0, 0);
        this.setSize(Utils.FIT, Utils.FIT);
        this.setFlow(Utils.HORIZONTAL);
        this.setAlignment(Utils.LEFT, Utils.TOP);
        this.setFocusStyle(1, { bold: true });
    }

    setFocus(focused = true) { this.isFocused = focused; return this; }
    setInteractive(interactive = true) { this.isInteractive = interactive; return this; }

    setPosition(x, y) { Utils.createPosition(this, x, y); return this; }
    setSize(w, h) { Utils.createSize(this, w, h); return this; }
    setBackground(color) { Utils.createBackground(this, color); return this; }
    setColor(color) { Utils.createForeground(this, color); return this; }
    setBorder(color) { Utils.createBorder(this, color); return this; }
    setBorderLine(color) { Utils.createBorderLine(this, color); return this; }
    setFocusStyle(fg, style = {}) { Utils.createFocusColors(this, fg, style); return this; }
    setPadding(t, l, b, r) { Utils.createPadding(this, t, l, b, r); return this; }
    setMargin(t, l, b, r) { Utils.createMargin(this, t, l, b, r); return this; }
    setGap(gap) { Utils.createGap(this, gap); return this; }
    setFlow(flow) { Utils.createFlow(this, flow); return this; }
    setAlignment(h, v) { Utils.createAlignment(this, h, v); return this; }
    setContent(content = '', style = {}) { Utils.createText(this, content, style); return this; }
    setContentAlignment(h, v) { Utils.createContentAlignment(this, h, v); return this; }
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
            this.contentW = this.content.length;                  // ← preferred unwrapped width (for 1-line layout)
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

                const flowMatch = (isWidth && this.flow === Utils.HORIZONTAL) ||
                    (!isWidth && this.flow === Utils.VERTICAL);

                if (flowMatch) {
                    totalChildrenSize += totalChildFootprint + (this.gap || 0);
                } else {
                    totalChildrenSize = Math.max(totalChildrenSize, totalChildFootprint);
                }
            });

            const flowMatch = (isWidth && this.flow === Utils.HORIZONTAL) ||
                (!isWidth && this.flow === Utils.VERTICAL);
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

        const flowMatch = isWidth ? (this.flow === Utils.HORIZONTAL) : (this.flow === Utils.VERTICAL);

        const padding = this.padding || { t: 0, l: 0, b: 0, r: 0 };
        const totalPadding = isWidth ? (padding.l + padding.r) : (padding.t + padding.b);
        const parentAvailable = (isWidth ? this.computedW : this.computedH) - totalPadding;

        this.children.forEach(ch => {
            if ((isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type) {
                if (isWidth) {
                    ch.computedW = ch.minW || 0;
                } else {
                    ch.computedH = ch.minH || 0;
                }
            }
        });

        let occupied = 0;
        let growable = [];

        this.children.forEach(ch => {
            const chSize = isWidth ? ch.computedW : ch.computedH;
            const m = ch.margin || { t:0, l:0, b:0, r:0 };
            const childMargin = isWidth ? (m.l + m.r) : (m.t + m.b);

            if ((isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type) {
                growable.push(ch);
                if (flowMatch) {
                    occupied += chSize + childMargin + (this.gap || 0);
                }
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

                    // FIXED: GROW in cross-dimension always fills the available space (clip if min > available)
                    if (isWidth) ch.computedW = Math.min(target, max);
                        else ch.computedH = Math.min(target, max);
                });
            }
        }

        // NEW: Cap ALL children in the CROSS dimension to the parent's available space.
        // This is what prevents X/Y overflow when a child’s preferred size (e.g. long text) > parent.
        if (!flowMatch) {
            this.children.forEach(ch => {
                const m = ch.margin || { t:0, l:0, b:0, r:0 };
                const childMargin = isWidth ? (m.l + m.r) : (m.t + m.b);
                const maxChildSize = Math.max(0, parentAvailable - childMargin);

                if (isWidth) {
                    ch.computedW = Math.min(ch.computedW || 0, maxChildSize);
                } else {
                    ch.computedH = Math.min(ch.computedH || 0, maxChildSize);
                }
            });
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
                const space = currentLine === '' ? '' : ' ';
                if ((currentLine + space + word).length <= availableW) {
                    currentLine += space + word;
                } else {
                    if (currentLine !== '') this.lines.push(currentLine);
                    currentLine = word;
                }
            });
            if (currentLine !== '') this.lines.push(currentLine);

            this.contentH = this.lines.length;

            // FIXED: minH is now the CURRENT required height (not a running max).
            // This is why the layout “never turned back” when you made the viewport wider.
            this.minH = this.contentH + padding.t + padding.b;
        }

        this.children.forEach(ch => ch.p_wrapText());
    }

    p_position() {
        if (!this.parent) {
            this.globalX = this.x || 0;
            this.globalY = this.y || 0;
        }

        const isHFlow = this.flow === Utils.HORIZONTAL;

        const padding = this.padding || { t: 0, l: 0, b: 0, r: 0 };
        let currentMain = isHFlow ? padding.l : padding.t;
        const availableMain = isHFlow
            ? this.computedW - padding.l - padding.r
            : this.computedH - padding.t - padding.b;

        // For vertical flow + TOP alignment → stop positioning once we run out of vertical space
        let stopPositioning = false;

        this.children.forEach(ch => {
            if (stopPositioning) {
                // Hide children that would be fully below → prevent them from having valid globalY
                ch.globalX = -9999; // offscreen
                ch.globalY = -9999;
                return;
            }

            const m = ch.margin || { t:0, l:0, b:0, r:0 };

            // Calculate position before advancing
            let posMain = currentMain + (isHFlow ? m.l : m.t);
            let posCross = padding[isHFlow ? 't' : 'l']; // start of cross

            // For vertical flow, check if this child would start below the bottom
            if (!isHFlow) {
                const childHeightWithMargins = ch.computedH + m.t + m.b;
                if (posMain + childHeightWithMargins > availableMain) {
                    stopPositioning = true;
                    ch.globalX = -9999;
                    ch.globalY = -9999;
                    return;
                }
            }

            // Normal cross alignment (center/bottom etc.)
            const availableCross = isHFlow ? this.computedH - padding.t - padding.b : this.computedW - padding.l - padding.r;
            const childCross = isHFlow ? ch.computedH + m.t + m.b : ch.computedW + m.l + m.r;
            let crossOffset = 0;
            const alignCross = isHFlow ? (this.alignment?.v ?? Utils.TOP) : (this.alignment?.h ?? Utils.LEFT);

            if (childCross < availableCross) {
                if (alignCross === Utils.CENTER) crossOffset = Math.floor((availableCross - childCross) / 2);
                    else if (alignCross === Utils.BOTTOM || alignCross === Utils.RIGHT) crossOffset = availableCross - childCross;
            }

            ch.globalX = this.globalX + (isHFlow ? posMain : posCross + crossOffset + m.l);
            ch.globalY = this.globalY + (isHFlow ? posCross + crossOffset + m.t : posMain);

            // Advance main cursor
            const advance = (isHFlow ? ch.computedW : ch.computedH) + (isHFlow ? m.l + m.r : m.t + m.b) + (this.gap || 0);
            currentMain += advance;

            ch.p_position();
        });

        // ── Text positioning (unchanged, but now benefits from parent clipping) ──
        if (this.lines && this.lines.length > 0) {
            this.textPositions = [];
            const p = this.padding || { t: 0, l: 0, b:0, r:0 };
            const availableH = this.computedH - p.t - p.b;
            const availableW = this.computedW - p.l - p.r;

            let startY = this.globalY + p.t;
            const vAlign = this.contentAlign?.v ?? Utils.TOP;

            let visibleLines = this.lines.length;
            let startIdx = 0;

            if (vAlign === Utils.BOTTOM) {
                visibleLines = Math.min(this.lines.length, availableH);
                startIdx = this.lines.length - visibleLines;
                startY += availableH - visibleLines;
            } else if (vAlign === Utils.CENTER) {
                const extra = availableH - this.lines.length;
                startY += Math.max(0, Math.floor(extra / 2));
            }
            // else TOP: startY as is, startIdx = 0

            for (let i = 0; i < visibleLines; i++) {
                const lineIdx = startIdx + i;
                if (lineIdx >= this.lines.length) break;
                const line = this.lines[lineIdx];

                let lineX = this.globalX + p.l;
                const hAlign = this.contentAlign?.h ?? Utils.LEFT;
                if (hAlign === Utils.CENTER) {
                    lineX += Math.max(0, Math.floor((availableW - line.length) / 2));
                } else if (hAlign === Utils.RIGHT) {
                    lineX += Math.max(0, availableW - line.length);
                }

                const clippedText = line.substring(0, availableW);
                const lineY = startY + i;

                // Only add if the line is inside parent bounds (extra safety)
                if (lineY >= this.globalY && lineY < this.globalY + this.computedH) {
                    this.textPositions.push({ text: clippedText, x: lineX, y: lineY });
                }
            }
        }
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

    computeLayout() {
        this.p_fit();
        this.p_growShrink();
        this.p_wrapText();
        this.p_fit(false);
        this.p_growShrink(false);
        this.p_position();
    }

    draw(renderer) {
        const bg = (this.isFocused && this.focusBgColor !== undefined) ? this.focusBgColor : this.bgColor;
        const fg = (this.isFocused && this.focusFgColor !== undefined) ? this.focusFgColor : this.fgColor;
        const b = (this.contentStyle?.bold || (this.isFocused && this.contentFocusStyle?.bold)) ? true : false;

        if (bg !== undefined && bg !== null) {
            if (this.borderColor !== undefined && this.borderColor !== null) {
                renderer.addRect(this.globalX, this.globalY, this.computedW, this.computedH, this.borderColor);
                renderer.addRect(this.globalX + 1, this.globalY + 1, this.computedW - 2, this.computedH - 2, bg);
            }
            else renderer.addRect(this.globalX, this.globalY, this.computedW, this.computedH, bg);
        }

        if (this.borderLineColor !== undefined && this.borderLineColor !== null) {
            renderer.addBorderLine(this.globalX, this.globalY, this.computedW, this.computedH, this.borderLineColor);
        }
        
        const parentTop = this.globalY;
        const parentBottom = this.globalY + this.computedH;
        const parentLeft = this.globalX;
        const parentRight = this.globalX + this.computedW;

        if (this.textPositions) {
            this.textPositions.forEach(pos => {
                if (pos.y >= parentTop && pos.y < parentBottom) {
                    renderer.addText(
                        pos.text,
                        pos.x,
                        pos.y,
                        fg !== undefined ? fg : 1,
                        b,
                        this.contentStyle?.italic ?? false
                    );
                }
            });
        }

        this.children.forEach(ch => {
            const chTop = this.globalY;
            const chBottom = this.globalY + this.computedH;
            const chLeft = this.globalX;
            const chRight = this.globalX + this.computedW;

            if (chBottom <= parentTop || chTop >= parentBottom ||
                chRight <= parentLeft || chLeft >= parentRight) {
                return;
            }

            ch.draw(renderer);
        });
    }
}

// --------------------- 

// import * as Utils from "./ui-utils.js";
//
// export class UIElement {
//     constructor(id = '') {
//         this.id = id;
//         this.parent = null;
//         this.children = [];
//
//         this.setPosition(0, 0);
//         this.setSize(Utils.FIT, Utils.FIT);
//         this.setFlow(Utils.HORIZONTAL);
//         this.setAlignment(Utils.LEFT, Utils.TOP);
//         this.setFocusStyle(1, { bold: true });
//     }
//
//     setFocus(focused = true) { this.isFocused = focused; return this; }
//     setInteractive(interactive = true) { this.isInteractive = interactive; return this; }
//
//     setPosition(x, y) { Utils.createPosition(this, x, y); return this; }
//     setSize(w, h) { Utils.createSize(this, w, h); return this; }
//     setBackground(color) { Utils.createBackground(this, color); return this; }
//     setColor(color) { Utils.createForeground(this, color); return this; }
//     setBorder(color) { Utils.createBorder(this, color); return this; }
//     setBorderLine(color) { Utils.createBorderLine(this, color); return this; }
//     setFocusStyle(fg, style = {}) { Utils.createFocusColors(this, fg, style); return this; }
//     setPadding(t, l, b, r) { Utils.createPadding(this, t, l, b, r); return this; }
//     setMargin(t, l, b, r) { Utils.createMargin(this, t, l, b, r); return this; }
//     setGap(gap) { Utils.createGap(this, gap); return this; }
//     setFlow(flow) { Utils.createFlow(this, flow); return this; }
//     setAlignment(h, v) { Utils.createAlignment(this, h, v); return this; }
//     setContent(content, style = {}) { Utils.createText(this, content, style); return this; }
//     setContentAlignment(h, v) { Utils.createContentAlignment(this, h, v); return this; }
//     setAction(action) { Utils.createAction(this, action); return this; }
//
//     add(child) {
//         child.parent = this;
//         this.children.push(child);
//         return this;
//     }
//
//     p_fit(isWidth = true) {
//         if (isWidth && this.content) {
//             const words = this.content.split(' ');
//             const longestWord = Math.max(...words.map(w => w.length));
//             this.contentW = this.content.length;
//             this.minW = Math.max(this.minW || 0, longestWord + (this.padding?.l || 0) + (this.padding?.r || 0));
//         }
//
//         this.children.forEach(ch => ch.p_fit(isWidth));
//
//         const type = isWidth ? this.typeW : this.typeH;
//
//         if (type === Utils.FIT.type) {
//             let totalChildrenSize = 0;
//
//             this.children.forEach(ch => {
//                 const isGrow = (isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type;
//                 const childSize = isGrow
//                     ? (isWidth ? ch.minW : ch.minH)
//                     : (isWidth ? ch.computedW : ch.computedH);
//
//                 const m = ch.margin || { t:0, l:0, b:0, r:0 };
//                 const totalChildFootprint = childSize + (isWidth ? m.l + m.r : m.t + m.b);
//
//                 const flowMatch = (isWidth && this.flow === Utils.HORIZONTAL) ||
//                                   (!isWidth && this.flow === Utils.VERTICAL);
//
//                 if (flowMatch) {
//                     totalChildrenSize += totalChildFootprint + (this.gap || 0);
//                 } else {
//                     totalChildrenSize = Math.max(totalChildrenSize, totalChildFootprint);
//                 }
//             });
//
//             const flowMatch = (isWidth && this.flow === Utils.HORIZONTAL) ||
//                               (!isWidth && this.flow === Utils.VERTICAL);
//             if (flowMatch && this.children.length > 0) totalChildrenSize -= (this.gap || 0);
//
//             const myPad = this.padding || { t:0, l:0, b:0, r:0 };
//             totalChildrenSize += isWidth ? (myPad.l + myPad.r) : (myPad.t + myPad.b);
//
//             if (isWidth) {
//                 const textRequired = (this.contentW || 0) > 0 ? this.contentW + myPad.l + myPad.r : 0;
//                 this.computedW = Math.max(this.minW || 0, totalChildrenSize, textRequired);
//             } else {
//                 const textRequired = (this.contentH || 0) > 0 ? this.contentH + myPad.t + myPad.b : 0;
//                 this.computedH = Math.max(this.minH || 0, totalChildrenSize, textRequired);
//             }
//         }
//     }
//
//     p_growShrink(isWidth = true) {
//         if (!this.children || this.children.length === 0) return;
//
//         const flowMatch = isWidth ? (this.flow === Utils.HORIZONTAL) : (this.flow === Utils.VERTICAL);
//
//         const padding = this.padding || { t: 0, l: 0, b: 0, r: 0 };
//         const totalPadding = isWidth ? (padding.l + padding.r) : (padding.t + padding.b);
//         const parentAvailable = (isWidth ? this.computedW : this.computedH) - totalPadding;
//
//         this.children.forEach(ch => {
//             if ((isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type) {
//                 if (isWidth) {
//                     ch.computedW = ch.minW || 0;
//                 } else {
//                     ch.computedH = ch.minH || 0;
//                 }
//             }
//         });
//
//         let occupied = 0;
//         let growable = [];
//
//         this.children.forEach(ch => {
//             const chSize = isWidth ? ch.computedW : ch.computedH;
//             const m = ch.margin || { t:0, l:0, b:0, r:0 };
//             const childMargin = isWidth ? (m.l + m.r) : (m.t + m.b);
//
//             if ((isWidth ? ch.typeW : ch.typeH) === Utils.GROW.type) {
//                 growable.push(ch);
//                 if (flowMatch) {
//                     // occupied += childMargin + (this.gap || 0);
//                     occupied += chSize + childMargin + (this.gap || 0);
//                 }
//             } else { 
//                 if (flowMatch) occupied += chSize + childMargin + (this.gap || 0);
//                 else occupied = Math.max(occupied, chSize + childMargin);
//             }
//         });
//
//         if (flowMatch && this.children.length > 0) occupied -= (this.gap || 0);
//
//         let remaining = parentAvailable - occupied;
//
//         if (remaining > 0 && growable.length > 0) {
//             if (flowMatch) {
//                 while (remaining > 0.1 && growable.length > 0) {
//                     let smallest = Math.min(...growable.map(c => isWidth ? c.computedW : c.computedH));
//                     let targets = growable.filter(c => (isWidth ? c.computedW : c.computedH) <= smallest + 0.1);
//
//                     let others = growable.filter(c => !targets.includes(c));
//                     let nextSmallest = others.length > 0 
//                         ? Math.min(...others.map(c => isWidth ? c.computedW : c.computedH)) 
//                         : Infinity;
//
//                     let sizeToAdd = Math.min(nextSmallest - smallest, remaining / targets.length);
//
//                     targets.forEach(ch => {
//                         const current = isWidth ? ch.computedW : ch.computedH;
//                         const max = isWidth ? ch.maxW : ch.maxH;
//                         const added = Math.min(sizeToAdd, max - current);
//
//                         if (isWidth) ch.computedW += added;
//                         else ch.computedH += added;
//
//                         remaining -= added;
//                         if (current + added >= max) {
//                             growable = growable.filter(g => g !== ch);
//                         }
//                     });
//
//                     if (sizeToAdd <= 0) break;
//                 }
//             } else {
//                 growable.forEach(ch => {
//                     const max = isWidth ? ch.maxW : ch.maxH;
//                     const min = isWidth ? (ch.minW || 0) : (ch.minH || 0);
//                     const m = ch.margin || { t:0, l:0, b:0, r:0 };
//                     const marginInDim = isWidth ? (m.l + m.r) : (m.t + m.b);
//                     const target = Math.max(0, parentAvailable - marginInDim);
//
//                     if (isWidth) ch.computedW = Math.max(min, Math.min(target, max));
//                     else ch.computedH = Math.max(min, Math.min(target, max));
//                 });
//             }
//         }
//
//         this.children.forEach(ch => ch.p_growShrink(isWidth));
//     }
//
//     p_wrapText() {
//         if (this.content) {
//             const padding = this.padding || { t:0, l:0, b:0, r:0 };
//             const availableW = Math.max(1, this.computedW - (padding.l + padding.r));
//
//             const words = this.content.split(' ');
//             let currentLine = '';
//             this.lines = [];
//
//             words.forEach(word => {
//                 const space = currentLine === '' ? '' : ' ';
//                 if ((currentLine + space + word).length <= availableW) {
//                     currentLine += space + word;
//                 } else {
//                     if (currentLine !== '') this.lines.push(currentLine);
//                     currentLine = word;
//                 }
//             });
//             if (currentLine !== '') this.lines.push(currentLine);
//
//             this.contentH = this.lines.length;
//
//             // if (this.typeH === 1) {
//                 this.minH = Math.max(this.minH || 0, this.contentH + padding.t + padding.b);
//             // }
//         }
//
//         this.children.forEach(ch => ch.p_wrapText());
//     }
//
//     p_position() {
//         if (!this.parent) {
//             this.globalX = this.x || 0;
//             this.globalY = this.y || 0;
//         }
//
//         const isHFlow = this.flow === Utils.HORIZONTAL;
//
//         let totalMainSize = 0;
//         this.children.forEach(ch => {
//             const m = ch.margin || { t:0, l:0, b:0, r:0 };
//             const mainSize = isHFlow ? ch.computedW + m.l + m.r : ch.computedH + m.t + m.b;
//             totalMainSize += mainSize + (this.gap || 0);
//         });
//         if (this.children.length > 0) totalMainSize -= (this.gap || 0);
//
//         const availableMain = isHFlow
//             ? this.computedW - (this.padding?.l || 0) - (this.padding?.r || 0)
//             : this.computedH - (this.padding?.t || 0) - (this.padding?.b || 0);
//
//         let mainOffset = 0;
//         const mainExtra = availableMain - totalMainSize;
//         const mainAlign = isHFlow ? (this.alignment?.h ?? 0) : (this.alignment?.v ?? 0);
//
//         if (mainExtra > 0) {
//             if (mainAlign === 1) mainOffset = Math.floor(mainExtra / 2);
//             else if (mainAlign === 2) mainOffset = mainExtra;
//         }
//
//         let currentX = (this.padding?.l || 0) + (isHFlow ? mainOffset : 0);
//         let currentY = (this.padding?.t || 0) + (!isHFlow ? mainOffset : 0);
//
//         const crossAlign = isHFlow ? (this.alignment?.v ?? 0) : (this.alignment?.h ?? 0);
//         const availableCross = isHFlow
//             ? this.computedH - (this.padding?.t || 0) - (this.padding?.b || 0)
//             : this.computedW - (this.padding?.l || 0) - (this.padding?.r || 0);
//
//         this.children.forEach(ch => {
//             const m = ch.margin || { t:0, l:0, b:0, r:0 };
//
//             let crossOffset = 0;
//             const childCrossSize = isHFlow ? ch.computedH + m.t + m.b : ch.computedW + m.l + m.r;
//             const crossExtra = availableCross - childCrossSize;
//
//             if (crossExtra > 0) {
//                 if (crossAlign === 1) crossOffset = Math.floor(crossExtra / 2);
//                 else if (crossAlign === 2) crossOffset = crossExtra;
//             }
//
//             ch.globalX = this.globalX + currentX + m.l + (!isHFlow ? crossOffset : 0);
//             ch.globalY = this.globalY + currentY + m.t + (isHFlow ? crossOffset : 0);
//
//             if (isHFlow) {
//                 currentX += ch.computedW + m.l + m.r + (this.gap || 0);
//             } else {
//                 currentY += ch.computedH + m.t + m.b + (this.gap || 0);
//             }
//
//             ch.p_position();
//         });
//
//         if (this.lines && this.lines.length > 0) {
//             this.textPositions = [];
//             const p = this.padding || { t: 0, l: 0, b:0, r:0 };
//             const availableH = this.computedH - p.t - p.b;
//             const availableW = this.computedW - p.l - p.r;
//
//             let startY = this.globalY + p.t;
//             if (this.contentAlign?.v === Utils.CENTER) {
//                 startY += Math.max(0, Math.floor((availableH - this.lines.length) / 2));
//             } else if (this.contentAlign?.v === Utils.BOTTOM) {
//                 startY += Math.max(0, availableH - this.lines.length);
//             }
//
//             this.lines.forEach((line, i) => {
//                 if (i < availableH) {
//                     let lineX = this.globalX + p.l;
//                     if (this.contentAlign?.h === Utils.CENTER) {
//                         lineX += Math.max(0, Math.floor((availableW - line.length) / 2));
//                     } else if (this.contentAlign?.h === Utils.RIGHT) {
//                         lineX += Math.max(0, availableW - line.length);
//                     }
//
//                     const clippedText = line.substring(0, availableW);
//
//                     this.textPositions.push({ text: clippedText, x: lineX, y: startY + i });
//                 }
//             });
//         }
//     }
//
//     getHit(x, y) {
//         if (x < this.globalX || x >= this.globalX + this.computedW ||
//             y < this.globalY || y >= this.globalY + this.computedH) {
//             return null;
//         }
//
//         if (this.children && this.children.length > 0) {
//             for (let i = this.children.length - 1; i >= 0; i--) {
//                 const hit = this.children[i].getHit(x, y);
//                 if (hit) return hit;
//             }
//         }
//
//         if (this.isInteractive) {
//             return {
//                 id: this.id,
//                 action: this.action,
//                 element: this
//             };
//         }
//
//         return null;
//     }
//
//     computeLayout() {
//         this.p_fit();
//         this.p_growShrink();
//         this.p_wrapText();
//         this.p_fit(false);
//         this.p_growShrink(false);
//         this.p_position();
//     }
//
//     draw(renderer) {
//         const bg = (this.isFocused && this.focusBgColor !== undefined) ? this.focusBgColor : this.bgColor;
//         const fg = (this.isFocused && this.focusFgColor !== undefined) ? this.focusFgColor : this.fgColor;
//         const b = (this.contentStyle?.bold || (this.isFocused && this.contentFocusStyle?.bold)) ? true : false;
//
//         if (bg !== undefined && bg !== null) {
//             if (this.borderColor !== undefined && this.borderColor !== null) {
//                 renderer.addRect(this.globalX, this.globalY, this.computedW, this.computedH, this.borderColor);
//                 renderer.addRect(this.globalX + 1, this.globalY + 1, this.computedW - 2, this.computedH - 2, bg);
//             }
//             else renderer.addRect(this.globalX, this.globalY, this.computedW, this.computedH, bg);
//         }
//
//         if (this.borderLineColor !== undefined && this.borderLineColor !== null) {
//             renderer.addBorderLine(this.globalX, this.globalY, this.computedW, this.computedH, this.borderLineColor);
//         }
//
//         if (this.textPositions) {
//             this.textPositions.forEach(pos => {
//                 renderer.addText(
//                     pos.text,
//                     pos.x,
//                     pos.y,
//                     fg !== undefined ? fg : 1,
//                     b,
//                     this.contentStyle?.italic ?? false
//                 );
//             });
//         }
//
//         this.children.forEach(ch => ch.draw(renderer));
//     }
// }
//
