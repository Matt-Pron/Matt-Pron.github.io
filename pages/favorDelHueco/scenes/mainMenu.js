import { UIElement } from "../ui/ui-element.js";
import { CENTER, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { NewGame } from "./newGame.js";
import { OptionsMenu } from "./options.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";

export class MainMenu extends MenuViewport {
    constructor() {
        super();
        this.index = 0;

        this.setPosition(0, 0)
            .setSize(Globals.cols, Globals.rows)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .add(
                new UIElement('Title')
                .setColor(13)
                .setContent("Favor del Claro", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIButton('New Game', 'NUEVA PARTIDA', 'new_game')
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                new UIButton('Quests', 'MISIONES', 'open_quests')
                .setMargin(1,0,0,0)
                .setColor(2)
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
                new UIButton('Exit', 'SALIR', 'exit')
                .setMargin(1,0,0,0)
                .setColor(2)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    interact(input) {
        if (input.action ===  "new_game") {
            viewportManager.setScene(NewGame);
        }
        if (input.action ===  "open_options") {
            viewportManager.pushUI(OptionsMenu, { x: 4, y: 4, z: 10 });
        }
        if (input.action ===  "open_keymap");
        if (input.action ===  "exit" || input.action === "escape") window.location.href = "../../";
    }
}

