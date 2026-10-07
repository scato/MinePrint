import { generateLayers } from '../model/blueprint.js';
import { generateMaterials } from '../model/materials.js';
import { extractBlocks, extractPalette, extractSize } from '../model/structure.js';
import { fetchLanguageFile } from './assets.js';
import { readStructureFromUpload } from './file.js';
import { renderBlueprint } from './html.js';

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
    } else {
        document.getElementById("blueprint").style.display = "none";
    }
}

export async function init(state, refreshApp) {
    initFileUpload(state, refreshApp);
    initBrowse(state, refreshApp);

    state.listeners.push(refresh);
}
