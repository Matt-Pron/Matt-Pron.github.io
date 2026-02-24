import Panel, { isInPanel } from './panel.js';
import { Entity } from './entities.js';
import { colors } from './palette.js';
import { eventBus } from './eventBus.js';
import { getTileData } from './data/tiles.js';

export const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const fontSize = 16;
const screen = {
    screenX: 0,
    screenY: 0,
    cWidth: 0,
    cHeight: 0,
    font: {
        delta: fontSize * 0.95,
        x: Math.floor(fontSize * .70),
        y: Math.floor(fontSize * 1.0)
    },
    dpr: window.devicePixelRatio || 1
};

export const panels = {
    pMap: new Panel(10,0,30,22),
    pInfo: new Panel(0,0,14,7),
    pLog: new Panel(10,25,30,4),
    pUI: new Panel(1,9,9,7),

    btnUp: new Panel(), btnLeft: new Panel(), btnDown: new Panel(), btnRight: new Panel()
};

let cam = { x: 0, y: 0 };
let log = ``;

eventBus.on('on_message', (msg) => {
    log = msg;
});

export function updateLayout() {
    screen.screenX = Math.floor((window.innerWidth / 2 - 20) / screen.font.x);
    screen.screenY = Math.floor((window.innerHeight / 2 - 20) / screen.font.y);

    screen.cWidth = screen.screenX * screen.font.x;
    screen.cHeight = screen.screenY * screen.font.y;

    canvas.width  = screen.cWidth * screen.dpr;
    canvas.height = screen.cHeight * screen.dpr;
    ctx.scale(screen.dpr, screen.dpr);

    canvas.style.width  = 2 * screen.cWidth + 'px';
    canvas.style.height = 2 * screen.cHeight + 'px';
    ctx.imageSmoothingEnabled = false;

    if (screen.screenX > screen.screenY) {
        panels.pInfo.set(panels.pInfo.x, Math.floor((screen.screenY * 2 / 3 - panels.pInfo.h) / 2), panels.pInfo.w, panels.pInfo.h);
        panels.pLog.set(panels.pInfo.xx + 1, screen.screenY - panels.pLog.h, screen.screenX - panels.pLog.x, panels.pLog.h);
        panels.pMap.set(panels.pInfo.xx + 1, panels.pMap.y, screen.screenX - panels.pMap.x, screen.screenY - panels.pLog.h - 1);
        panels.pUI.set(0,0,0,0);
    } else {
        panels.pInfo.set(0,0,screen.screenX,7);
        panels.pLog.set(0,screen.screenY - panels.pUI.h - panels.pLog.h,screen.screenX,4);
        panels.pMap.set(0,panels.pInfo.yy,screen.screenX,screen.screenY - panels.pLog.h - panels.pUI.h - panels.pInfo.h);
        panels.pUI.set(screen.screenX - panels.pUI.w, screen.screenY - panels.pUI.h, panels.pUI.w, panels.pUI.h);
    }

    panels.btnUp.set( panels.pUI.x + 3, panels.pUI.y, 3, 3 );
    panels.btnLeft.set( panels.pUI.x, panels.pUI.y + 2, 3, 3 );
    panels.btnDown.set( panels.pUI.x + 3, panels.pUI.y + 4, 3, 3 );
    panels.btnRight.set( panels.pUI.x + 6, panels.pUI.y + 2, 3, 3 );
}

export function updateCamera(player, mapWidth, mapHeight) {
    const offset = { x: panels.pMap.w / 2, y: panels.pMap.h / 2 };
    let target = { x: player.x - offset.x, y: player.y - offset.y };

    cam.x = Math.floor(Math.max(0, Math.min(target.x, mapWidth - panels.pMap.w)));
    cam.y = Math.floor(Math.max(0, Math.min(target.y, mapHeight - panels.pMap.h)));

}

function setFont(weight = '100') {
    ctx.font = `${weight} ${screen.font.delta}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
}

function clear(panel) {
    ctx.fillStyle = colors.BLACK;
    ctx.fillRect(panel.x * screen.font.x, panel.y * screen.font.y, panel.w * screen.font.x, panel.h * screen.font.y);
}

export const draw = {

    map(map, entities) {
        clear(panels.pMap);

        for (let i = panels.pMap.y; i < panels.pMap.yy; i++) {
            let dy = cam.y + i - panels.pMap.y;
            let sy = i * screen.font.y;

            for (let j = panels.pMap.x; j < panels.pMap.xx; j++) {
                let dx = cam.x + j - panels.pMap.x;
                let sx = j * screen.font.x;

                const tile = getTileData(map[dy][dx]);

                // if (!explored?.[dy][dx]) {
                // continue;
                // }

                // const light = obtener light level
                
                setFont();
                // ctx.fillStyle = ajustar tile.color con light level
                ctx.fillStyle = colors[tile.color];
                ctx.fillText(tile.char, sx + screen.font.x / 2, sy + screen.font.y / 2);
            }
        }
        for (const e of entities) {
            const row = (e.y - cam.y) + panels.pMap.y;
            const column = (e.x - cam.x) + panels.pMap.x;

            if (row < panels.pMap.y || row >= panels.pMap.yy ||
                column < panels.pMap.x || column >= panels.pMap.xx) continue;

            const sx = column * screen.font.x;
            const sy = row * screen.font.y;

            ctx.fillStyle = colors.BLACK;
            ctx.fillRect(sx, sy, screen.font.x, screen.font.y);

            setFont('600');

            ctx.fillStyle = e.color;
            ctx.fillText(e.char, sx + screen.font.x / 2, sy + screen.font.y / 2);
        }
    },

    log() {
        clear(panels.pLog);

        let remaining = log;
        let logLines = [];
        while (remaining.length > panels.pLog.w) {
            if (logLines.length === panels.pLog.h - 1) {
                logLines.push(remaining.slice(0,panels.pLog.w - 3) + '...');
                continue;
            }
            logLines.push(remaining.slice(0,panels.pLog.w));
            remaining = remaining.slice(panels.pLog.w, remaining.length);
        }
        if (remaining.length > 0 && remaining.length <= panels.pLog.w) {
            logLines.push(remaining);
        }

        for (let i = 0; i < panels.pLog.h; i++) {
            for (let j = 0; j < panels.pLog.w; j++) {
                let sx = (j + panels.pLog.x) * screen.font.x;
                let sy = (i + panels.pLog.y) * screen.font.y;

                if (logLines[i]?.[j]) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    ctx.fillText(logLines[i][j], sx + screen.font.x / 2, sy + screen.font.y / 2);
                }
            }
        }
    },

    info(player) {
        clear(panels.pInfo);

        for (let i = panels.pInfo.y; i < panels.pInfo.yy; i++) {
            for (let j = panels.pInfo.x; j < panels.pInfo.xx; j++) {

                if (i === panels.pInfo.y) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText(player.name.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pInfo.y + 1) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    ctx.fillText(player.race.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pInfo.y + 2) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    ctx.fillText(player.class.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pInfo.y + 3) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    let _level = 'Level: ' + player.level;
                    ctx.fillText(_level.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pInfo.y + 4) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    let _xp = 'XP: ' + player.exp + '%';
                    ctx.fillText(_xp.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pInfo.y + 6) {
                    setFont('100');
                    ctx.fillStyle = colors.WHITE;
                    let _hp = 'HP: ' + player.hp + ' / ' + player.maxHp;
                    ctx.fillText(_hp.slice(j, j + 1), j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                }
            }
        }
    },

    ui() {
        clear(panels.pUI);

        for (let i = panels.pUI.y; i < panels.pUI.yy; i++) {
            for (let j = panels.pUI.x; j < panels.pUI.xx; j++) {

                if (i === panels.pUI.y + 1 && j === panels.pUI.x + 4) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText('↑', j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pUI.y + 3 && j === panels.pUI.x + 1) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText('←', j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pUI.y + 3 && j === panels.pUI.x + 4) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText('O', j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pUI.y + 5 && j === panels.pUI.x + 4) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText('↓', j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } else if (i === panels.pUI.y + 3 && j === panels.pUI.x + 7) {
                    setFont('900');
                    ctx.fillStyle = colors.YELLOW;
                    ctx.fillText('→', j * screen.font.x + screen.font.x / 2, i * screen.font.y + screen.font.y / 2);
                } 	
            }
        }
    },

    all(map, entities, player) {
        draw.map(map, entities);
        draw.log();
        draw.info(player);
        draw.ui();
    }

};

export function isLayoutClickable(e) {
    let pos = { x: 0, y: 0 };
    pos.x = (e.clientX - canvas.getBoundingClientRect().left) / 2;
    pos.y = (e.clientY - canvas.getBoundingClientRect().top) / 2;

    if (isInPanel(panels.btnUp, pos.x, pos.y, screen.font)) return 'up';
    else if (isInPanel(panels.btnLeft, pos.x, pos.y, screen.font)) return 'left';
    else if (isInPanel(panels.btnDown, pos.x, pos.y, screen.font)) return 'down';
    else if (isInPanel(panels.btnRight, pos.x, pos.y, screen.font)) return 'right';
}

