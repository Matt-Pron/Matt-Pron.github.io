import { Viewport } from "../viewport.js";
import { colors } from "../palette.js";

export class LoadingScreen extends Viewport {
    constructor(x, y, w, h, z) {
        super(x, y, w, h, z);
        this.dotPos = 0;
        this.direction = 1;
        this.lastUpdate = 0;
        this.speed = 200;
    }

    update(t) {
        if (t - this.lastUpdate > this.speed) {
            this.dotPos += this.direction;

            if (this.dotPos >= 2 || this.dotPos <= -2) {
                this.direction *= -1;
            }

            this.lastUpdate = t;
        }
    }

    drawContent(renderer) {
        const text = "LOADING";

        const centerX = Math.floor((this.width - text.length) / 2);
        const centerY = Math.floor(this.height / 2);

        renderer.drawLocalText(text, centerX, centerY, { color: 4 });
        renderer.drawLocalText(".", centerX + (text.length >> 1) + this.dotPos, centerY + 1, { color: 4 });
    }
}

