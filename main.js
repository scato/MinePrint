import { refresh } from './modules/app.js';

import { init as initBlueprint } from './modules/view/blueprint.js';
import { init as initStart } from './modules/view/start.js';

const state = {
    page: "start",
    listeners: [],
};

document.addEventListener("DOMContentLoaded", () => {
    initBlueprint(state, refresh);
    initStart(state, refresh);

    // initFileUpload(document.querySelector("#start-file-upload"));
    // initFileUpload(document.querySelector("#blueprint-file-upload"));
    // initBrowse(document.querySelector("#start-browse"));
});
