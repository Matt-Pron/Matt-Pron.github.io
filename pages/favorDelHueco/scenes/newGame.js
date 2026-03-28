import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { viewportManager } from "../viewportManager.js";
import { UIButton, UISpinner } from "../ui/ui-widgets.js";
import { NameGen } from "../nameGen.js";

import { World } from "./world.js";
import { MainMenu } from "./mainMenu.js";
import { GameScene } from "./gameScene.js";
import { STARTER_CAREERS } from "../data/careers.js";

export class NewGame extends MenuViewport {
    constructor() {
        super();
        this.fullscreen = true;
        this.fixed = true;

        this.index = 0;
        // this.classes = ["Guerrero", "Mago", "Constructo", "Pirata", "Arquero"];
        this.classes = STARTER_CAREERS;
        // Guerrero: STR++, CON+, DEX+, Arma y armor iniciales
        // Mago: Acceso a hechizos, sin armas ni stats
        // constructo: mmmmmm Tons of armor, high base dmg, no weapons, slow
        // pirata: DEX++, CON+, STR+, arma, pistola
        // explorador: DEX++, arco, lightradius
        // clerigo: STR+, CON+, armadura, escudo, heal
        // brujo: STR+, CON+, mandoble, armadura, maldiciones
        this.races = ["Humano", "Elfo", "Goblin", "Orco", "Enano"];
        this.chars = ["@", "&", "Ω", "Ψ", "Ŏ", "Ơ", "☺"];
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

        this.nameBtn = new UIButton('Name', 'Nombre: ' + this.charName, 'name').setContentAlignment(CENTER, CENTER);
        this.classSpinner = new UISpinner('Class Spinner', 'Clase', this.classes[this.cId || 0], 'class');
        this.raceSpinner = new UISpinner('Race Spinner', 'Raza', this.races[this.rId || 0], 'race');
        this.charSpinner = new UISpinner('Char Spinner', 'Aspecto', this.chars[this.chId || 0], 'char', 'label');
        this.colorSpinner = new UISpinner('Color Spinner', 'Color', this.colors[this.colId || 0], 'color', 'label');
        this.preview = new UIElement('Preview');

        // TODO Favor (bonus inicial)

        this.setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .setPadding(1,1,1,1)
            .setBackground(0)
            .add(
                new UIElement('Title')
                .setContent("NUEVA PARTIDA", { bold: true })
                .setColor(13)
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIButton('Start', 'COMENZAR', 'start')
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                this.nameBtn
                .setMargin(1,0,0,0)
                .setColor(2)
            )
            .add(
                this.classSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.raceSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.charSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.colorSpinner
                .setSize(GROW, FIT)
                .setColor(2)
            )
            .add(
                this.preview
                .setContent(this.chars[this.chId], { bold: true })
                .setMargin(1,0,1,0)
                .setContentAlignment(CENTER, CENTER)
                .setColor(this.colors[this.colId])
            )
            .add(
                new UIButton('Back', 'VOLVER', 'back')
                .setColor(2)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    interact(input) {
        const isDir = (input.dir !== undefined);

        if (input.action === "name") {
            let newName;
            do (newName = NameGen.getRandom());
            while (this.charName === newName);
            this.charName = newName;
            localStorage.setItem("charName", this.charName);
            this.nameBtn.label = "Nombre: " + this.charName;
            this.nameBtn.updateContent();
            this.computeLayout();
        }

        if (input.action === "class") {
            if (isDir) {
                this.cId = (this.cId + input.dir + this.classes.length) % this.classes.length;
                localStorage.setItem("classIdx", this.cId);
                this.classSpinner.setValue(this.classes[this.cId]);
            }
        }

        if (input.action === "race") {
            if (isDir) {
                this.rId = (this.rId + input.dir + this.races.length) % this.races.length;
                localStorage.setItem("raceIdx", this.rId);
                this.raceSpinner.setValue(this.races[this.rId]);
            }
        }

        if (input.action === "char") {
            if (isDir) {
                this.chId = (this.chId + input.dir + this.chars.length) % this.chars.length;
                localStorage.setItem("charIdx", this.chId);
                this.preview.setContent(this.chars[this.chId], { bold: true });
                this.computeLayout();
            }
        }

        if (input.action === "color") {
            if (isDir) {
                this.colId = (this.colId + input.dir + this.colors.length) % this.colors.length;
                localStorage.setItem("colorIdx", this.colId);
                this.preview.setColor(this.colors[this.colId]);
            }
        }

        if (input.action ===  "start") this.startGame();
        if (input.action ===  "back" || input.action === "escape") viewportManager.setScene(MainMenu);
    }

    startGame() {
        const playerData = {
            name: this.charName,
            class: this.classes[this.cId],
            race: this.races[this.rId],
            char: this.chars[this.chId],
            color: this.colors[this.colId],
        };

        viewportManager.setScene(GameScene, { playerData });
    }
}

