import { readSnbt } from './snbt.js';
import { extractSize, extractBlocks, extractPalette, lookupBlockstate, alterSize, translateBlocks } from './structure.js';

const example = `
"": {
    "size": [3i, 2i, 5i],
    "entities": [],
    "blocks": [
        {
            "pos": [1i, 0i, 1i],
            "state": 0i
        },
        {
            "pos": [I; 0i, 0i, 1i],
            "state": 1i
        }
    ],
    "palette": [
        {
            "Properties": {
                "snowy": "false"
            },
            "Name": "minecraft:grass_block"
        },
        {
            "Properties": {
                "half": "bottom",
                "waterlogged": "false",
                "powered": "false",
                "facing": "west",
                "open": "true"
            },
            "Name": "minecraft:oak_trapdoor"
        },
        {
            "Name": "minecraft:air"
        },
        {
            "Name": "minecraft:jigsaw"
        }
    ]
}
`;

const structure = readSnbt(example);
let expected, actual;

expected = [3, 2, 5];
actual = extractSize(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

expected = [
    {
        "pos": [1, 0, 1],
        "state": 0
    },
    {
        "pos": [0, 0, 1],
        "state": 1
    }
];
actual = extractBlocks(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

expected = [
    {
        "Properties": {
            "snowy": "false"
        },
        "Name": "minecraft:grass_block"
    },
    {
        "Properties": {
            "half": "bottom",
            "waterlogged": "false",
            "powered": "false",
            "facing": "west",
            "open": "true"
        },
        "Name": "minecraft:oak_trapdoor"
    },
    {
        "Name": "minecraft:air"
    },
    {
        "Name": "minecraft:jigsaw"
    }
];
actual = extractPalette(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

let block, palette;

palette = extractPalette(structure);

block = {"state": 2};
expected = {"Name": "minecraft:air"};
actual = lookupBlockstate(block, palette);

console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

block = {"nbt": {"final_state": "minecraft:oak_log[axis=x]"}, "state": 3};
expected = {"Properties": {"axis": "x"}, "Name": "minecraft:oak_log"};
actual = lookupBlockstate(block, palette);

console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

const example2 = `
"": {
    "size": [3i, 3i, 3i],
    "entities": [],
    "blocks": [
        {
            "pos": [1i, 1i, 1i],
            "state": 0i
        }
    ],
    "palette": [
        {
            "Properties": {
                "snowy": "false"
            },
            "Name": "minecraft:grass_block"
        }
    ]
}
`;

const structure2 = readSnbt(example2);

alterSize(structure2, [1, 1, 1]);
translateBlocks(structure2, [-1, -1, -1]);

expected = [1, 1, 1];
actual = extractSize(structure2);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

expected = [
    {
        "pos": [0, 0, 0],
        "state": 0
    }
];
actual = extractBlocks(structure2);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
