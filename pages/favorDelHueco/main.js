import { Renderer } from "./renderer.js";
import { update, viewportManager } from "./viewportManager.js";
import { Input, processInput } from "./input.js";
import { SplashScreen } from "./scenes/splash.js";
import { Globals } from "./globals.js";
import { PowerManager } from "./powerManager.js";

Globals.input = ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "touch" : "none";
if (Globals.input === 'touch') Globals.touchpad = true;

Renderer.resize();
Renderer.setDOMBackground();
Input.init();
PowerManager.init();

const LOGIC_FPS = 60;
const TIME_STEP = 1000 / LOGIC_FPS;

let lastTime = performance.now();
let accumulator = 0;
let lastRenderTime = 0;
let totalElapsed = 0;

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        lastTime = performance.now();
    }
});

function loop(currentTime) {
    if (document.hidden) {
        requestAnimationFrame(loop);
        return;
    }

    let delta = currentTime - lastTime;
    lastTime = currentTime;

    if (delta > 250) delta = TIME_STEP;

    accumulator += delta;
    totalElapsed += delta;

    while (accumulator >= TIME_STEP) {
        processInput();
        update(TIME_STEP);

        accumulator -= TIME_STEP;
    }

    const renderInterval = 1000 / PowerManager.renderFps;
    const timeSinceLastRender = currentTime - lastRenderTime;

    if (timeSinceLastRender >= renderInterval) {
        Renderer.render(totalElapsed);

        lastRenderTime = currentTime - (timeSinceLastRender % renderInterval);
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

viewportManager.setScene(SplashScreen);

