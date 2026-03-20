import { InputHandler } from "../input.js";
import { Viewport } from "../viewport.js";
import { viewportManager } from "../viewportManager.js";
import { UIButton } from "./widgets.js";

export class InfoMessage extends Viewport {
    constructor(z) {
        super(0, 0, 0, 0, z);
        this.active = true;
        this.name = "InfoMessage";
        this.title = "TECLAS";
        this.message = [
            "Movimiento y",
            "selección:",
            "  - W A S D",
            "  - Flechas",
            // "  - H J K L",
            "",
            "Pasar turno y",
            "disparar:",
            "  - E",
            "",
            "Apuntar:",
            "  - Q",
            "",
            "Abrir Menú e",
            "inspeccionar:",
            "  - R",
            "",
            "Cancelar:",
            "  - Escape",
        ];
        this.scrollY = 0;
        this.buttons = [
            new UIButton("Volver", 0, 0, 6, 1, "escape"),
            new UIButton("▲", 0, 0, 1, 1, "move_up"),
            new UIButton("▼", 0, 0, 1, 1, "move_down"),
            // this.btnC = new Button("Volver", 6, 1, () => press("escape")),
            // this.btnW = new Button("▲", 1, 1, () => press("move_up")),
            // this.btnS = new Button("▼", 1, 1, () => press("move_down"))
        ];
        this.previousFocusId = null;
    }

    onResize(newCols, newRows) {
        this.x = 0;
        this.y = 0;
        this.width = newCols;
        this.height = newRows;

        this.pWidth = Math.max(21, Math.min(45, Math.floor(newCols / 2)));
        this.pHeight = Math.max(10, Math.min(60, Math.floor(newRows * 0.7)));
        this.pX = Math.floor((newCols - this.pWidth) / 2);
        this.pY = Math.floor((newRows - this.pHeight) / 2);

        this.btnC.setPosition(this.pX + ((this.pWidth - 6) >> 1), this.pY + this.pHeight - 3);
        this.btnW.setPosition((this.pX + (this.pWidth >> 1)) - 9, this.pY + this.pHeight - 3);
        this.btnS.setPosition((this.pX + (this.pWidth >> 1)) + 9, this.pY + this.pHeight - 3);

        const visibleLines = this.pHeight - 8;
        if (this.message.length >= visibleLines) {
            this.btnW.active = true;
            this.btnS.active = true;
        } else {
            this.btnW.active = false;
            this.btnS.active = false;
        }
    }

    handleInput(a) {
        if (!this.active) return;

        const visibleLines = this.pHeight - 8;

        switch (a) {
            case "move_up":
                this.scrollY = Math.max(0, this.scrollY - 1);
                break;
            case "move_down":
                this.scrollY = Math.min(this.message.length - visibleLines, this.scrollY + 1);
                break;
            case "escape":
            case "confirm":
                viewportManager.removeViewport(this.id);
                if (this.previousFocusId) {
                    viewportManager.setFocus(this.previousFocusId);
                } else {
                    const fallbackVp = viewportManager.getActiveViewports()[0];
                    if (fallbackVp) viewportManager.setFocus(fallbackVp.id);
                }
                break;
        }
    }

    handlePointer(type, gridX, gridY, localX, localY, event) {
        if (!this.active) return;
        const lx = gridX - this.x;
        const ly = gridY - this.y;
        // if (lx < 0 || lx >= this.width || ly < 0 || ly >= this.height) return;

        switch (type) {
            case "down":
                if (lx < this.pX || lx >= this.pX + this.pWidth || ly < this.pY || ly >=this.pY + this.pHeight) InputHandler.virtualKey("escape");

                this.buttons.forEach(btn => {
                    if (btn.isHit(lx, ly)) {
                        btn.isPressed = true;
                        btn.callback();
                    }
                });
                break;
            case "up":
                this.buttons.forEach(btn => {
                    btn.isPressed = false;
                });
                break;
            case "cancel":
                this.buttons.forEach(btn => {
                    btn.isPressed = false;
                });
                break;
        }
    }

    drawContent(renderer) {
        if (!this.active) return;

        for (let i = this.pX; i < this.pX + this.pWidth; i++) {
            for (let j = this.pY; j < this.pY + this.pHeight; j++) {
                const bg = (i === this.pX ||
                    i === this.pX + this.pWidth - 1 ||
                    j === this.pY ||
                    j === this.pY + this.pHeight - 1) ? 8 : 2;
                renderer.clearLocalChar(i, j);
                renderer.drawLocalChar("▓", i, j, bg);
            }
        }

        const startX = Math.floor(this.pX + (this.pWidth - this.title.length) / 2);

        renderer.drawLocalText(this.title, startX, this.pY + 2);

        const visibleLines = this.pHeight - 8;
        this.message.slice(this.scrollY, this.scrollY + visibleLines).forEach((msg, i) => {
            const trimMsg = msg.slice(0, this.pWidth - 4);
            renderer.drawLocalText(trimMsg, this.pX + 2, this.pY + 4 + i);
        });

        this.buttons.forEach(btn => btn.draw(renderer));
    }
}

