import { Renderer } from "./renderer.js";
import { Globals } from "./globals.js";
import { SplashScreen } from "./scenes/splash.js";
import { LoadingScreen } from "./scenes/loading.js";
import { viewportManager } from "./viewportManager.js";
import { StageManager } from "./stateManager.js";
import { TouchpadUI } from "./ui/touchpad.js";

const loader = new LoadingScreen(0, 0, Globals.cols, Globals.rows, 99);
const loaderId = viewportManager.addViewport(loader, { persistent: true, name: "loader" });
StageManager.init(loaderId);

Globals.input = ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "touch" : "none";
if (Globals.input === 'touch') Globals.touchpad = true;

Renderer.resize();
Renderer.setDOMBackground();

if (Globals.touchpad) {
    TouchpadUI.onResize(Globals.cols, Globals.rows);
}

window.addEventListener("resize", () => {
    Renderer.resize();
    if (Globals.touchpad) {
        TouchpadUI.onResize(Globals.cols, Globals.rows);
    }
});

// loop
let lastTime = 0;
const TARGET_FPS = 30;
const TARGET_INTERVAL = 1000 / TARGET_FPS;

// fps
let frameCount = 0;
let fps = 0;
let lastFpsTime = 0;
const FPS_UPDATE_INTERVAL = 500;

function loop(t) {
    if (!lastTime) lastTime = t;
    if (!lastFpsTime) lastFpsTime = t;

    const delta = t - lastTime;

    if (delta >= TARGET_INTERVAL) {
        // InputHandler.processInputs();
        // InputHandler.tick();
        StageManager.update(t);

        // update

        Renderer.renderStage(t);

        frameCount++;

        lastTime = t - (delta % TARGET_INTERVAL);
    }

    const fpsDelta = t - lastFpsTime;
    if (fpsDelta >= FPS_UPDATE_INTERVAL) {
        fps = frameCount / (fpsDelta / 1000);
        Renderer.updateFPS(fps);

        frameCount = 0;
        lastFpsTime = t;
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

StageManager.setStage(SplashScreen);
// StageManager.setStage(NewGame);

