import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, LEFT, RIGHT, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { viewportManager } from "../viewportManager.js";
import { Globals } from "../globals.js";
import { Renderer } from "../renderer.js";
import { AudioController } from "../audio.js";
import { UIButton } from "../ui/ui-widgets.js";
import { eventBus } from "../eventBus.js";

export class ResetMenu extends MenuViewport {
    constructor() {
        super();
        this.fullscreen = false;
        this.fixed = false;

        this.index = 0;

        this.setSize(16, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('Title')
                .setColor(13)
                .setContent("REINICIAR", { bold: true })
            )
            .add(
                new UIElement('Tema')
                .setSize(GROW, FIT)
                .setMargin(1,0,0,0)
                .add(
                    new UIElement('Title')
                    .setSize(GROW, FIT)
                    .setColor(4)
                    .setContent("TEMA")
                    .setContentAlignment(LEFT, CENTER)
                )
                .add(
                    new UIButton('TemaBtn', '▪', 'theme')
                    .setSize(3,1)
                    .setColor(2)
                )
            )
            .add(
                new UIElement('Volumen')
                .setSize(GROW, FIT)
                .setMargin(1,0,0,0)
                .add(
                    new UIElement('Title')
                    .setSize(GROW, FIT)
                    .setColor(4)
                    .setContent("VOLUMEN")
                    .setContentAlignment(LEFT, CENTER)
                )
                .add(
                    new UIButton('VolumenBtn', '▪', 'volume')
                    .setSize(3,1)
                    .setColor(2)
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
        if (input.action ===  "theme") {
            Globals.paletteID = 0;
            Renderer.setDOMBackground();
            localStorage.setItem("paletteID", Globals.paletteID);
            eventBus.emit("themeSpinner_changed");
        }

        if (input.action ===  "volume") {
            Globals.volume = 20;
            AudioController.setVolume(Globals.volume);
            localStorage.setItem("volume", Globals.volume);
            eventBus.emit("volumeSlider_changed");
        }

        if (input.action ===  "back" || input.action === "escape") {
            viewportManager.popUI();
        }
    }
}


