export class Renderer {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridX = 24 * 0.6;
        this.gridY = 24 * 1.2;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ctx.font = "bold 24px monospace";
        this.ctx.textBaseline = 'top';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect(x, y, w, h, c) {
        this.ctx.fillStyle = c;
        this.ctx.fillRect(
            x * this.gridX,
            y * this.gridY,
            w * this.gridX,
            h * this.gridY
        );
    }

    drawChar(char, x, y, c) {
        this.ctx.fillStyle = c;
        this.ctx.fillText(
            char,
            x * this.gridX,
            y * this.gridY
        );
    }

    drawText(text, x, y, c) {
        this.ctx.fillStyle = c;
        this.ctx.fillText(
            text,
            x * this.gridX,
            y * this.gridY
        );
    }
}
