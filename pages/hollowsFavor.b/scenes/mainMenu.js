import { MenuViewport } from "./menuViewport.js";
import { UIButton, UIContainer, UIHBox, UILabel, UISlider, UISpacer, UISpinner, UIVBox } from "../ui/widgets.js";
import { Globals } from "../globals.js";
import { StageManager } from "../stateManager.js";
import { OptionsMenu } from "./options.js";
import { NewGame } from "./newGame.js";
import { eventBus } from "../eventBus.js";

export class MainMenu extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        this.index = 0;
    }

    init() {
        this.createUI();
        eventBus.emit("SCENE_READY");
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);

        this.menu = new UIVBox('expand', 'fit', 0)
            .setAlign("center", "center");

        this.titleLabel = new UILabel("Hollow's Favor", 13)
            .setFont('bold')
            .setAlign("center");

        this.newGameBtn = new UIButton("NUEVA PARTIDA", "new_game")
            .setAlign("center");

        this.opBtn = new UIButton("OPCIONES", "open_options")
            .setAlign("center");

        this.keysBtn = new UIButton("TECLAS", "open_keymap")
            .setAlign("center");

        this.exitBtn = new UIButton("SALIR", "exit")
            .setAlign("center")
            .setSize(6, 1);

        this.menu.add(this.titleLabel);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.newGameBtn);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.opBtn);
        this.menu.add(this.keysBtn);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.exitBtn);

        this.root.add(this.menu);

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);

        this.elements = this.getNavigableElements(this.root);
        this.onResize(Globals.cols, Globals.rows);
        this.updateFocus();
    }

    interact(input) {
        if (input.action ===  "new_game") {
            StageManager.pushUI(new NewGame(0,0,Globals.cols,Globals.rows, 1));
        }
        if (input.action ===  "open_options") {
            StageManager.pushUI(new OptionsMenu(0,0,Globals.cols,Globals.rows, 1));
        }
        if (input.action ===  "open_keymap") console.log(input.action);
        if (input.action ===  "exit" || input.action === "escape") window.location.href = "../../";
        
        this.sync();
    }
}

