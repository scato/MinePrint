import { generateLayers } from '../model/blueprint.js';
import { generateMaterials } from '../model/materials.js';
import { extractBlocks, extractPalette, extractSize } from '../model/structure.js';
import { fetchLanguageFile } from './assets.js';
import { readStructureFromUpload, writeStructureAsDownload } from './file.js';
import { renderBlueprint } from './html.js';
import { createScene, getLightDirection } from './render.js';

function initFileUpload(state, refreshApp) {
    const upload = document.getElementById("blueprint-file-upload");

    upload.addEventListener("input", async () => {
        const [filename, structure] = await readStructureFromUpload(upload);

        state.page = "blueprint";
        state.title = filename.replace(".nbt", "");
        state.structure = structure;

        state.url = null;
        location.hash = "#";

        refreshApp(state);
    });
}

function initBrowse(state, refreshApp) {
    const anchor = document.getElementById("blueprint-browse");

    anchor.addEventListener("click", async () => {
        state.page = "browse";

        if (state.url !== null) {
            state.url = state.url.substring(0, state.url.lastIndexOf("/") + 1);
            location.hash = `#${state.url}`;
        }

        refreshApp(state);
    });
}

function initRotate(state, refreshApp) {
    const anchorLeft = document.getElementById("blueprint-toolbar-rotate-left");
    const anchorRight = document.getElementById("blueprint-toolbar-rotate-right");

    anchorLeft.addEventListener("click", () => {
        state.renderAngle = (state.renderAngle - 90 + 360) % 360;
        state.renderDirty = true;
    });
    anchorRight.addEventListener("click", () => {
        state.renderAngle = (state.renderAngle + 90) % 360;
        state.renderDirty = true;
    });
}

function initEdit(state, refreshApp) {
    const anchor = document.getElementById("blueprint-edit");

    anchor.addEventListener("click", async () => {
        state.page = "edit";

        state.url = null;
        location.hash = "#";

        refreshApp(state);
    });
}

function initDownload(state, refreshApp) {
    const anchor = document.getElementById("blueprint-download");

    anchor.addEventListener("click", async () => {
        await writeStructureAsDownload(state.title + ".nbt", state.structure);
    });
}

const languageFilePromise = fetchLanguageFile();

async function refresh(state) {
    if (state.page === "blueprint") {
        const size = extractSize(state.structure);
        const blocks = extractBlocks(state.structure);
        const palette = extractPalette(state.structure);
        const layers = generateLayers(size, blocks, palette, 1);
        const materials = generateMaterials(size, blocks, palette);
        const languageFile = await languageFilePromise;

        const html = renderBlueprint(layers, materials, languageFile);
    
        document.getElementById("blueprint-title").innerHTML = state.title;
        document.getElementById("blueprint-viewer").innerHTML = html;
    
        document.getElementById("blueprint").style.display = "block";

        if (state.engine !== undefined) {
            state.engine.stopRenderLoop();
        }

        state.renderAngle = 45;
        state.renderDirty = true;

        // wait for the browser to parse the innerHTML
        setTimeout(async () => {
            const canvas = document.querySelector("#blueprint .isometric-render canvas");
            const aspectRatio = canvas.width / canvas.height;
            const engine = new BABYLON.Engine(canvas, true, undefined, true);
            const scene = await createScene(size, blocks, palette, state.renderAngle, aspectRatio);

            scene.executeWhenReady(() => {
                engine.runRenderLoop(() => {
                    if (state.renderDirty) {
                        scene.cameras[0].alpha = state.renderAngle / 180 * Math.PI;
                        scene.lights[0].direction = getLightDirection(state.renderAngle);
                        scene.render();
                        state.renderDirty = false;
                    }
                });
            });
    
            state.engine = engine;
        }, 0);
    } else {
        document.getElementById("blueprint").style.display = "none";
    }
}

export async function init(state, refreshApp) {
    initFileUpload(state, refreshApp);
    initBrowse(state, refreshApp);

    initRotate(state, refreshApp);

    initEdit(state, refreshApp);
    initDownload(state, refreshApp);

    state.listeners.push(refresh);
}
