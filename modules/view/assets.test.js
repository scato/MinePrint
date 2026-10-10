import { lookupModel, lookupParts } from './assets.js';

function assertDeepEqual(expected, actual) {
    console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
}

const blockStateFile = {
    "one_variant": {
        "variants": {
            "": {
                "model": "a"
            }
        }
    },
    "random_variant": {
        "variants": {
            "": [
                {
                    "model": "b1"
                },
                {
                    "model": "b2"
                }
            ]
        }
    },
    "shorthand_variants": {
        "variants": {
            "x=1,y=1": {
                "model": "c11"
            },
            "x=2,y=1": {
                "model": "c21"
            },
            "x=1,y=2": {
                "model": "c12"
            }
        }
    },
    "simple_multipart": {
        "multipart": [
            {
                "apply": {
                    "model": "d0"
                }
            },
            {
                "apply": {
                    "model": "d1"
                },
                "when": {
                    "x": 1
                }
            },
            {
                "apply": {
                    "model": "d2"
                },
                "when": {
                    "y": 2
                }
            }
        ]
    },
    "complex_multipart": {
        "multipart": [
            {
                "apply": {
                    "model": "d0"
                }
            },
            {
                "apply": {
                    "model": "d1"
                },
                "when": {
                    "AND": [
                        {
                            "x": 1
                        },
                        {
                            "y": 1
                        }
                    ]
                }
            },
            {
                "apply": {
                    "model": "d2"
                },
                "when": {
                    "OR": [
                        {
                            "x": 2
                        },
                        {
                            "y": 2
                        }
                    ]
                }
            }
        ]
    },
};

let blockstate, expected, actual;
let blockstate1, blockstate2, blockstate3;
let expected1, expected2, expected3;
let actual1, actual2, actual3;

blockstate = {Name: "one_variant"};
expected = [{"model": "a"}];
actual = lookupParts(blockstate, 0, blockStateFile);

assertDeepEqual(expected, actual);

blockstate = {Name: "random_variant"};
expected1 = [{"model": "b1"}];
expected2 = [{"model": "b2"}];
expected3 = [{"model": "b1"}];
actual1 = lookupParts(blockstate, 0, blockStateFile);
actual2 = lookupParts(blockstate, 1, blockStateFile);
actual3 = lookupParts(blockstate, 2, blockStateFile);

assertDeepEqual(expected1, actual1);
assertDeepEqual(expected2, actual2);
assertDeepEqual(expected3, actual3);

blockstate1 = {Name: "shorthand_variants", Properties: {"x": 1, "y": 1}};
blockstate2 = {Name: "shorthand_variants", Properties: {"x": 2, "y": 1}};
blockstate3 = {Name: "shorthand_variants", Properties: {"x": 1, "y": 2}};
expected1 = [{"model": "c11"}];
expected2 = [{"model": "c21"}];
expected3 = [{"model": "c12"}];
actual1 = lookupParts(blockstate1, 0, blockStateFile);
actual2 = lookupParts(blockstate2, 0, blockStateFile);
actual3 = lookupParts(blockstate3, 0, blockStateFile);

assertDeepEqual(expected1, actual1);
assertDeepEqual(expected2, actual2);
assertDeepEqual(expected3, actual3);

blockstate1 = {Name: "simple_multipart", Properties: {"x": 1, "y": 1}};
blockstate2 = {Name: "simple_multipart", Properties: {"x": 2, "y": 1}};
blockstate3 = {Name: "simple_multipart", Properties: {"x": 1, "y": 2}};
expected1 = [{"model": "d0"}, {"model": "d1"}];
expected2 = [{"model": "d0"}];
expected3 = [{"model": "d0"}, {"model": "d1"}, {"model": "d2"}];
actual1 = lookupParts(blockstate1, 0, blockStateFile);
actual2 = lookupParts(blockstate2, 0, blockStateFile);
actual3 = lookupParts(blockstate3, 0, blockStateFile);

assertDeepEqual(expected1, actual1);
assertDeepEqual(expected2, actual2);
assertDeepEqual(expected3, actual3);

blockstate1 = {Name: "complex_multipart", Properties: {"x": 1, "y": 1}};
blockstate2 = {Name: "complex_multipart", Properties: {"x": 2, "y": 1}};
blockstate3 = {Name: "complex_multipart", Properties: {"x": 1, "y": 2}};
expected1 = [{"model": "d0"}, {"model": "d1"}];
expected2 = [{"model": "d0"}, {"model": "d2"}];
expected3 = [{"model": "d0"}, {"model": "d2"}];
actual1 = lookupParts(blockstate1, 0, blockStateFile);
actual2 = lookupParts(blockstate2, 0, blockStateFile);
actual3 = lookupParts(blockstate3, 0, blockStateFile);

assertDeepEqual(expected1, actual1);
assertDeepEqual(expected2, actual2);
assertDeepEqual(expected3, actual3);

const modelFile = {
    "simple_parent": {
        "elements": [
            {
                "from": [0, 0, 0],
                "to": [16, 16, 16],
                "faces": {
                    "down": {"texture": "#all"}
                }
            }
        ]
    },
    "simple_model": {
        "parent": "minecraft:block/simple_parent",
        "textures": {
            "all": "minecraft:block/some_texture"
        }
    },
    "complex_parent": {
        "parent": "minecraft:block/simple_parent",
        "textures": {
            "all": "minecraft:block/some_texture"
        },
        "elements": [
            {
                "from": [0, 0, 0],
                "to": [16, 16, 16],
                "faces": {
                    "down": {"texture": "#bottom"}
                }
            }
        ]
    },
    "complex_model": {
        "parent": "minecraft:block/complex_parent",
        "textures": {
            "bottom": "minecraft:block/some_texture"
        },
        "elements": [
            {
                "from": [0, 0, 0],
                "to": [16, 16, 16],
                "faces": {
                    "up": {"texture": "#all"}
                }
            }
        ]
    },
};

let part;

expected1 = [{"from": [0, 0, 0], "to": [16, 16, 16], "faces": {"down": {"texture": "#all"}}}];
expected2 = {"all": "minecraft:block/some_texture"};
actual = lookupModel("minecraft:block/simple_model", modelFile);

assertDeepEqual(expected1, actual.elements);
assertDeepEqual(expected2, actual.textures);

expected1 = [
    {"from": [0, 0, 0], "to": [16, 16, 16], "faces": {"down": {"texture": "#all"}}},
    {"from": [0, 0, 0], "to": [16, 16, 16], "faces": {"down": {"texture": "#bottom"}}},
    {"from": [0, 0, 0], "to": [16, 16, 16], "faces": {"up": {"texture": "#all"}}},
];
expected2 = {
    "all": "minecraft:block/some_texture",
    "bottom": "minecraft:block/some_texture",
}
actual = lookupModel("minecraft:block/complex_model", modelFile);

assertDeepEqual(expected1, actual.elements);
assertDeepEqual(expected2, actual.textures);
