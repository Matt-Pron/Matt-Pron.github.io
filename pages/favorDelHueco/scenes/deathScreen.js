import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, VERTICAL } from "../ui/ui-utils.js";
import { Viewport } from "./viewport.js";
import { ACTIONS } from "../data/actions.js";
import { viewportManager } from "../viewportManager.js";
import { GameStatistics } from "./gameStatistics.js";

export class DeathScreen extends Viewport {
    constructor(args) {
        super();
        this.pack = args;

        this.setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setBackground(0)
            .add(
                new UIElement('Title')
                .setContent("El Hueco te devora.", { bold: true })
                .setColor(5)
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
        viewportManager.setScene(GameStatistics, this.pack);
    }
}

