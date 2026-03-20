import { eventBus } from "./eventBus.js";

export class Viewport {
    constructor(x, y, width, height, z = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.z = z;
        this.active = true;
    }

    init() {
        eventBus.emit("SCENE_READY");
    }

    onResize(newCols, newRows) {
        this.width = newCols - this.x * 2;
        this.height = newRows - this.y * 2;
    }

    drawContent(renderer) {
    }
}

