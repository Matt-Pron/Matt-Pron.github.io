import { UIElement } from "../ui/ui-element.js";
import { BOTTOM, LEFT, VERTICAL } from "../ui/ui-utils.js";
import { Viewport } from "./viewport.js";

export class StatsViewport extends Viewport {
    constructor({ player }) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.player = player;

        this.pName = new UIElement()
            .setContent(`${this.player.name}`, { bold: true });
        this.pRace = new UIElement()
            .setContent(`${this.player.race}`);
        this.pClass = new UIElement()
            .setContent(`${this.player.class}`);
        this.pLevel = new UIElement()
            .setContent(`Nivel: ${this.player.level}`);
        this.pXp = new UIElement()
        .setContent(`Exp: ${this.player.exp}%`);
        this.pHp = new UIElement()
            .setMargin(1,0,0,0)
            .setContent(`PS: ${this.player.hp}/${this.player.maxHp}`);

        this.setBackground(0)
            .setFlow(VERTICAL)
            .setBorderLine(3)
            .setContentAlignment(LEFT, BOTTOM)
            .setPadding(1);
        this.add(this.pName)
            .add(this.pRace)
            .add(this.pClass)
            .add(this.pLevel)
            .add(this.pXp)
            .add(this.pHp);
    }

    update(dt) {
        super.update(dt);
        this.pName.setContent(`${this.player.name}`, { bold: true });
        this.pRace.setContent(`${this.player.race}`);
        this.pClass.setContent(`${this.player.class}`);
        this.pLevel.setContent(`Nivel: ${this.player.level}`);
        this.pXp.setContent(`Exp: ${this.player.exp}%`);
        this.pHp.setContent(`PS: ${this.player.hp}/${this.player.maxHp}`).computeLayout();
        this.computeLayout();
    }
}

