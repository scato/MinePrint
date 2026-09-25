import { readSnbt } from './snbt.js';
import { extractSize, extractBlocks, extractPalette } from './structure.js';

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
    }
];
actual = extractPalette(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
