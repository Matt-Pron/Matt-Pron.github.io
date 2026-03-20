import { Viewport } from "./viewport.js";

export class StatsViewport extends Viewport {
    constructor({ player }) {
        super();
        this.fixed = false;
        this.player = player;
        this.setBackground(5);
    }

    draw(renderer) {
        super.draw(renderer);

        renderer.addText(`HP: ${this.player.hp}/${this.player.maxHp}`, this.globalX + 1, this.globalY + 1, 1);
    }
}

