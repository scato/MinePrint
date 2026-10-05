import { refresh } from './modules/app.js';

import { init as initBlueprint } from './modules/view/blueprint.js';
import { init as initBrowse } from './modules/view/browse.js';
import { init as initStart } from './modules/view/start.js';

document.addEventListener("DOMContentLoaded", async () => {
    const state = {
        page: "start",
        listeners: [],
    };

    initBlueprint(state, refresh);
    await initBrowse(state, refresh);
    initStart(state, refresh);

    refresh(state);
});
