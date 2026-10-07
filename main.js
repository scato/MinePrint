import { refresh } from './modules/app.js';

import { init as initBlueprint } from './modules/view/blueprint.js';
import { init as initBrowse } from './modules/view/browse.js';
import { init as initEdit } from './modules/view/edit.js';
import { init as initStart } from './modules/view/start.js';

document.addEventListener("DOMContentLoaded", async () => {
    const state = {
        page: "start",
        listeners: [],
    };

    await Promise.all([
        initStart(state, refresh),
        initBrowse(state, refresh),
        initBlueprint(state, refresh),
        initEdit(state, refresh),
    ]);

    refresh(state);
});
