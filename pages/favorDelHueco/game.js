import { Cleric, LightStand, Monster, Player } from "./entities.js";
import { getTileData } from "./data/tiles.js";
import { MRPAS } from "./fov.js";
import MonsterData from './data/monsters.json' with { type: 'json' };
import { WorldManager } from "./worldManager.js";
import { c_stats } from "./entitiesUtils.js";

export class GameState {
    constructor(playerData) {
        this.turn = 0;

        const mapWidth = 200;
        const mapHeight = 140;
        const chunkSize = 16;

        this.world = new WorldManager(mapWidth, mapHeight, chunkSize);

        this.player = new Player(0, 0, playerData);
        this.entities = [];

        this.fov = new MRPAS(this.world.width, this.world.height, (x, y) => {
            const tile = this.world.getTile(x, y);
            if (tile === undefined) return false;
            return getTileData(tile).transparent;
        });
    }

    // Entity
    getEntityAt(x, y) {
        const chunk = this.world.getChunk(x, y);
        if (!chunk) return undefined;

        for (const entity of chunk.entities) {
            if (entity.x === x && entity.y === y) return entity;
        }
        return undefined;
    }

    addEntity(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }

        const chunk = this.world.getChunk(entity.x, entity.y);
        if (chunk) {
            chunk.entities.add(entity);
            entity.currentChunk = chunk;
        }
    }

    updateEntityPosition(entity, nx, ny) {
        const oldChunk = entity.currentChunk || this.world.getChunk(entity.x, entity.y);
        const newChunk = this.world.getChunk(nx, ny);

        entity.x = nx;
        entity.y = ny;

        if (oldChunk !== newChunk) {
            if (oldChunk) oldChunk.entities.delete(entity);
            if (newChunk) {
                newChunk.entities.add(entity);
                entity.currentChunk = newChunk;
            }
        }
    }

    removeDeadEntities() {
        const deadEntities = this.entities.filter(e => e.isAlive === false);

        for (const dead of deadEntities) {
            const chunk = dead.currentChunk || this.world.getChunk(dead.x, dead.y);
            if (chunk) chunk.entities.delete(dead);
        }
        
        this.entities = this.entities.filter(e => e.isAlive !== false);

        const deadMonsters = deadEntities.filter(e => e instanceof Monster);
        for (let i = 0; i < deadMonsters.length; i++) {
            this.spawnSingleMonster();
        }
    }

    getValidSpawnPos(isPlayer = false, safeDist = 18) {
        let rx, ry, newPos = false;
        do {
            rx = Math.floor(Math.random() * this.world.width);
            ry = Math.floor(Math.random() * this.world.height);

            if (this.world.getTile(rx, ry) !== 1) continue; // mejor que no tenga collision TODO
            if (this.getEntityAt(rx, ry)) continue;

            if (!isPlayer && this.player) {
                const dist = Math.sqrt((rx - this.player.x)**2 + (ry - this.player.y)**2);
                if (dist < safeDist) continue;
            }
            newPos = true;
        } while (!newPos);

        return { x: rx, y: ry };
    }

    getRandomMonsterType() {
        const pLevel = this.player.level;

        const allTypes = Object.keys(MonsterData);
        let validTypes = allTypes.filter(type => MonsterData[type].level <= pLevel);

        if (validTypes.length === 0) validTypes = allTypes; // not needed if there are lvl 1s

        const weights = validTypes.map(type => {
            const mLevel = MonsterData[type].level;
            const diff = Math.max(0, pLevel - mLevel);
            return { type, weight: 1 / (diff * 0.4 + 1) };
        });

        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let rand = Math.random() * totalWeight;

        for (const w of weights) {
            rand -= w.weight;
            if (rand <= 0) {
                return w.type;
            }
        }
        return validTypes[0];
    }

    spawnSingleMonster() {
        const pos = this.getValidSpawnPos();
        if (!pos) return;

        const selectedType = this.getRandomMonsterType();
        this.addEntity(new Monster(selectedType, pos.x, pos.y));
    }

    populate(townData) {
        // // Hacer que spawnee hasta un maximo de enemigos
        // // Elegir los enemigos segun el nivel del jugador
        // // Aumentar el maximo de enemigos segun el nivel del jugador
        if (townData.clericPos) {
            this.addEntity(new Cleric(townData.clericPos.x, townData.clericPos.y));
        }

        const pPos = this.getValidSpawnPos(true);
        this.player.x = pPos.x;
        this.player.y = pPos.y;

        this.addEntity(this.player);

        const countMax = 50;
        for (let m = 0; m < countMax; m++) {
            const pos = this.getValidSpawnPos();
            if (pos) {
                const monsterType = this.getRandomMonsterType();
                this.addEntity(new Monster(monsterType, pos.x, pos.y));
            }
        }
    }

    async generateTown() {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./mapWorker.js', { type: 'module' });

            worker.onerror = (err) => {
                console.error("Worker crashed: ", err.message, "at line", err.lineno);
                reject(err);
            };

            worker.postMessage({ width: this.world.width, height: this.world.height });

            worker.onmessage = (e) => {
                const { map, torchPositions } = e.data;

                this.world.initChunks();
                for (let y = 0; y < this.world.width; y++) {
                    for (let x = 0; x < this.world.width; x++) {
                        this.world.setTile(x, y, map[y * this.world.width + x]);
                    }
                }

                torchPositions.forEach(p => {
                    this.addEntity(new LightStand(p.x, p.y, p.type));
                });
                this.populate(e.data);
                worker.terminate();
                resolve();
            };
        });
    }
}

