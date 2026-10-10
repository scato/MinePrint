import { createScene } from './render.js';

async function renderBlock(blockstate, aspectRatio, engine) {
    const size = [2, 2, 2];
    const blocks = [{pos: [0, 0, 0], state: 0}, {pos: [1, 0, 0], state: 0}, {pos: [1, 0, 1], state: 0}, {pos: [1, 1, 0], state: 0}];
    const palette = [blockstate];

    const scene = await createScene(size, blocks, palette, aspectRatio);

    engine.stopRenderLoop();
    engine.runRenderLoop(() => {
        scene.render();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("#render-test canvas");
    const aspectRatio = canvas.width / canvas.height;
    const engine = new BABYLON.Engine(canvas, true);

    let example = `
        {
            "Name": "anvil",
            "Properties": {
                "facing": "east"
            }
        }
    `;

    example = example.replaceAll("\n        ", "\n").trim();

    const textarea = document.querySelector("#render-test textarea");

    textarea.value = example;

    renderBlock(JSON.parse(textarea.value), aspectRatio, engine);

    textarea.addEventListener("input", () => {
        let blockstate = null;

        try {
            blockstate = JSON.parse(textarea.value);
        } catch(e) {
            textarea.style.backgroundColor = "#fee";
            return;
        }

        textarea.style.backgroundColor = "white";

        renderBlock(blockstate, aspectRatio, engine);
    });
});
