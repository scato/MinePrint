import { generateLayers } from './blueprint.js';
import { renderBlueprint } from './html.js';

const size = [1, 2, 3];

const blocks = [
    {
        pos: [0, 0, 1],
        state: 0
    },
    {
        pos: [0, 1, 1],
        state: 1
    },
    {
        nbt: {
            "final_state": "minecraft:oak_log[axis=y]"
        },
        pos: [0, 0, 2],
        state: 2
    }
];

const palette = [
    {
        Properties: {
            snowy: "false"
        },
        Name: "minecraft:grass_block"
    },
    {
        Name: "minecraft:poppy"
    },
    {
        Name: "minecraft:jigsaw"
    }
];

const layers = generateLayers(size, blocks, palette, 1);

// should have padding in z and x
console.assert(layers.length === 2, `${layers.length} === 2`);
console.assert(layers[0].length === 5, `${layers[0].length} === 5`);
console.assert(layers[0][0].length === 3, `${layers[0][0].length} === 3`);

// layers[y][z + 1][x + 1]
console.assert(layers[0][1][1] === null, `${layers[0][1][1]} === null`);
console.assert(layers[0][2][1].sprite === "grass-block-top", `"${layers[0][2][1].sprite}" === "grass-block-top"`);
console.assert(layers[1][2][1].sprite === "poppy", `"${layers[1][2][1].sprite}" === "poppy"`);
console.assert(layers[0][3][1].sprite === "oak-log-top", `"${layers[0][3][1].sprite}" === "oak-log-top"`);

document.addEventListener("DOMContentLoaded", () => {
    // get all block names from minecraft-assets
    fetch("https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/26.3/assets/minecraft/blockstates/_list.json")
        .then((response) => {
            return response.blob();
        })
        .then((blob) => {
            return blob.text();
        })
        .then((text) => {
            const files = JSON.parse(text).files;
            const blockNames = files.map((file) => "minecraft:" + file.replace(".json", ""));
            
            let blockStates = new Array();
            for (let name of blockNames) {
                if (name.match(/_bed$/)) {
                    blockStates.push({Properties: {part: "foot", facing: "east"}, Name: name});
                    blockStates.push({Properties: {part: "foot", facing: "north"}, Name: name});
                    blockStates.push({Properties: {part: "foot", facing: "west"}, Name: name});
                    blockStates.push({Properties: {part: "foot", facing: "south"}, Name: name});
                    blockStates.push({Properties: {part: "head", facing: "east"}, Name: name});
                    blockStates.push({Properties: {part: "head", facing: "north"}, Name: name});
                    blockStates.push({Properties: {part: "head", facing: "west"}, Name: name});
                    blockStates.push({Properties: {part: "head", facing: "south"}, Name: name});
                } else if (name.match(/_coral_wall_fan$/)) {
                    blockStates.push({Properties: {facing: "east"}, Name: name});
                    blockStates.push({Properties: {facing: "north"}, Name: name});
                    blockStates.push({Properties: {facing: "west"}, Name: name});
                    blockStates.push({Properties: {facing: "south"}, Name: name});
                } else if (name.match(/_door$/)) {
                    blockStates.push({Properties: {half: "lower"}, Name: name});
                    blockStates.push({Properties: {half: "upper"}, Name: name});
                } else if (name.match(/(:|_)glass_pane$/)) {
                    blockStates.push({Properties: {north: "true", east: "false", south: "true", west: "false"}, Name: name});
                    blockStates.push({Properties: {north: "false", east: "true", south: "false", west: "true"}, Name: name});
                } else if (name.match(/_glazed_terracotta$/)) {
                    blockStates.push({Properties: {facing: "east"}, Name: name});
                    blockStates.push({Properties: {facing: "north"}, Name: name});
                    blockStates.push({Properties: {facing: "west"}, Name: name});
                    blockStates.push({Properties: {facing: "south"}, Name: name});
                } else if (name.match(/_log$/) || name.match(/(crimson)_stem$/) || name === "minecraft:bamboo_block" || name === "minecraft:basalt" || name === "minecraft:hay_block" || name === "minecraft:polished_basalt" || name === "minecraft:stripped_bamboo_block") {
                    blockStates.push({Properties: {axis: "x"}, Name: name});
                    blockStates.push({Properties: {axis: "y"}, Name: name});
                    blockStates.push({Properties: {axis: "z"}, Name: name});
                } else if (name.match(/_slab$/)) {
                    blockStates.push({Properties: {type: "bottom"}, Name: name});
                    blockStates.push({Properties: {type: "double"}, Name: name});
                    blockStates.push({Properties: {type: "top"}, Name: name});
                } else if (name.match(/_stairs$/)) {
                    blockStates.push({Properties: {facing: "east", half: "bottom"}, Name: name});
                    blockStates.push({Properties: {facing: "north", half: "bottom"}, Name: name});
                    blockStates.push({Properties: {facing: "west", half: "bottom"}, Name: name});
                    blockStates.push({Properties: {facing: "south", half: "bottom"}, Name: name});
                    blockStates.push({Properties: {facing: "east", half: "top"}, Name: name});
                    blockStates.push({Properties: {facing: "north", half: "top"}, Name: name});
                    blockStates.push({Properties: {facing: "west", half: "top"}, Name: name});
                    blockStates.push({Properties: {facing: "south", half: "top"}, Name: name});
                } else if (name.match(/(:|_)wall_torch$/)) {
                    blockStates.push({Properties: {facing: "east"}, Name: name});
                    blockStates.push({Properties: {facing: "north"}, Name: name});
                    blockStates.push({Properties: {facing: "west"}, Name: name});
                    blockStates.push({Properties: {facing: "south"}, Name: name});
                } else if (name === "minecraft:rail") {
                    blockStates.push({Properties: {shape: "ascending_east"}, Name: name});
                    blockStates.push({Properties: {shape: "ascending_north"}, Name: name});
                    blockStates.push({Properties: {shape: "ascending_south"}, Name: name});
                    blockStates.push({Properties: {shape: "ascending_west"}, Name: name});
                    blockStates.push({Properties: {shape: "east_west"}, Name: name});
                    blockStates.push({Properties: {shape: "north_east"}, Name: name});
                    blockStates.push({Properties: {shape: "north_south"}, Name: name});
                    blockStates.push({Properties: {shape: "north_west"}, Name: name});
                    blockStates.push({Properties: {shape: "south_east"}, Name: name});
                    blockStates.push({Properties: {shape: "south_west"}, Name: name});
                } else if (name !== "minecraft:jigsaw") {
                    blockStates.push({Name: name});
                }
            }

            const width = 50;
            const depth = 42;
            const numStates = blockStates.length;
            blockStates = blockStates.slice(0, width * depth);
            console.log(`Showing ${blockStates.length} of ${numStates} blockstates`);

            const size = [width, 1, depth];
            const blocks = blockStates.map((_, i) => ({pos: [i % width, 0, Math.floor(i / width)], state: i}));
            const palette = blockStates;

            const layers = generateLayers(size, blocks, palette, 0);
            document.querySelector("#blueprint-test").innerHTML = renderBlueprint(layers);
        });
});
