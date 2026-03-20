import { Viewport } from "./viewport.js";

export class LogViewport extends Viewport {
    constructor({ gameState }) {
        super();
        this.fixed = false;
        this.gameState = gameState;

        this.setBackground(2);
    }

    draw(renderer) {
        super.draw(renderer);

        const logs = this.gameState.logs && this.gameState.logs.length > 0
            ? this.gameState.logs
            : ["Bienvenido, santurrón!"];

        const maxLines = this.computedH - 2;
        const displayLogs = logs.slice(-maxLines);

        displayLogs.forEach((log, i) => {
            renderer.addText(log, this.globalX + 1, this.globalY + 1 + i, 1);
        });
    }
}

