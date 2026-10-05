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
        state.page = "browse";

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
