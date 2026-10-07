import { readStructureFromUpload } from './file.js';

function initFileUpload(state, refreshApp) {
    const upload = document.getElementById("start-file-upload");

    upload.addEventListener("input", async () => {
        const [filename, structure] = await readStructureFromUpload(upload);

        state.page = "blueprint";
        state.title = filename.replace(".nbt", "");
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

export async function init(state, refreshApp) {
    initFileUpload(state, refreshApp);
    initBrowse(state, refreshApp);

    state.listeners.push(refresh);
}
