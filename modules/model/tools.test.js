import { readSnbt } from './snbt.js';
import { extractSize, extractBlocks, extractPalette } from './structure.js';
import { trim } from './tools.js';

const example = `
"": {
    "size": [72i, 234i, 51i],
    "entities": [],
    "blocks": [
        {
            "pos": [12i, 20i, 31i],
            "state": 0i
        },
        {
            "pos": [I; 10i, 21i, 35i],
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

trim(structure);

expected = [3, 2, 5];
actual = extractSize(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);

expected = [
    {
        "pos": [2, 0, 0],
        "state": 0
    },
    {
        "pos": [0, 1, 4],
        "state": 1
    }
];
actual = extractBlocks(structure);
console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
