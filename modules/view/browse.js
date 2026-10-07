import { readNbt } from '../model/nbt.js';
import { STRUCTURES_ROOT } from './assets.js';
import { readStructureFromUrl } from './file.js';

async function updateUrl(state) {
    const hash = location.hash;

    if (hash === "" || hash === "#") {
        state.url = null;
    } else {
        state.url = hash.substring(1);

        if (state.url.endsWith("/")) {
            state.page = "browse";
        } else {
            const [filename, structure] = await readStructureFromUrl(state.url);

            state.page = "blueprint";
            state.title = filename.replace(".nbt", "");
            state.structure = structure;
        }
    }
}

async function initBrowseList(state, refreshApp) {
    await updateUrl(state);

    window.addEventListener("hashchange", async () => {
        await updateUrl(state);
        refreshApp(state);
    });
}

function renderRepoList() {
    const repoTemplate = document.querySelector("#browse-templates .browse-list-repo");

    let html = "";

    html += repoTemplate.outerHTML
        .replace("$url", `${STRUCTURES_ROOT}/`)
        .replace("$name", "InventivetalentDev/minecraft-assets");
    
    return html;
}

async function renderItemList(url) {
    const folderTemplate = document.querySelector("#browse-templates .browse-list-folder");
    const fileTemplate = document.querySelector("#browse-templates .browse-list-file");

    let html = "";
    let list;

    try {
        const response = await fetch(`${url}_list.json`);
        list = await response.json();
    } catch (e) {
        return `Unable to load ${url}_list.json`;
    }

    for (let directory of list.directories) {
        html += folderTemplate.outerHTML
            .replace("$url", `${url}${directory}/`)
            .replace("$name", directory);
    }

    for (let file of list.files) {
        html += fileTemplate.outerHTML
            .replace("$url", `${url}${file}`)
            .replace("$name", file);
    }

    return html;
}

async function refresh(state) {
    if (state.page === "browse") {
        const browseList = document.getElementById("browse-list");

        if (state.url === null) {
            browseList.innerHTML = renderRepoList();
        } else {
            browseList.innerHTML = await renderItemList(state.url);
        }

        document.getElementById("browse").style.display = "block";
    } else {
        document.getElementById("browse").style.display = "none";
    }
}

export async function init(state, refreshApp) {
    await initBrowseList(state, refreshApp);

    state.listeners.push(refresh);
}
