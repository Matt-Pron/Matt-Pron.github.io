import { Globals } from "../globals.js";
import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, VERTICAL } from "../ui/ui-utils.js";
import { AudioController } from "../audio.js";
import { Viewport } from "./viewport.js";
import { ACTIONS } from "../data/actions.js";
import { MainMenu } from "./mainMenu.js";
import { viewportManager } from "../viewportManager.js";

export class SplashScreen extends Viewport {
    constructor() {
        super();

        this.setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setBackground(0)
            .add(
                new UIElement('Title')
                .setContent("FAVOR DEL CLARO", { bold: true })
                .setColor(13)
            )
            .add(
                new UIElement('TextBox')
                .setContent('Presiona una tecla para comenzar.')
                .setContentAlignment(CENTER, CENTER)
                .setSize(18, FIT)
                .setMargin(1,0,0,0)
                .setColor(2)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    handleInput(rawState, dt) {
        if (rawState.keys.size > 0) {
            this.advance();
            return;
        }

        if (rawState.pointer.justPressed) {
            this.advance();
            return;
        }

        super.handleInput(rawState, dt);
    }

    executeActions(actions, dt) {
        for (const a of actions) {
            if (a.action === ACTIONS.POINTER_MOVE) continue;

            this.advance();
            return;
        }
    }

    advance() {
        AudioController.setVolume(Globals.volume);
        AudioController.startTheme();
        viewportManager.setScene(MainMenu);
    }
}

