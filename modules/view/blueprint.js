import { generateLayers } from '../model/blueprint.js';
import { generateMaterials } from '../model/materials.js';
import { extractBlocks, extractPalette, extractSize } from '../model/structure.js';
import { fetchLanguageFile } from './assets.js';
import { renderBlueprint } from './html.js';

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

export function init(state, refreshApp) {
    state.listeners.push(refresh);
}
