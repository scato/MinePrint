import { readSnbt, writeSnbt } from '../model/snbt.js';
import { trim } from '../model/tools.js';

function initClean(state, refreshApp) {
    const anchor = document.getElementById("edit-clean");

    anchor.addEventListener("click", () => {
        const snbt = document.getElementById("edit-source").value;
        const structure = readSnbt(snbt);

        trim(structure);

        state.structure = structure;

        refreshApp(state);
    });
}

function initBlueprint(state, refreshApp) {
    const anchor = document.getElementById("edit-blueprint");

    anchor.addEventListener("click", () => {
        const title = document.getElementById("edit-title").value;
        const snbt = document.getElementById("edit-source").value;
        const structure = readSnbt(snbt);

        state.page = "blueprint";
        state.title = title;
        state.structure = structure;

        refreshApp(state);
    });
}

function refresh(state, refreshApp) {
    if (state.page === "edit") {
        const snbt = writeSnbt(state.structure, "    ");
        
        document.getElementById("edit-title").value = state.title;
        document.getElementById("edit-source").value = snbt;

        document.getElementById("edit").style.display = "block";
    } else {
        document.getElementById("edit").style.display = "none";
    }
}

export async function init(state, refreshApp) {
    initClean(state, refreshApp);
    initBlueprint(state, refreshApp);

    state.listeners.push(refresh);
}
