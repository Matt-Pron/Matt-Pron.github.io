import { MainScene } from "./mainScene.js";
import { Renderer } from "./renderer.js";

const renderer = new Renderer;
const viewport = new MainScene;
viewport.setSize(renderer.canvas.width / renderer.gridX, renderer.canvas.height / renderer.gridY);

function update() {
    viewport.update();
}

function render() {
    renderer.clear();
    viewport.draw(renderer);
}

// function loop() {

    update(); // Layout measuring, sizing, positioning

    render();

    // requestAnimationFrame(loop);
// }

// loop();

