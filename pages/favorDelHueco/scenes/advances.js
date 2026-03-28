import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, HORIZONTAL, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { STAT_LABELS } from "../data/characteristics.js";

export class AdvanceMenu extends MenuViewport {
    constructor(args) {
        super();
        this.gameScene = args.gameScene;
        this.gameState = args.gameState;
        this.player = args.player;
        this.fixed = false;
        this.lastMenu = 'choices';

        this.setSize(24, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(1)
            .setBackground(0)
            .setBorderLine(4);

        this.buildMenu(this.lastMenu);
    }

    init() {
        this.computeLayout();
        super.init();
    }

    onFocus() {
        this.buildMenu(this.lastMenu);
    }

    buildMenu(menuType) {
        this.lastMenu = menuType;
        this.children = [];
        this.index = 0;

        this.add(
            new UIElement()
            .setColor(1)
            .setMargin(0,0,1,0)
            .setContent(`Bonus: ${this.player.bonus}`, { bold: true })
            .setContentAlignment(CENTER, CENTER)
        );

        this.add(this.generateMenu(menuType));

        this.add(
            new UIButton('Back', 'VOLVER', menuType === 'choices' ? 'back' : 'back_to_choices')
            .setMargin(3,0,0,0)
            .setColor(2)
        );

        this.computeLayout();
    }

    generateMenu(menu) {
        const newMenu = new UIElement();

        switch (menu) {
            case 'choices':
                newMenu.setFlow(HORIZONTAL)
                    .add(
                        new UIButton('', 'Mejoras', 'menu_stats')
                        .setSize(11, 5)
                        .setPadding(1)
                        .setColor(2)
                        .setBackground(0)
                        .setBorderLine(4))
                    .add(
                        new UIButton('', 'Profesión', 'menu_careers')
                        .setSize(11, 5)
                        .setPadding(1)
                        .setColor(2)
                        .setBackground(0)
                        .setBorderLine(4))
                break;

            case 'stats':
                newMenu.setFlow(VERTICAL)
                    .setAlignment(CENTER, CENTER)
                const availableStats = this.player.getAvailableAdvances();

                if (availableStats.length === 0) {
                    newMenu.add(new UIElement().setContent("No hay mejoras disponibles.").setColor(2));
                } else {
                    availableStats.forEach(stat => {
                        newMenu.add(
                            new UIButton('', `${STAT_LABELS[stat]}`, `advance_stat_${stat}`)
                            .setColor(2)
                            .setBackground(0)
                        );
                    });
                }
                break;

            case 'careers':
                newMenu.setFlow(VERTICAL)
                const availableCareers = this.player.getCareerOptions();

                if (availableCareers.length === 0) {
                    newMenu.add(new UIElement().setContent("No hay profesiones disponibles.").setColor(2));
                } else {
                    availableCareers.forEach(career => {
                        newMenu.add(
                            new UIButton('', `${career}`, `advance_career_${career}`)
                            .setSize(GROW, FIT)
                            .setColor(2)
                            .setBackground(0)
                        );
                    });
                }
                break;
        }

        return newMenu;
    }

    interact(input) {
        if (input.action === "menu_stats") {
            this.buildMenu('stats');
            return;
        }
        if (input.action === "menu_careers") {
            this.buildMenu('careers');
            return;
        }
        if (input.action === "back_to_choices") {
            this.buildMenu('choices');
            return;
        }

        if (input.action && input.action.startsWith("advance_stat_")) {
            const statId = input.action.replace("advance_stat_", "");
            if (this.player.spendBonus({ type: 'stat', id: statId })) {
                this.buildMenu('stats');
            }
            return;
        }

        if (input.action && input.action.startsWith("advance_career_")) {
            const careerId = input.action.replace("advance_career_", "");
            if (this.player.spendBonus({ type: 'career', id: careerId })) {
                this.buildMenu('careers');
            }
            return;
        }

        if (input.action ===  "back" || input.action === "escape") {
            viewportManager.popUI();
        }
    }
}

