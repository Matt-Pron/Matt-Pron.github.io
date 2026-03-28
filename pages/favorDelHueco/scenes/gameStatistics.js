import { UIElement } from "../ui/ui-element.js";
import { CENTER, FIT, GROW, TOP, VERTICAL } from "../ui/ui-utils.js";
import { MenuViewport } from "./menuViewport.js";
import { Globals } from "../globals.js";
import { UIButton } from "../ui/ui-widgets.js";
import { viewportManager } from "../viewportManager.js";
import { MainMenu } from "./mainMenu.js";

export class GameStatistics extends MenuViewport {
    constructor(args) {
        super();
        this.gameState = args.gameState;
        this.player = args.player;
        this.index = 0;

        this.killedMonsters = this.countKilledMonsters(this.gameState.killedEntities);

        this.setPosition(0, 0)
            .setSize(Globals.cols, Globals.rows)
            .setFlow(VERTICAL)
            .setAlignment(CENTER, CENTER)
            .add(
                new UIElement('Title')
                .setColor(1)
                .setContent("Estadísticas", { bold: true })
                .setContentAlignment(CENTER, CENTER)
            )
            .add(
                new UIElement()
                .setMargin(1,0,0,0)
                .setSize(18, FIT)
                .add(
                    new UIElement()
                    .setSize(GROW, FIT)
                    .setColor(3)
                    .setContent('Experiencia:')
                )
                .add(
                    new UIElement()
                    .setColor(3)
                    .setContent(this.gameState.player.exp.toString())
                )
            )
            .add(
                new UIElement()
                .setSize(18, FIT)
                .add(
                    new UIElement()
                    .setSize(GROW, FIT)
                    .setColor(3)
                    .setContent('Turnos:')
                )
                .add(
                    new UIElement()
                    .setColor(3)
                    .setContent(this.gameState.turn.toString())
                )
            )
            .add(this.killedMonsters)
            .add(
                new UIButton('Exit', 'SALIR', 'exit')
                .setMargin(1,0,0,0)
                .setColor(2)
            );
    }

    init() {
        this.computeLayout();
        super.init();
    }

    countKilledMonsters(KMArray) {
        const killedList = new UIElement().setFlow(VERTICAL)
            .setAlignment(CENTER, TOP)
            .setMargin(1,0,0,0)
                .add(new UIElement()
                    .setColor(4)
                    .setContent("Enemigos derrotados:", { bold: true })
                );

        const counts = KMArray.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        Object.entries(counts).forEach(([type, count]) => {
            const row = new UIElement()
                .setSize(16, FIT)
                .add(new UIElement()
                    .setColor(3)
                    .setSize(GROW, FIT)
                    .setContent(`${type}s:`)
                )
                .add(new UIElement()
                    .setColor(3)
                    .setContent(count.toString())
                );
            killedList.add(row);
        });

        return killedList;
    }

    interact(input) {
        if (input.action ===  "exit" || input.action === "escape") {
            viewportManager.setScene(MainMenu);
        }
    }
}


