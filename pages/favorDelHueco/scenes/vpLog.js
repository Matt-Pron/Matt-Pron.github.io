import { Viewport } from "./viewport.js";
import { UIElement } from "../ui/ui-element.js";
import { BOTTOM, GROW, LEFT } from "../ui/ui-utils.js";
import { eventBus } from "../eventBus.js";

export class LogViewport extends Viewport {
    constructor({ gameState }) {
        super();
        this.fixed = true;
        this.editMode = true;
        this.gameState = gameState;

        this.log = ['Hola, hola, camarada!'];
        this.lastTurnReport = null;
        this.logBox = new UIElement();

        this.setBackground(0)
            .setBorderLine(3)
            .setPadding(1)
            .add(
                this.logBox
                .setSize(GROW, GROW)
                .setContentAlignment(LEFT, BOTTOM)
            );

        this.updateLog("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam suscipit tincidunt dignissim. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse viverra sapien augue, blandit gravida mi vulputate in. Aliquam laoreet nisi nec laoreet fringilla. Sed sed ex non lacus convallis tincidunt non aliquam magna. Nunc faucibus condimentum ante, quis pharetra sem. Maecenas consequat facilisis urna at ultrices. Vivamus eget orci quis orci gravida aliquam. Nulla malesuada leo nulla, nec vulputate libero feugiat in. In quis velit malesuada, faucibus mauris sed, mollis enim. Nulla vel tristique velit. Vestibulum feugiat ex vitae fringilla semper. Duis posuere orci quis nisi finibus, eget mattis tortor pharetra.");

        eventBus.on("on_message", (msg) => {
            this.appendMessage(msg);
        });

        eventBus.on("end_of_turn", () => {
            this.report();
        });
    }

    appendMessage(msg) {
        this.lastTurnReport += ` ${msg}`;
    }

    report() {
        if (this.lastTurnReport !== null) {
            this.log.push(this.lastTurnReport);
            this.updateLog(this.lastTurnReport);
        }
        this.lastTurnReport = '';
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
}

