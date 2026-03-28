import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, LEFT, RIGHT, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { InGameOptionsMenu } from "./options.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { MainMenu } from "./mainMenu.js";

export class KeymapViewport extends MenuViewport {
    constructor() {
        super();
        this.fixed = false;
        this.index = 0;

        this.setSize(20, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('title')
                .setColor(1)
                .setMargin(0,0,1,0)
                .setContent("TECLAS", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Arriba")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("W", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Izquierda")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("A", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Abajo")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("S", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Derecha")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("D", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Confirmar")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("E", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Esperar")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("E", { bold: true })
                )
            )
            .add(
                new UIElement().setSize(GROW, FIT).setGap(1)
                .add(
                    new UIElement('label').setColor(4)
                    .setContent("Menu")
                    .setContentAlignment(LEFT, CENTER)
                    .setSize(GROW, FIT)
                )
                .add(
                    new UIElement('key').setColor(9)
                    .setContent("Esc | X", { bold: true })
                )
            )
            .add(
                new UIButton('Back', 'VOLVER', 'back')
                .setMargin(1,0,0,0)
                .setColor(2)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    interact(input) {
        if (input.action ===  "back" || input.action === "escape") {
            viewportManager.popUI();
        }
        if (input.action ===  "open_options") {
            viewportManager.pushUI(InGameOptionsMenu, { z: 20 });
        }
        if (input.action ===  "open_keymap");
        if (input.action ===  "customize") {
            viewportManager.popUI();
            this.gameScene.toggleCustomize();

            const customLabel = this.gameScene.customizing ? 'BLOQUEAR UI' : 'MOVER UI';
            this.customBtn.label = customLabel;
            this.customBtn.updateContent();
            this.computeLayout();
        }
        if (input.action ===  "resetui") {
            viewportManager.popUI();
            this.gameScene.resetUi();
        }
        if (input.action ===  "exit") {
            viewportManager.setScene(MainMenu);
        }
    }
}


