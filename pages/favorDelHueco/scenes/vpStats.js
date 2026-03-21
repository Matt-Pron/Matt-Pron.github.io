import { BOTTOM, LEFT } from "../ui/ui-utils.js";
import { Viewport } from "./viewport.js";

export class StatsViewport extends Viewport {
    constructor({ player }) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.player = player;
        this.setBackground(0)
            .setBorderLine(3)
            .setContentAlignment(LEFT, BOTTOM);
    }

    draw(renderer) {
        super.draw(renderer);

        renderer.addText(`HP: ${this.player.hp}/${this.player.maxHp}`, this.globalX + 1, this.globalY + 1, 1);
    }
}

