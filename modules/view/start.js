import { readNbt } from '../model/nbt.js';
import { readFileAsArrayBuffer, unzipArrayBuffer, unzipResponse } from './file.js';

function initFileUpload(state, refreshApp) {
    const upload = document.getElementById("start-file-upload");

    upload.addEventListener("input", async () => {
        const file = upload.files[0];

        const zippedBuffer = await readFileAsArrayBuffer(file);
        const buffer = await unzipArrayBuffer(zippedBuffer);
        const structure = readNbt(new Uint8Array(buffer));

        state.page = "blueprint";
        state.title = file.name.replace(".nbt", "");
        state.structure = structure;

        refreshApp(state);
    });
}

function initBrowse(state, refreshApp) {
    const anchor = document.getElementById("start-browse");

    anchor.addEventListener("click", async () => {
        const uri = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/26.2/data/minecraft/structure/village/plains/houses/plains_small_house_1.nbt";
        
        const zippedResponse = await fetch(uri);
        const buffer = await unzipResponse(zippedResponse);
        const structure = readNbt(new Uint8Array(buffer));

        state.page = "blueprint";
        state.title = uri.split("/").pop().replace(".nbt", "");
        state.structure = structure;

        refreshApp(state);
    });
}

function refresh(state) {
    if (state.page === "start") {
        document.getElementById("start").style.display = "block";
    } else {
        document.getElementById("start").style.display = "none";
    }
}

export function init(state, refreshApp) {
    initFileUpload(state, refreshApp);
    initBrowse(state, refreshApp);

    state.listeners.push(refresh);
}
