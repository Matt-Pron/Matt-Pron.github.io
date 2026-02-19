import Panel from './panel.js';
import Vector2, { random }  from './math.js';
import { generateDijkstraMap } from './dijkstraMap.js';
import { generateTown } from './town.js';
import { populateMap, checkAndRespawn, Player, Monster, Orc, Goblin, Hydra, Cleric } from './entities.js';
import { startTheme } from './audio.js';

const canvas = document.querySelector('canvas');
const screen = canvas.getContext('2d');

// Settings
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

function kill(entity) {
    const index = entities.indexOf(entity);

    if (index !== -1) {
        entities.splice(index, 1);
        checkAndRespawn(map, entities);
    }
    player = entities.find(e => e instanceof Player);
}

// Pallete
let BLACK = '#000000';
let DGREY = '#626262';
let GREY = '#898989';
let LGREY = '#adadad';
let WHITE = '#ffffff';
let BRICK = '#9f4e44';
let SALMON = '#cb7e75';
let GBROWN = '#6d5412';
let BROWN = '#a1683c';
let YELLOW = '#c9d487';
let LGREEN = '#9ae29b';
let GREEN = '#5cab5e';
let CYAN = '#6abfc6';
let PURPLE = '#887ecb';
let BLUE = '#50459b';
let PINK = '#a057a3';

// Screen
let screenX, screenY = 0;
let cWidth, cHeight = 0;
let fontSize = 32;
let fontSizeDelta = 1.0;
let fontX = Math.floor(fontSize * .65);
let fontY = Math.floor(fontSize * 0.9);

const dpr = window.devicePixelRatio || 1;

function updateScreenSize(){
    screenX = Math.floor((window.innerWidth - 20) / fontX);
    screenY = Math.floor((window.innerHeight - 20) / fontY);

    cWidth = screenX * fontX;
    cHeight = screenY * fontY;

    canvas.width  = cWidth * dpr;
    canvas.height = cHeight * dpr;
    screen.scale(dpr, dpr);

    canvas.style.width  = cWidth + 'px';
    canvas.style.height = cHeight + 'px';

    screen.imageSmoothingEnabled = false;
}

let pMap = new Panel(10,0,30,22);
let pInfo = new Panel(0,0,14,7);
let pLog = new Panel(10,25,30,4);
let pUI = new Panel(1,9,9,7);
let btnUp = new Panel(0,0,0,0);
let btnLeft = new Panel(0,0,0,0);
let btnDown = new Panel(0,0,0,0);
let btnRight = new Panel(0,0,0,0);

let log = ``;

function updatePanels() {
    if (screenX > screenY) {
        pInfo.set(pInfo.x, Math.floor((screenY * 2 / 3 - pInfo.h) / 2), pInfo.w, pInfo.h);
        pLog.set(pInfo.xx + 1, screenY - pLog.h, screenX - pLog.x, pLog.h);
        pMap.set(pInfo.xx + 1, pMap.y, screenX - pMap.x, screenY - pLog.h - 1);
        pUI.set(0,0,0,0);
    } else {
        pInfo.set(0,0,screenX,7);
        pLog.set(0,screenY - pUI.h - pLog.h,screenX,4);
        pMap.set(0,pInfo.yy,screenX,screenY - pLog.h - pUI.h - pInfo.h);
        pUI.set(screenX - pUI.w, screenY - pUI.h, pUI.w, pUI.h);
    }

    btnUp.set( pUI.x + 3, pUI.y, 3, 3 );
    btnLeft.set( pUI.x, pUI.y + 2, 3, 3 );
    btnDown.set( pUI.x + 3, pUI.y + 4, 3, 3 );
    btnRight.set( pUI.x + 6, pUI.y + 2, 3, 3 );
}

updateScreenSize();
updatePanels();

window.addEventListener('resize', function() {
    updateScreenSize();

    updatePanels();
    updateCamera();
    draw();
});

let cam = new Vector2(0,0);

function updateCamera() {
    const offset = new Vector2(pMap.w / 2, pMap.h / 2);
    let target = new Vector2(player.x - offset.x, player.y - offset.y);

    cam.x = Math.floor(Math.max(0, Math.min(target.x, mapWidth - pMap.w)));
    cam.y = Math.floor(Math.max(0, Math.min(target.y, mapHeight - pMap.h)));

}

updateCamera();

function setFont(weight = '100') {
    screen.font = `${weight} ${fontSize * fontSizeDelta}px 'Courier New', monospace`;
    screen.textAlign = 'center';
    screen.textBaseline = 'middle';
}

function drawMap() {
    for (let i = pMap.y; i < pMap.yy; i++) {
        let dy = cam.y + i - pMap.y;
        let sy = i * fontY;

        for (let j = pMap.x; j < pMap.xx; j++) {
            let dx = cam.x + j - pMap.x;
            let sx = j * fontX;

            if (dy < 0 || dy >= mapHeight || dx < 0 || dx >= mapWidth) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX, fontY);
                continue;
            }

            const entity = entities.find(e => e.x === dx && e.y === dy);
            if (entity) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 0, fontY - 0);
                setFont('900');
                if (entity instanceof Player) {
                    screen.fillStyle = WHITE;
                    screen.fillText('@', sx + fontX / 2, sy + fontY / 2);
                    continue;
                } else if (entity instanceof Goblin) {
                    screen.fillStyle = SALMON;
                    screen.fillText('g', sx + fontX / 2, sy + fontY / 2);
                    continue;
                } else if (entity instanceof Hydra) {
                    screen.fillStyle = LGREEN;
                    screen.fillText('H', sx + fontX / 2, sy + fontY / 2);
                    continue;
                } else if (entity instanceof Cleric) {
                    screen.fillStyle = YELLOW;
                    screen.fillText('C', sx + fontX / 2, sy + fontY / 2);
                    continue;
                } else if (entity instanceof Orc) {
                    screen.fillStyle = BRICK;
                    screen.fillText('O', sx + fontX / 2, sy + fontY / 2);
                    continue;
                }
            }

            setFont();
            if (map[dy]?.[dx] === 1) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 0, fontY - 0);
                screen.fillStyle = BROWN;
                screen.fillText('.', sx + fontX / 2, sy + fontY / 2);
            } else if (map[dy]?.[dx] === 2) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 0, fontY - 0);
                screen.fillStyle = DGREY;
                screen.fillText('#', sx + fontX / 2, sy + fontY / 2);
            } else if (map[dy]?.[dx] === 3) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 0, fontY - 0);
                screen.fillStyle = GREEN;
                screen.fillText('T', sx + fontX / 2, sy + fontY / 2);
            } else if (map[dy]?.[dx] === 4) {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 0, fontY - 0);
                screen.fillStyle = CYAN;
                screen.fillText('~', sx + fontX / 2, sy + fontY / 2);
            } else {
                screen.fillStyle = BLACK;
                screen.fillRect(sx, sy, fontX - 1, fontY - 1);
                screen.fillText(' ', sx + fontX / 2, sy + fontY / 2);
            }
        }
    }
}

function drawLog() {
    for (let i = pLog.y; i < pLog.yy; i++) {
        for (let j = pLog.x; j < pLog.xx; j++) {
            screen.fillStyle = '#000000';
            screen.fillRect(j * fontX, i * fontY, fontX - 0, fontY - 0);
        }
    }

    let remaining = log;
    let logLines = [];
    while (remaining.length > pLog.w) {
        if (logLines.length === pLog.h - 1) {
            logLines.push(remaining.slice(0,pLog.w - 3) + '...');
            continue;
        }
        logLines.push(remaining.slice(0,pLog.w));
        remaining = remaining.slice(pLog.w, remaining.length);
    }
    if (remaining.length > 0 && remaining.length <= pLog.w) {
        logLines.push(remaining);
    }

    for (let i = 0; i < pLog.h; i++) {
        for (let j = 0; j < pLog.w; j++) {
            let sx = (j + pLog.x) * fontX;
            let sy = (i + pLog.y) * fontY;

            if (logLines[i]?.[j]) {
                setFont('100');
                screen.fillStyle = "#ffffff";
                screen.fillText(logLines[i][j], sx + fontX / 2, sy + fontY / 2);
            }
        }
    }
}

function drawUI() {
    for (let i = pUI.y; i < pUI.yy; i++) {
        for (let j = pUI.x; j < pUI.xx; j++) {

            if (i === pUI.y + 1 && j === pUI.x + 4) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText('↑', j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pUI.y + 3 && j === pUI.x + 1) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText('←', j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pUI.y + 3 && j === pUI.x + 4) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText('O', j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pUI.y + 5 && j === pUI.x + 4) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText('↓', j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pUI.y + 3 && j === pUI.x + 7) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText('→', j * fontX + fontX / 2, i * fontY + fontY / 2);
            } 	
        }
    }
}

function drawInfo() {
    for (let i = pInfo.y; i < pInfo.yy; i++) {
        for (let j = pInfo.x; j < pInfo.xx; j++) {
            screen.fillStyle = '#000000';
            screen.fillRect(j * fontX, i * fontY, fontX - 0, fontY - 0);
        }
    }

    for (let i = pInfo.y; i < pInfo.yy; i++) {
        for (let j = pInfo.x; j < pInfo.xx; j++) {

            if (i === pInfo.y) {
                setFont('900');
                screen.fillStyle = "#c9d487";
                screen.fillText(player.name.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pInfo.y + 1) {
                setFont('100');
                screen.fillStyle = "#FFFFFF";
                screen.fillText(player.race.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pInfo.y + 2) {
                setFont('100');
                screen.fillStyle = "#FFFFFF";
                screen.fillText(player.class.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pInfo.y + 3) {
                setFont('100');
                screen.fillStyle = "#FFFFFF";
                let _level = 'Level: ' + player.level;
                screen.fillText(_level.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pInfo.y + 4) {
                setFont('100');
                screen.fillStyle = "#FFFFFF";
                let _xp = 'XP: ' + player.xp + '%';
                screen.fillText(_xp.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            } else if (i === pInfo.y + 6) {
                setFont('100');
                screen.fillStyle = "#FFFFFF";
                let _hp = 'HP: ' + player.hp + ' / ' + player.hpMax;
                screen.fillText(_hp.slice(j, j + 1), j * fontX + fontX / 2, i * fontY + fontY / 2);
            }
        }
    }
}

function isInPanel(p,x,y) {
    return (
        x >= p.x * fontX &&
        x <= p.xx * fontX &&
        y >= p.y * fontY &&
        y <= p.yy * fontY
    );
}

let isBusy = false;

async function handleMonsterTurns() {
    const dMap = generateDijkstraMap(map, player.x, player.y, 10, entities);

    for (let entity of entities) {
        if (entity instanceof Monster) {
            const report = entity.moveTowards(dMap, entities, player);
            if (report) {
                log += ` El ${report.attacker} te golpea por ${report.damage}.`;
            }
            if (player.hp <= 0) {
                log += ` ¡Has muerto!`;
                kill(player);
            }
        }
    }
}

async function lookAt(x, y) {
    if (isBusy) return;

    let lx = player.x + x;
    let ly = player.y + y;

    //log = `Estás en x: ${ player.x }, y: ${ player.y }.`;
    log = ``;

    if (map[ly]?.[lx] === 1) {
        const entity = entities.find(e => e.x === lx && e.y === ly);
        if (entity && entity instanceof Monster) {
            let hit = Math.max(1, Math.round(random(player.level - 1, player.level + 3)));
            log = `Golpeas al ${ entity.name } por ${ hit }.`;
            entity.hp -= hit;
            if (entity.hp <= 0) {
                kill(entity);
                let xpAmount = 0; // (entity instanceof Orc) ? random(15,30) : random(5,12);
                if (entity instanceof Hydra) random (30,40);
                if (entity instanceof Orc) random (10,20);
                else if (entity instanceof Goblin) random (5,10);
                const leveling = player.gainXp(xpAmount);
                log = `Matas al ${ entity.name }, ganas ${ xpAmount }xp.`;
                if (leveling) {
                    log += ` Subes a nivel ${ leveling[1] }, ganas ${ leveling[0] }hp.`;
                }
            }
        } else if (entity && entity instanceof Cleric) {
            log = entity.interact(player);
        } else {
            player.x = lx;
            player.y = ly;
            log = ``;
            updateCamera();
        }
    } else if (map[ly]?.[lx] === 2) {
        log += `Un muro bloquea el camino.`;
    } else if (map[ly]?.[lx] === 3) {
        log += `Un árbol bloquea tu camino.`;
    } else if (map[ly]?.[lx] === 4) {
        log += `El agua refleja tu rostro.`;
    } else {
        log += ' Camino bloqueado.';
    }
    isBusy = true;
    await handleMonsterTurns();
    draw();
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
    if (e === 'w' || e === 'a' || e === 's' || e === 'd') { e.preventDefault(); }
    const keyMap = {
        'w': {x:0, y:-1},
        'a': {x:-1, y:0},
        's': {x:0, y:1},
        'd': {x:1, y:0}
    };
    let k = e.key.toLowerCase();
    let move = keyMap[k];

    if (move) lookAt(move.x, move.y);
});

window.addEventListener('click', (e) => {
    let pos = new Vector2(0,0);
    pos.x = e.clientX - canvas.getBoundingClientRect().left;
    pos.y = e.clientY - canvas.getBoundingClientRect().top;

    if (isInPanel(btnUp, pos.x, pos.y)) {
        lookAt(0,-1);
    } else if (isInPanel(btnLeft, pos.x, pos.y)) {
        lookAt(-1,0);
    } else if (isInPanel(btnDown, pos.x, pos.y)) {
        lookAt(0,1);
    } else if (isInPanel(btnRight, pos.x, pos.y)) {
        lookAt(1,0);
    }
});

function draw() {
    drawMap();
    drawInfo();
    drawLog();
    drawUI();
}

updateScreenSize();
draw();

