import { MenuViewport } from "./menuViewport.js";
import { UIButton, UIContainer, UILabel, UIParagraph, UIScrollBox, UISlider, UISpacer, UISpinner, UIVBox } from "../ui/widgets.js";
import { Globals } from "../globals.js";
import { palettes } from "../palette.js";
import { Renderer } from "../renderer.js";
import { StageManager } from "../stateManager.js";
import { AudioController } from "../audio.js";
import { InputHandler } from "../input.js";

export class OptionsMenu extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        this.index = 0;
        this.createUI();
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);

        this.marginCon = new UIContainer('expand', 'fit')
            .setAlign("center", "center")
            .setBackground(true, 7);

        this.menu = new UIVBox('expand', 'fit', 0)
            .setBackground(true, 8)
            .setMargin(1,1)
            .setAlign("center", "center");

        this.titleLabel = new UILabel("OPCIONES", 13)
            .setFont('bold')
            .setAlign("center");

        this.themeSpinner = new UISpinner("Tema", palettes[Globals.paletteID || 0].name, "theme")
            .setSize('expand', 2)
            .setAlign("center");

        this.volumeSlider = new UISlider("Volume", Globals.volume, 100, "volume", 5)
            .setSize('expand', 2)
            .setAlign("center");

        this.resetBtn = new UIButton("REINICIAR", "reset")
            .setAlign("center");

        this.backBtn = new UIButton("VOLVER", "back")
            .setAlign("center")
            .setSize(6, 1);

        this.menu.add(this.titleLabel);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.themeSpinner);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.volumeSlider);
        this.menu.add(this.resetBtn);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.backBtn);

        this.marginCon.add(this.menu);

        this.root.add(this.marginCon);

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);

        this.elements = this.getNavigableElements(this.root);
        this.onResize(Globals.cols, Globals.rows);
        this.updateFocus();
    }

    sync() { // Necesario si hay UI activable horizontal
        this.themeSpinner.value = palettes[Globals.paletteID || 0]?.name || "";
        this.volumeSlider.value = Globals.volume || 0;

        if (this.width >= 24) this.marginCon.setSize(22, 'fit');
        else this.marginCon.setSize('expand', 'fit');

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);
    }

    interact(input) {
        const isDir = input.dir !== undefined;
        const isValue = input.value !== undefined;

        if (input.action ===  "theme") {
            if (isDir) {
                Globals.paletteID = (Globals.paletteID + input.dir + palettes.length) % palettes.length;
                Renderer.setDOMBackground();
                localStorage.setItem("paletteID", Globals.paletteID);
                this.sync();
            }
        }

        if (input.action ===  "volume") {
            if (isValue) {
                Globals.volume = input.value;
                AudioController.setVolume(Globals.volume);
                localStorage.setItem("volume", Globals.volume);
                this.sync();
            }
        }

        if (input.action ===  "reset") {
            if (confirm("¿Borrar todo?")) {
                localStorage.clear();
                alert("Datos borrados.");
                location.reload();
            }
            return;
        }
        if (input.action ===  "back" || input.action === "escape") StageManager.popUI();
        
        this.sync();
    }
}

