import { entities } from "./entities.js";

export class GameState {
    constructor(player) {
        this.turn = 0;

        this.player = player;

        // Map Settings
        this.mapWidth = 200;
        this.mapHeight = 140;
        this.map = [];

        this.entities = [];
    }

    async generateTown() {
        return new Promise((resolve) => {
            const worker = new Worker('./mapWorker.js', { type: 'module' });
            worker.postMessage({ width: this.mapWidth, height: this.mapHeight });

            worker.onmessage = (e) => {
                this.map = e.data.map;
                entities.map = this.map;
                worker.terminate();
                resolve(true);
            };
            console.log("World generated for", this.player.char);
        });
    }
}

// const entities = [];
// populateMap(map, entities, townData.clericPos);
// const player = entities.find(e => e instanceof Player);
