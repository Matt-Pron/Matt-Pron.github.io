import Panel from './panel.js';
//import { random }  from './math.js';
import { generateDijkstraMap } from './dijkstraMap.js';
import { generateTown } from './town.js';
import { populateMap, Player, Monster, Cleric } from './entities.js';
import { startTheme } from './audio.js';
import { eventBus } from './eventBus.js';
import * as Renderer from './renderer.js';
import { getTileData } from './data/tiles.js';

// Map Settings
let mapWidth = 100;
let mapHeight = 70;

let townData;
do {
    townData = generateTown(mapWidth, mapHeight);
} while (townData === 0);
const map = townData.map;

let entities = [];
populateMap(map, entities, townData.clericPos);
let player = entities.find(e => e instanceof Player);

eventBus.on('on_player_stats_changed', () => {
    Renderer.draw.info(player);
});

Renderer.updateLayout();
Renderer.updateCamera(player, mapWidth, mapHeight);
Renderer.draw.all(map, entities, player);

window.addEventListener('resize', function() {
    Renderer.updateLayout();
    Renderer.updateCamera(player, mapWidth, mapHeight);
    Renderer.draw.all(map, entities, player);
});

let isBusy = false;

async function handleMonsterTurns() {
    const dMap = generateDijkstraMap(map, player.x, player.y, 20, entities);

    entities = entities.filter(entity => entity.isAlive);

    for (let entity of entities) {
        if (entity instanceof Monster) {
            entity.moveTowards(dMap, entities, player);
        }
    }

    Renderer.updateCamera(player, mapWidth, mapHeight);
    Renderer.draw.all(map, entities, player);
}

async function lookAt(x, y) {
    if (isBusy) return;

    let lx = player.x + x;
    let ly = player.y + y;

    const tile = getTileData(map[ly][lx]);
    const entity = entities.find(e => e.x === lx && e.y === ly);

    if (entity) {
        if (entity instanceof Monster) {
            player.attack(entity);
        } else if (entity instanceof Cleric) {
            entity.interact(player);
        }
    } else {
        if (tile.collision) {
            const msg = tile.msg ?? 'El camino está bloqueado.';
            eventBus.emit('on_message', msg);
        } else {
            player.x = lx;
            player.y = ly;

            eventBus.emit('on_message', ``);
            Renderer.updateCamera(player, mapWidth, mapHeight);
            Renderer.draw.map(map, entities);
        }
    }

    isBusy = true;
    await handleMonsterTurns();
    isBusy = false;
}

let musicIsPlaying = false;

window.addEventListener('click', startMusic);
window.addEventListener('keydown', startMusic);

async function startMusic() {
    if (musicIsPlaying) return;

    const success = await startTheme();

    if (success) {
        musicIsPlaying = true;

        window.removeEventListener('click', startMusic);
        window.removeEventListener('keydown', startMusic);
    }
}

startMusic();

window.addEventListener('keydown', e => {
    if (e === 'w' || e === 'a' || e === 's' || e === 'd' || e === 'e') { e.preventDefault(); }
    const keyMap = {
        'w': {x:0, y:-1},
        'a': {x:-1, y:0},
        's': {x:0, y:1},
        'd': {x:1, y:0},
        'e': {x:0, y:0}
    };
    let k = e.key.toLowerCase();
    
    let move = keyMap[k];
    if (move) lookAt(move.x, move.y);
});

let moveInterval = null;

const startMoving = (btn) => {
    if (moveInterval) clearInterval(moveInterval);

    handleMovement(btn);

    moveInterval = setInterval(() => {
        handleMovement(btn);
    }, 150);

};

const stopMoving = () => {
    // if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    // }
};

 window.addEventListener('touchstart', (e) => {
     const touch = e.touches[0];
     const btn = Renderer.isLayoutClickable(touch);
     if (btn) startMoving(btn);
 }, { passive: false });

 window.addEventListener('touchend', stopMoving);
 window.addEventListener('touchcancel', stopMoving);

function handleMovement(btn) {
        if (btn === 'up') lookAt(0,-1);
        else if (btn === 'left') lookAt(-1,0);
        else if (btn === 'down') lookAt(0,1);
        else if (btn === 'right') lookAt(1,0);
}

eventBus.on('on_entity_dead', (entity) => {
    if (entity instanceof Player) {
        const i = entities.indexOf(entity);
        entities.splice(i, 1);
        player = null;
        populateMap(map, entities, townData.clericPos);
        player = entities.find(e => e instanceof Player);
        Renderer.updateCamera(player, mapWidth, mapHeight);
        Renderer.draw.map(map, entities);
        eventBus.emit('on_message', `Has muerto.`);
    } else {
        populateMap(map, entities, townData.clericPos);
        eventBus.emit('on_message', `${entity.name} ha muerto.`);
    }
});

