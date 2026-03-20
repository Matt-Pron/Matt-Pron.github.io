import { MenuViewport } from "./menuViewport.js";
import { UIButton, UIContainer, UILabel, UISpacer, UISpinner, UIVBox } from "../ui/widgets.js";
import { StageManager } from "../stateManager.js";
import { NameGen } from "../nameGen.js";
import { Globals } from "../globals.js";
import { GameState } from "../game.js";
import { World } from "./world.js";

export class NewGame extends MenuViewport {
    constructor(x, y, w, h, z, c) {
        super(x, y, w, h, z, c);
        this.index = 0;
        this.classes = ["Guerrero", "Mago", "Constructo", "Pirata", "Arquero"];
        this.races = ["Humano", "Elfo", "Goblin", "Orco", "Enano"];
        this.chars = ["@", "&", "Ω", "Ψ"];
        this.colors = [1, 5, 9, 10, 12, 14];

        this.charName = localStorage.getItem("charName");
        if (this.charName === null) {
            this.charName = NameGen.getRandom();
            localStorage.setItem("charName", this.charName);
        }
        this.cId = parseInt(localStorage.getItem("classIdx")) || 0;
        this.rId = parseInt(localStorage.getItem("raceIdx")) || 0;
        this.chId = parseInt(localStorage.getItem("charIdx")) || 0;
        this.colId = parseInt(localStorage.getItem("colorIdx")) || 0;

        this.createUI();
    }

    createUI() {
        this.root = new UIContainer().setSize(this.width, this.height);

        this.marginCon = new UIContainer('expand', 'fit')
            .setAlign("center", "center")
            .setBackground(true, 7);

        this.menu = new UIVBox('expand', 'fit')
            .setBackground(true, 8)
            .setMargin(1,1)
            .setAlign("center", "center");

        this.titleLabel = new UILabel("NUEVA PARTIDA", 13)
            .setFont('bold')
            .setAlign("center");

        this.NameBtn = new UIButton("Nombre: " + this.charName, "name")
            .setAlign("center");

        this.classSpinner = new UISpinner("Clase", this.classes[this.cId], "class")
            .setSize('expand')
            .setAlign("center");

        this.raceSpinner = new UISpinner("Raza", this.races[this.rId], "race")
            .setSize('expand')
            .setAlign("center");

        this.charSpinner = new UISpinner("Aspecto", this.chars[this.chId], "char", "label")
            .setSize('expand')
            .setAlign("center");

        this.colorSpinner = new UISpinner("Color", this.colors[this.colId], "color", "label")
            .setSize('expand')
            .setAlign("center");

        this.previewLabel = new UILabel(this.chars[this.chId])
            .setFont('bold')
            .setAlign("center");

        this.startBtn = new UIButton("COMENZAR", "start")
            .setAlign("center");

        this.backBtn = new UIButton("VOLVER", "back")
            .setAlign("center");

        this.menu.add(this.titleLabel);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.startBtn);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.NameBtn);
        this.menu.add(this.classSpinner);
        this.menu.add(this.raceSpinner);
        this.menu.add(this.charSpinner);
        this.menu.add(this.colorSpinner);
        this.menu.add(new UISpacer(0,1));
        this.menu.add(this.previewLabel);
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
        this.classSpinner.value = this.classes[this.cId];
        this.raceSpinner.value = this.races[this.rId];
        this.previewLabel.text = this.chars[this.chId];
        this.previewLabel.setColor(this.colors[this.colId]);

        if (this.width >= 24) this.marginCon.setSize(22, 'fit');
        else this.marginCon.setSize('expand', 'fit');

        this.root.measure();
        this.root.layout(0, 0, this.width, this.height);
    }

    interact(input) {
        const isDir = (input.dir !== undefined);

        if (input.action === "name") {
            let newName;
            do (newName = NameGen.getRandom());
            while (this.charName === newName);
            this.charName = newName;
            this.NameBtn.label = "Nombre: " + this.charName;
            localStorage.setItem("charName", this.charName);
        }

        if (input.action === "class") {
            if (isDir) {
                this.cId = (this.cId + input.dir + this.classes.length) % this.classes.length;
                localStorage.setItem("classIdx", this.cId);
                this.sync();
            }
        }

        if (input.action === "race") {
            if (isDir) {
                this.rId = (this.rId + input.dir + this.races.length) % this.races.length;
                localStorage.setItem("raceIdx", this.rId);
                this.sync();
            }
        }

        if (input.action === "char") {
            if (isDir) {
                this.chId = (this.chId + input.dir + this.chars.length) % this.chars.length;
                localStorage.setItem("charIdx", this.chId);
                this.sync();
            }
        }

        if (input.action === "color") {
            if (isDir) {
                this.colId = (this.colId + input.dir + this.colors.length) % this.colors.length;
                localStorage.setItem("colorIdx", this.colId);
                this.sync();
            }
        }

        if (input.action ===  "start") this.startGame();
        if (input.action ===  "back" || input.action === "escape") StageManager.popUI();
        
        this.sync();
    }

    startGame() {
        const player = {
            name: this.charName,
            class: this.classes[this.cId],
            race: this.races[this.rId],
            char: this.chars[this.chId],
            color: this.colors[this.colId]
        };
        Globals.player = player;
        Globals.gameState = new GameState(Globals.player);
        console.log(Globals.player);

        const worldViewport = new World(0, 0, this.width, this.height, 0);

       StageManager.setStage(worldViewport);
    }
}

