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

const materials = [
    {
        sprite: "grass-block",
        name: "grass_block",
        amounts: [4, 0]
    },
    {
        sprite: "red-bed",
        name: "red_bed",
        amounts: [0, 1]
    },
    {
        sprite: "poppy",
        name: "poppy",
        amounts: [0, 1]
    },
];

const languageFile = {
    "block.minecraft.grass_block": "Grass Block",
    "block.minecraft.red_bed": "Red bed",
    "block.minecraft.poppy": "Poppy",
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("html-test").innerHTML = renderBlueprint(blocks, materials, languageFile);
});
