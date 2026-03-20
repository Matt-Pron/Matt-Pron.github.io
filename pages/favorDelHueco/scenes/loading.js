import { Viewport } from "./viewport.js";
import { UIElement } from "../ui/ui-element.js";
import { CENTER, VERTICAL } from "../ui/ui-utils.js";
import { Globals } from "../globals.js";

export class LoadingScreen extends Viewport {
    constructor() {
        super();
        this.fullscreen = true;

        this.dot = new UIElement('Dot');
        this.dotPos = 0;
        this.direction = 2;
        this.lastUpdate = 0;
        this.speed = 200;


        this.setPosition(0, 0)
            .setSize(Globals.cols, Globals.rows)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setBackground(0)
            .add(
                new UIElement('Title')
                .setContent("Cargando")
                .setColor(4)
            )
            .add(
                this.dot
                .setContent('.')
                .setContentAlignment(CENTER, CENTER)
                .setColor(4)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    update(dt) {
        this.lastUpdate += dt;

        if (this.lastUpdate >= this.speed) {
            this.lastUpdate = 0;

            this.dotPos += this.direction;

            if (this.dotPos >= 7 || this.dotPos <= -6) {
                this.direction *= -1;
            }

            this.dot.setMargin(0, this.dotPos, 0,0);
            this.computeLayout();
        }
    }
}

