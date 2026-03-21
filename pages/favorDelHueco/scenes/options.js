import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { viewportManager } from "../viewportManager.js";
import { Globals } from "../globals.js";
import { Renderer } from "../renderer.js";
import { palettes } from "../palette.js";
import { AudioController } from "../audio.js";
import { UIButton, UISlider, UISpinner } from "../ui/ui-widgets.js";
import { ResetMenu } from "./reset.js";
import { eventBus } from "../eventBus.js";
import { TouchpadUI } from "./touchpad.js";

export class OptionsMenu extends MenuViewport {
    constructor() {
        super();
        this.fullscreen = false;
        this.fixed = false;

        this.index = 0;

        this.themeSpinner = new UISpinner('Theme Spinner', 'Tema', palettes[Globals.paletteID || 0].name, 'theme');
        this.fpsOptions = [10, 24, 30, 60, 72, 90, 120, 144, 240, 1];
        const savedFps = parseInt(localStorage.getItem('fps')) || 30;
        Globals.fps = savedFps;
        this.fpsIdx = this.fpsOptions.indexOf(Globals.fps);
        if (this.fpsIdx === -1) this.fpsIdx = 2;
        this.fpsSpinner = new UISpinner('FPS Spinner', 'FPS', this.fpsOptions[this.fpsIdx], 'fps');
        this.volumeSlider = new UISlider('Volume Slider', 'Volume', Globals.volume, 100, 'volume');
        const currentTpState = Globals.touchpad ? 'SÍ' : 'NO';
        this.touchpadSpinner = new UISpinner('Touchpad Spinner', 'Teclado V', currentTpState, 'touchpad');

        this.setSize(22, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('Title')
                .setColor(13)
                .setContent("OPCIONES", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                this.themeSpinner
                .setSize(GROW, FIT)
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                this.volumeSlider
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.touchpadSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.fpsSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                new UIButton('Reset', 'REINICIAR', 'reset')
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

        eventBus.on("themeSpinner_changed", () => {
            this.themeSpinner.setValue(palettes[Globals.paletteID || 0]?.name || "");
        });
        eventBus.on("volumeSlider_changed", () => {
            this.volumeSlider.setValue(Globals.volume);
        });
    }

    interact(input) {
        const isDir = input.dir !== undefined;
        const isValue = input.value !== undefined;

        if (input.action ===  "theme") {
            if (isDir) {
                Globals.paletteID = (Globals.paletteID + input.dir + palettes.length) % palettes.length;
                Renderer.setDOMBackground();
                localStorage.setItem("paletteID", Globals.paletteID);
                this.themeSpinner.setValue(palettes[Globals.paletteID || 0]?.name || "");
            }
        }

        if (input.action ===  "volume") {
            if (isValue) {
                Globals.volume = input.value;
                AudioController.setVolume(Globals.volume);
                localStorage.setItem("volume", Globals.volume);
                this.volumeSlider.setValue(Globals.volume);
            }
        }

        if (input.action ===  "fps") {
            if (isDir) {
                let currentIdx = this.fpsOptions.indexOf(Globals.fps);
                if (currentIdx === -1) currentIdx = 2;

                const newIdx = (currentIdx + input.dir + this.fpsOptions.length) % this.fpsOptions.length;

                Globals.fps = this.fpsOptions[newIdx];

                localStorage.setItem("fps", Globals.fps);
                this.fpsSpinner.setValue(Globals.fps);
                eventBus.emit("FPS_CHANGED");
            }
        }

        if (input.action ===  "touchpad") {
            if (isDir) {
                Globals.touchpad = !Globals.touchpad;

                localStorage.setItem("touchpad", Globals.touchpad);

                this.touchpadSpinner.setValue(Globals.touchpad ? 'SÍ' : 'NO');

                TouchpadUI.onResize(Globals.cols, Globals.rows);
            }
        }

        if (input.action ===  "reset") {
            viewportManager.pushUI(ResetMenu, { x: this.x + 8, y: this.y + 6, z: 10 });
        }
        if (input.action ===  "back" || input.action === "escape") {
            viewportManager.popUI();
        }
    }
}

export class InGameOptionsMenu extends MenuViewport {
    constructor() {
        super();
        this.fixed = false;

        this.index = 0;

        this.themeSpinner = new UISpinner('Theme Spinner', 'Tema', palettes[Globals.paletteID || 0].name, 'theme');
        this.fpsOptions = [10, 24, 30, 60, 72, 90, 120, 144, 240, 1];
        const savedFps = parseInt(localStorage.getItem('fps')) || 30;
        Globals.fps = savedFps;
        this.fpsIdx = this.fpsOptions.indexOf(Globals.fps);
        if (this.fpsIdx === -1) this.fpsIdx = 2;
        this.fpsSpinner = new UISpinner('FPS Spinner', 'FPS', this.fpsOptions[this.fpsIdx], 'fps');
        this.volumeSlider = new UISlider('Volume Slider', 'Volume', Globals.volume, 100, 'volume');
        const currentTpState = Globals.touchpad ? 'SÍ' : 'NO';
        this.touchpadSpinner = new UISpinner('Touchpad Spinner', 'Teclado V', currentTpState, 'touchpad');

        this.setSize(22, FIT)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(2)
            .setBackground(0)
            .setBorder(8)
            .add(
                new UIElement('Title')
                .setColor(13)
                .setContent("OPCIONES", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                this.themeSpinner
                .setSize(GROW, FIT)
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                this.volumeSlider
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.touchpadSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.fpsSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                new UIButton('Customize', 'PERSONALIZAR', 'customize')
                .setColor(2)
            )
            .add(
                new UIButton('Back', 'VOLVER', 'back')
                .setMargin(1,0,0,0)
                .setColor(2)
            );

        this.init();
    }

    init() {
        this.computeLayout();
        super.init();

        eventBus.on("themeSpinner_changed", () => {
            this.themeSpinner.setValue(palettes[Globals.paletteID || 0]?.name || "");
        });
        eventBus.on("volumeSlider_changed", () => {
            this.volumeSlider.setValue(Globals.volume);
        });
    }

    interact(input) {
        const isDir = input.dir !== undefined;
        const isValue = input.value !== undefined;

        if (input.action ===  "theme") {
            if (isDir) {
                Globals.paletteID = (Globals.paletteID + input.dir + palettes.length) % palettes.length;
                Renderer.setDOMBackground();
                localStorage.setItem("paletteID", Globals.paletteID);
                this.themeSpinner.setValue(palettes[Globals.paletteID || 0]?.name || "");
            }
        }

        if (input.action ===  "volume") {
            if (isValue) {
                Globals.volume = input.value;
                AudioController.setVolume(Globals.volume);
                localStorage.setItem("volume", Globals.volume);
                this.volumeSlider.setValue(Globals.volume);
            }
        }

        if (input.action ===  "fps") {
            if (isDir) {
                let currentIdx = this.fpsOptions.indexOf(Globals.fps);
                if (currentIdx === -1) currentIdx = 2;

                const newIdx = (currentIdx + input.dir + this.fpsOptions.length) % this.fpsOptions.length;

                Globals.fps = this.fpsOptions[newIdx];

                localStorage.setItem("fps", Globals.fps);
                this.fpsSpinner.setValue(Globals.fps);
                eventBus.emit("FPS_CHANGED");
            }
        }

        if (input.action ===  "touchpad") {
            if (isDir) {
                Globals.touchpad = !Globals.touchpad;

                localStorage.setItem("touchpad", Globals.touchpad);

                this.touchpadSpinner.setValue(Globals.touchpad ? 'SÍ' : 'NO');

                TouchpadUI.onResize(Globals.cols, Globals.rows);
                eventBus.emit("touchpad_changed");
            }
        }

        if (input.action ===  "customize") {
            // viewportManager.editMode = false
            //     ? viewportManager.editMode = true
            //     : viewportManager.editMode = false;
            const targets = viewportManager.getActiveViewports().filter(vp => vp.editMode);

            targets.forEach(vp => {
                vp.fixed = !vp.fixed;
            });

            viewportManager.popUI();
        }
        if (input.action ===  "back" || input.action === "escape") {
            viewportManager.popUI();
        }
    }
}

