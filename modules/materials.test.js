import { generateMaterials, lookupMaterialName } from './materials.js';

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

// 6 materials
console.assert(materials.length === 6, `${materials.length} === 6`);

// 2 layers
console.assert(materials[0].amounts.length === 2, `${materials[0].amounts.length} === 2`);

let expected, actual;

// 3 grass_block at layer 0
expected = {sprite: "grass-block", name: "grass_block", amounts: [3, 0]};
actual = materials[0];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 poppy at layer 1
expected = {sprite: "poppy", name: "poppy", amounts: [0, 1]};
actual = materials[1];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 red_bed at layer 1
expected = {sprite: "red-bed", name: "red_bed", amounts: [0, 1]};
actual = materials[2];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 oak_door at layer 0
expected = {sprite: "oak-door", name: "oak_door", amounts: [1, 0]};
actual = materials[3];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 2 oak_slab at layer 0
expected = {sprite: "oak-slab", name: "oak_slab", amounts: [2, 0]};
actual = materials[4];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

// 1 oak_log at layer 0
expected = {sprite: "oak-log", name: "oak_log", amounts: [1, 0]};
actual = materials[5];
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

const languageFile = {
    "block.minecraft.grass_block": "Grass Block",
};

expected = "Grass Block";
actual = lookupMaterialName("grass_block", languageFile);
console.assert(actual === expected, `"${actual}" === "${expected}"`);
