import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { InGameOptionsMenu } from "./options.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { MainMenu } from "./mainMenu.js";

export class PauseMenu extends MenuViewport {
    constructor() {
        super();
        this.fixed = false;
        this.index = 0;

        this.customBtn = new UIButton('Customize', 'PERSONALIZAR', 'customize');

        this.setSize(FIT, FIT)
            // Math.floor(Globals.cols / 3) * 2,
            // FIT)
            // .setPosition(Globals.cols - Math.floor(this.computedW / 2),
                // Globals.rows - Math.floor(this.computedH / 2))
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('paused')
                .setColor(1)
                .setMargin(1,0,1,0)
                .setContent("EN PAUSA", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIButton('Back', 'VOLVER', 'back')
                .setColor(2)
            )
            .add(
                new UIButton('Options', 'OPCIONES', 'open_options')
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                new UIButton('Keymap', 'TECLAS', 'open_keymap')
                .setColor(2)
            )
            .add(
                this.customBtn
                .setColor(2)
            )
            .add(
                new UIButton('Exit', 'SALIR DEL JUEGO', 'exit')
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
            this.customBtn.label = this.customBtn.label === 'PERSONALIZAR'
                ? 'BLOQUEAR UI' : 'PERSONALIZAR';
            this.customBtn.updateContent();
            this.computeLayout();
        }
        if (input.action ===  "exit") {
            viewportManager.setScene(MainMenu);
        }
    }
}

