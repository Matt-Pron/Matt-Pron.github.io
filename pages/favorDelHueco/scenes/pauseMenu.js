import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { InGameOptionsMenu } from "./options.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { MainMenu } from "./mainMenu.js";

export class PauseMenu extends MenuViewport {
    constructor(gameScene) {
        super();
        this.gameScene = gameScene;
        this.fixed = false;
        this.index = 5;

        this.customBtn = new UIButton('Customize', 'MOVER UI', 'customize');
        this.resetCustomBtn = new UIButton('Reset custom', 'R', 'resetui');

        this.setSize(20, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('paused')
                .setColor(1)
                .setMargin(0,0,1,0)
                .setContent("EN PAUSA", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIButton('Options', 'OPCIONES', 'open_options')
                .setColor(2)
            )
            .add(
                new UIButton('Keymap', 'TECLAS', 'open_keymap')
                .setColor(2)
            )
            .add(
                new UIElement('Custom options')
                    .setGap(1)
                    .add(
                        this.customBtn
                            .setColor(2)
                    )
                    .add(
                        this.resetCustomBtn
                            .setColor(2)
                    )
            )
            .add(
                new UIButton('Exit', 'ABANDONAR', 'exit')
                .setMargin(1,0,0,0)
                .setColor(2)
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
            const targets = viewportManager.getActiveViewports().filter(vp => vp.editMode);

            targets.forEach(vp => {
                vp.fixed = !vp.fixed;
            });

            viewportManager.popUI();
            this.customBtn.label = this.customBtn.label === 'MOVER UI'
                ? 'BLOQUEAR UI' : 'MOVER UI';
            this.customBtn.updateContent();
            this.computeLayout();
        }
        if (input.action ===  "resetui") {
            this.gameScene.resetUi();
        }
        if (input.action ===  "exit") {
            viewportManager.setScene(MainMenu);
        }
    }
}

