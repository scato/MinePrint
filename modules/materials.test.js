import { generateMaterials } from './materials.js';

const size = [3, 2, 3];

const blocks = [
    {
        pos: [0, 0, 1],
        state: 0
    },
    {
        pos: [1, 0, 1],
        state: 0
    },
    {
        pos: [2, 0, 1],
        state: 0
    },
    {
        pos: [0, 1, 1],
        state: 1
    },
    {
        pos: [1, 1, 1],
        state: 2
    },
    {
        pos: [2, 1, 1],
        state: 3
    },
    {
        pos: [1, 0, 0],
        state: 4
    },
    {
        pos: [1, 1, 0],
        state: 5
    },
    {
        pos: [0, 0, 0],
        state: 6
    },
    {
        nbt: {
            "final_state": "minecraft:oak_log[axis=y]"
        },
        pos: [0, 0, 2],
        state: 7
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
        Properties: {
            "part": "foot"
        },
        Name: "minecraft:red_bed"
    },
    {
        Properties: {
            "part": "head"
        },
        Name: "minecraft:red_bed"
    },
    {
        Properties: {
            "half": "lower"
        },
        Name: "minecraft:oak_door"
    },
    {
        Properties: {
            "half": "upper"
        },
        Name: "minecraft:oak_door"
    },
    {
        Properties: {
            "type": "double"
        },
        Name: "minecraft:oak_slab"
    },
    {
        Name: "minecraft:jigsaw"
    }
];

const materials = generateMaterials(size, blocks, palette);
const names = Object.keys(materials);

// 6 materials
console.assert(names.length === 6, `${names.length} === 6`);

// 2 layers
console.assert(materials[names[0]].length === 2, `${materials[names[0]].length} === 2`);

let expected, actual;

// 3 grass_block at layer 0
expected = [3, 0];
actual = materials["minecraft:grass_block"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 poppy at layer 1
expected = [0, 1];
actual = materials["minecraft:poppy"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 oak_log at layer 0
expected = [1, 0];
actual = materials["minecraft:oak_log"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 red_bed at layer 1
expected = [0, 1];
actual = materials["minecraft:red_bed"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 oak_door at layer 0
expected = [1, 0];
actual = materials["minecraft:oak_door"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 2 oak_slab at layer 0
expected = [2, 0];
actual = materials["minecraft:oak_slab"];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
