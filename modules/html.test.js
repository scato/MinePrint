import { renderBlueprint } from './html.js';

let blocks = [
    [
        [
            null,
            null,
            null,
            null,
        ],
        [
            null,
            {"sprite": "grass-block-top"},
            {"sprite": "grass-block-top"},
            null,
        ],
        [
            null,
            {"sprite": "grass-block-top"},
            {"sprite": "grass-block-top"},
            null,
        ],
        [
            null,
            null,
            null,
            null,
        ],
    ],
    [
        [
            null,
            null,
            null,
            null,
        ],
        [
            null,
            {"sprite": "red-bed-top-head", "transform": "rotate(270deg)"},
            {"sprite": "poppy"},
            null,
        ],
        [
            null,
            {"sprite": "red-bed-top-foot", "transform": "rotate(270deg)"},
            null,
            null,
        ],
        [
            null,
            null,
            null,
            null,
        ],
    ],
];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("html-test").innerHTML = renderBlueprint(blocks);
});
