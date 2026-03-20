import { Globals } from "../globals.js";
import { UIContainer, UIButton, UIHBox, UIVBox, UISpacer } from "./widgets.js";

export class TouchpadManager {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = Globals.cols;
        this.height = Globals.rows;

        this.active = Globals.touchpad;
        this.root = new UIContainer().setSize(Globals.cols, 6)
            .setBackground(true, 12);
        // this.elements = [];

        this.touchi = new UIHBox('expand', 'fit', 0)
            .setBackground(true, 8)
            .setAlign("center", "center");

        this.vertical = new UIVBox(3, 6, 0)
            .setBackground(true, 8)
            .setAlign("right", "center");

        // movement ʘ●
        this.btnW = new UIButton("▲", "move_up")
            .setSize(3, 'expand')
            .setAlign('center')
            .setBackground(true, 6);
        this.btnA = new UIButton("◄", "move_left")
            .setSize(3, 3)
            .setAlign('center')
            .setBackground(true, 8);
        this.btnS = new UIButton("▼", "move_down")
            .setSize(3, 'expand')
            .setAlign('center')
            .setBackground(true, 6);
        this.btnD = new UIButton("►", "move_right")
            .setSize(3, 3)
            .setAlign('center')
            .setBackground(true, 8);
        // ui
        this.btnWait = new UIButton("E", "confirm")
            .setBackground(true, 8)
            .setSize(3, 3);
        this.btnAim = new UIButton("Q", "target")
            .setBackground(true, 8)
            .setSize(3, 3);
        this.btnMenu = new UIButton("R", "open_menu")
            .setBackground(true, 8)
            .setSize(3, 3);

        this.touchi.add(this.btnWait);
        this.touchi.add(new UISpacer(1,0));
        this.touchi.add(this.btnAim);
        this.touchi.add(new UISpacer(1,0));
        this.touchi.add(this.btnMenu);
        this.touchi.add(new UISpacer(5,0));

        this.touchi.add(this.btnA);
        this.vertical.add(this.btnW);
        this.vertical.add(this.btnS);
        this.touchi.add(this.vertical);
        this.touchi.add(this.btnD);

        this.root.add(this.touchi);

        this.root.measure();
        this.root.layout(0, 0, Globals.cols, Globals.rows);
    }

    onResize(cols, rows) {
        this.x = 0;
        this.y = Globals.rows - 6;
        this.width = Globals.cols;
        this.height = 6;
        this.root.setSize(cols, 6);

        // this.btnW.setAlign('center', 'center')
        //     .setMargin(0,0,1,0)
        //     .setSize(3,3);
        // this.btnS.setAlign('center', 'center')
        //     .setOffset(0,2)
        //     .setSize(3,3);
        // this.btnA.setPosition(this.width - 9, 2);
        // this.btnS.setPosition(this.width - 6, 4);
        // this.btnD.setPosition(this.width - 3, 2);
        //
        // this.btnWait.setPosition(this.width - 17, 2);
        // this.btnAim.setPosition(this.width - 13, 2);
        // this.btnMenu.setPosition(this.width - 21, 2);
        
        this.root.measure();
        this.root.layout(0, 0, Globals.cols, Globals.rows);
    }

    getActionAt(lx, ly) {
        if (!this.active) return;

        return this.root.getActionAt(lx, ly);
    }

    draw(renderer) {
        if (!this.active) return;

        this.root.draw(renderer);
    }
}

 export const TouchpadUI = new TouchpadManager();

