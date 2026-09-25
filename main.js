import { generateLayers } from './modules/blueprint.js';
import { renderBlueprint} from './modules/html.js';
import { readNbt } from './modules/nbt.js';
import { extractBlocks, extractPalette, extractSize } from './modules/structure.js';

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.readAsArrayBuffer(file);
    });
}

function unzipArrayBuffer(buffer) {
    const input = new ReadableStream({
        pull(controller) {
            controller.enqueue(buffer);
            controller.close();
        }
    });

    const output = input.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

function initFileUpload(upload) {
    const start = document.querySelector("#start");
    const blueprint = document.querySelector("#blueprint");

    const title = document.querySelector("#blueprint-title");
    const viewer = document.querySelector("#blueprint-viewer");

    upload.addEventListener("input", () => {
        const file = upload.files[0];

        title.textContent = file.name.replace(".nbt", "");

        readFileAsArrayBuffer(file)
            .then(unzipArrayBuffer)
            .then((buffer) => {
                const root = readNbt(new Uint8Array(buffer));
                const layers = generateLayers(extractSize(root), extractBlocks(root), extractPalette(root), 1);

                viewer.innerHTML = renderBlueprint(layers);
                start.style.display = "none";
                blueprint.style.display = "initial";
            });
    });
}

function initBrowse(anchor) {
    const start = document.querySelector("#start");
    const blueprint = document.querySelector("#blueprint");

    const title = document.querySelector("#blueprint-title");
    const viewer = document.querySelector("#blueprint-viewer");

    anchor.addEventListener("click", () => {
        const uri = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/26.2/data/minecraft/structure/village/plains/houses/plains_small_house_1.nbt";
        const example = fetch(uri);

        title.textContent = uri.split("/").pop().replace(".nbt", "");

        example
            .then(response => {
                const nbt = response.body.pipeThrough(new DecompressionStream("gzip"));
                
                return new Response(nbt).arrayBuffer()
            })
            .then((buffer) => {
                const root = readNbt(new Uint8Array(buffer));
                const layers = generateLayers(extractSize(root), extractBlocks(root), extractPalette(root), 1);

                viewer.innerHTML = renderBlueprint(layers);
                start.style.display = "none";
                blueprint.style.display = "initial";
            });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initFileUpload(document.querySelector("#start-file-upload"));
    initFileUpload(document.querySelector("#blueprint-file-upload"));
    initBrowse(document.querySelector("#start-browse"));
});
