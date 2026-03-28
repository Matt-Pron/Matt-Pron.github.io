import { Viewport } from "./viewport.js";
import { UIElement } from "../ui/ui-element.js";
import { BOTTOM, GROW, LEFT } from "../ui/ui-utils.js";
import { eventBus } from "../eventBus.js";
import { ACTIONS, REPEATABLE_ACTIONS } from "../data/actions.js";

export class LogViewport extends Viewport {
    constructor(args) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.gameState = args.gameState;
        this.gameScene = args.gameScene;

        this.log = [];
        this.turnMessages = [];
        this.logBox = new UIElement();

        this.setBackground(0)
            .setBorderLine(3)
            .setPadding(1)
            .add(
                this.logBox
                .setSize(GROW, GROW)
                .setContentAlignment(LEFT, BOTTOM)
            );

        // this.updateLog("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam suscipit tincidunt dignissim. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse viverra sapien augue, blandit gravida mi vulputate in. Aliquam laoreet nisi nec laoreet fringilla. Sed sed ex non lacus convallis tincidunt non aliquam magna. Nunc faucibus condimentum ante, quis pharetra sem. Maecenas consequat facilisis urna at ultrices. Vivamus eget orci quis orci gravida aliquam. Nulla malesuada leo nulla, nec vulputate libero feugiat in. In quis velit malesuada, faucibus mauris sed, mollis enim. Nulla vel tristique velit. Vestibulum feugiat ex vitae fringilla semper. Duis posuere orci quis nisi finibus, eget mattis tortor pharetra.");
        this.updateLog(`${args.player.name} despierta en el Hueco.`)

        eventBus.on("on_message", (msg) => {
            this.appendMessage(msg);
        });

        eventBus.on("end_of_turn", () => {
            this.report();
        });
    }

    appendMessage(msg) {
        this.turnMessages.push(msg);
    }

    report() {
        if (this.turnMessages.length > 0) {
            const combined = this.turnMessages.join(' ');
            this.log.push(combined);
            this.updateLog(combined);
        }
        this.turnMessages = [];
    }

    updateLog(message) {
        this.logBox.setContent(message);
        this.computeLayout();
        // const logs = this.gameState.logs && this.gameState.logs.length > 0
        //     ? this.gameState.logs
        // : ["Bienvenido, santurrón!"];
            // : [];

        // const maxLines = this.computedH - 2;
        // const displayLogs = logs.slice(-maxLines);

        // displayLogs.forEach((log, i) => {
        //     renderer.addText(log, this.globalX + 1, this.globalY + 1 + i, 1);
        // });
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

