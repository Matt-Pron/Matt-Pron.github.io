import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { InGameOptionsMenu } from "./options.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { MainMenu } from "./mainMenu.js";
import { KeymapViewport } from "./keymap.js";
import { GameStatistics } from "./gameStatistics.js";

export class PauseMenu extends MenuViewport {
    constructor(args) {
        super();
        this.gameScene = args.gameScene;
        this.gameState = args.gameState;
        this.fixed = false;
        this.index = 5;

        const customLabel = this.gameScene.customizing ? 'BLOQUEAR UI' : 'MOVER UI';

        this.customBtn = new UIButton('Customize', customLabel, 'customize');
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
        if (input.action ===  "open_keymap") {
            viewportManager.pushUI(KeymapViewport, { x: 4, y: 4, z: 20 });
        }
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
            this.gameScene.exit();
        }
    }
}

