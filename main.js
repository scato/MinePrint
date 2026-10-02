import { fetchLanguageFile } from './modules/assets.js';
import { generateLayers } from './modules/model/blueprint.js';
import { renderBlueprint} from './modules/html.js';
import { generateMaterials } from './modules/model/materials.js';
import { readNbt } from './modules/model/nbt.js';
import { extractBlocks, extractPalette, extractSize } from './modules/model/structure.js';

const languageFilePromise = fetchLanguageFile();

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

function unzipResponse(response) {
    const output = response.body.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

function renderHtmlFromBuffer(buffer, languageFile) {
    const root = readNbt(new Uint8Array(buffer));
    const size = extractSize(root);
    const blocks = extractBlocks(root);
    const palette = extractPalette(root);
    const layers = generateLayers(size, blocks, palette, 1);
    const materials = generateMaterials(size, blocks, palette);

    return renderBlueprint(layers, materials, languageFile);
}

function initFileUpload(upload) {
    const start = document.querySelector("#start");
    const blueprint = document.querySelector("#blueprint");

    const title = document.querySelector("#blueprint-title");
    const viewer = document.querySelector("#blueprint-viewer");

    upload.addEventListener("input", async () => {
        const file = upload.files[0];

        title.textContent = file.name.replace(".nbt", "");

        const zippedBuffer = await readFileAsArrayBuffer(file);
        const buffer = await unzipArrayBuffer(zippedBuffer);
        const languageFile = await languageFilePromise;

        viewer.innerHTML = renderHtmlFromBuffer(buffer, languageFile);

        start.style.display = "none";
        blueprint.style.display = "initial";
    });
}

function initBrowse(anchor) {
    const start = document.querySelector("#start");
    const blueprint = document.querySelector("#blueprint");

    const title = document.querySelector("#blueprint-title");
    const viewer = document.querySelector("#blueprint-viewer");

    anchor.addEventListener("click", async () => {
        const uri = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/26.2/data/minecraft/structure/village/plains/houses/plains_small_house_1.nbt";
        
        title.textContent = uri.split("/").pop().replace(".nbt", "");
        
        const example = await fetch(uri);
        const buffer = await unzipResponse(example);
        const languageFile = await languageFilePromise;

        viewer.innerHTML = renderHtmlFromBuffer(buffer, languageFile);

        start.style.display = "none";
        blueprint.style.display = "initial";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initFileUpload(document.querySelector("#start-file-upload"));
    initFileUpload(document.querySelector("#blueprint-file-upload"));
    initBrowse(document.querySelector("#start-browse"));
});
