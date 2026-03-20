import { MainMenu } from "./mainMenu.js";
import { AudioController } from "../audio.js";
import { Globals } from "../globals.js";
import { StageManager } from "../stateManager.js";
import { MenuViewport } from "./menuViewport.js";
import { UIContainer, UILabel, UISpacer, UIVBox } from "../ui/widgets.js";
import { eventBus } from "../eventBus.js";

export class SplashScreen extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
    }

    init() {
        this.createUI();
        eventBus.emit("SCENE_READY");
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);

        this.menu = new UIVBox('expand', 'fit', 0)
            .setAlign("center", "center");

        this.titleLabel = new UILabel("HOLLOW'S FAVOR", 13)
            .setFont('bold')
            .setAlign("center");

        this.suba = new UILabel("Presiona una tecla", 2)
            .setAlign("center");

        this.subb = new UILabel("para comenzar", 2)
            .setAlign("center");

        this.menu.add(this.titleLabel);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.suba);
        this.menu.add(this.subb);

        this.root.add(this.menu);

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);

        this.onResize(Globals.cols, Globals.rows);
    }

    // onResize(newCols, newRows) {
    //     super.onResize(newCols, newRows);
    //     this.sync();
    // }

    handleInput(input) {
        if (input.action === "click" || input.action === "confirm") {
            AudioController.setVolume(Globals.volume);
            AudioController.startTheme();
            StageManager.setStage(MainMenu);
        }
    }

    // handlePointer(action) {
    //     console.log("hi from pointer");
    //     if (action === 'down' || action === 'touchstart') this.advance();
    // }
}

