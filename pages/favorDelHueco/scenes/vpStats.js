import { ACTIONS, REPEATABLE_ACTIONS } from "../data/actions.js";
import { UIElement } from "../ui/ui-element.js";
import { BOTTOM, GROW, LEFT, TOP, VERTICAL } from "../ui/ui-utils.js";
import { Viewport } from "./viewport.js";

export class StatsViewport extends Viewport {
    constructor(args) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.player = args.player;
        this.gameScene = args.gameScene;

        this.pName = new UIElement()
            .setContent(`${this.player.name}`, { bold: true });
        this.pDesc = new UIElement()
                .setContent(`${this.player.race} ${this.player.class} Bonus: ${this.player.bonus}, exp: ${this.player.exp}%`)
        // this.pRace = new UIElement()
        //     .setContent(`${this.player.race}`);
        // this.pClass = new UIElement()
        //     .setContent(`${this.player.class}`);
        // this.pLevel = new UIElement()
        //     .setContent(`Nivel: ${this.player.level}`);
        // this.pXp = new UIElement()
        // .setContent(`Exp: ${this.player.exp}%`);
        this.pHp = new UIElement()
            // .setMargin(1,0,0,0)
            .setContent(`PS: ${this.player.W}/${this.player.maxW}`);

        this.setBackground(0)
            .setFlow(VERTICAL)
            .setBorderLine(3)
            .setContentAlignment(LEFT, TOP)
            .setPadding(1);
        this.add(this.pName)
            .add(this.pDesc)
            //     new UIElement().setGap(1).setSize(GROW, 2)
            //     .add(this.pRace)
            //     .add(this.pClass)
            //     .add(this.pXp)
            // )
            .add(
                new UIElement()
            // .add(this.pLevel)
            )
            .add(
                new UIElement()
                .add(this.pHp)
            );
    }

    update(dt) {
        super.update(dt);
        this.pName.setContent(`${this.player.name}`, { bold: true });
        if (this.player.bonus >= 1) {
            this.pDesc.setContent(`${this.player.race} ${this.player.class} | Bonus: ${this.player.bonus}, exp: ${this.player.exp}%`);
        } else {
            this.pDesc.setContent(`${this.player.race} ${this.player.class} | exp: ${this.player.exp}%`);
        }
        // this.pRace.setContent(`${this.player.race}`);
        // this.pClass.setContent(`${this.player.class}`);
        // this.pLevel.setContent(`Nivel: ${this.player.level}`);
        // this.pXp.setContent(`exp: ${this.player.exp}`);
        this.pHp.setContent(`Salud: ${this.player.W}/${this.player.maxW}`).computeLayout();
        this.computeLayout();
    }

    executeActions(actions, dt) {
        for (const a of actions) {
            const isRepeatable = REPEATABLE_ACTIONS.has(a.action);
            const shouldTrigger = isRepeatable ? a.isPressed : a.justPressed;
            if (!shouldTrigger) continue;

            if (a.action === ACTIONS.CANCEL) this.gameScene.openPauseMenu();
            if (a.action === ACTIONS.OPEN_MENU) this.gameScene.openMenu();
        }
    }
}

