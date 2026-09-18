import { readNbt, writeNbt } from './nbt.js';

function assertTagFromInput(expected, hex) {
    const input = Uint8Array.fromHex(hex);
    const tag = readNbt(input);

    console.assert(tag.type === expected.type, `${JSON.stringify(tag.type)} === ${JSON.stringify(expected.type)}`);
    console.assert(tag.name === expected.name, `${JSON.stringify(tag.name)} === ${JSON.stringify(expected.name)}`);

    if (typeof tag.payload === 'bigint' || typeof expected.payload === 'bigint') {
        console.assert(tag.payload === expected.payload, `${tag.payload} === ${expected.payload}`);
    } else if (typeof tag.payload[0] === 'bigint' || typeof expected.payload[0] === 'bigint') {
        console.assert(tag.payload.toString() === expected.payload.toString(), `${tag.payload} === ${expected.payload}`);
    } else {
        console.assert(JSON.stringify(tag.payload) === JSON.stringify(expected.payload), `${JSON.stringify(tag.payload)} === ${JSON.stringify(expected.payload)}`);
    }
}

assertTagFromInput(
    {type: 1, name: "foo", payload: 42},
    "010003666f6f2a"
);

assertTagFromInput(
    {type: 2, name: "foo", payload: 42},
    "020003666f6f002a"
);

assertTagFromInput(
    {type: 3, name: "foo", payload: 42},
    "030003666f6f0000002a"
);

assertTagFromInput(
    {type: 4, name: "foo", payload: BigInt(42)},
    "040003666f6f000000000000002a"
);

assertTagFromInput(
    {type: 5, name: "foo", payload: 0.15625},
    "050003666f6f3e200000"
);

assertTagFromInput(
    {type: 6, name: "foo", payload: 0.01171875},
    "060003666f6f3f88000000000000"
);

assertTagFromInput(
    {type: 7, name: "foo", payload: [1, 2, 3]},
    "070003666f6f00000003010203"
);

assertTagFromInput(
    {type: 8, name: "foo", payload: "\"\\bär\""},
    "080003666f6f0007225c62c3a47222"
);

assertTagFromInput(
    {type: 9, name: "foo", payload: [1, [1, 2, 3]]},
    "090003666f6f0100000003010203"
);

assertTagFromInput(
    {type: 10, name: "foo", payload: [{type: 1, name: "bar", payload: 42}]},
    "0a0003666f6f0100036261722a00"
);

assertTagFromInput(
    {type: 11, name: "foo", payload: [1, 2, 3]},
    "0b0003666f6f00000003000000010000000200000003"
);

assertTagFromInput(
    {type: 12, name: "foo", payload: [BigInt(1), BigInt(2), BigInt(3)]},
    "0c0003666f6f00000003000000000000000100000000000000020000000000000003"
);

// nested list
assertTagFromInput(
    {type: 9, name: "foo", payload: [9, [[1, [1, 2]], [1, [3, 4]]]]},
    "090003666f6f09000000020100000002010201000000020304"
);

// nested compound
assertTagFromInput(
    {type: 10, name: "foo", payload: [{type: 10, name: "bar", payload: [{type: 1, name: "baz", payload: 42}]}]},
    "0a0003666f6f0a000362617201000362617a2a00"
);

function assertOutputFromTag(expected, tag) {
    const output = writeNbt(tag);
    const hex = output.toHex();

    console.assert(hex === expected, `"${hex}" === "${expected}"`);
}

assertOutputFromTag(
    "010003666f6f2a",
    {type: 1, name: "foo", payload: 42}
);

assertOutputFromTag(
    "020003666f6f002a",
    {type: 2, name: "foo", payload: 42}
);

assertOutputFromTag(
    "030003666f6f0000002a",
    {type: 3, name: "foo", payload: 42}
);

assertOutputFromTag(
    "040003666f6f000000000000002a",
    {type: 4, name: "foo", payload: BigInt(42)}
);

assertOutputFromTag(
    "050003666f6f3e200000",
    {type: 5, name: "foo", payload: 0.15625}
);

assertOutputFromTag(
    "060003666f6f3f88000000000000",
    {type: 6, name: "foo", payload: 0.01171875}
);

assertOutputFromTag(
    "070003666f6f00000003010203",
    {type: 7, name: "foo", payload: [1, 2, 3]}
);

assertOutputFromTag(
    "080003666f6f0007225c62c3a47222",
    {type: 8, name: "foo", payload: "\"\\bär\""}
);

assertOutputFromTag(
    "090003666f6f0100000003010203",
    {type: 9, name: "foo", payload: [1, [1, 2, 3]]}
);

assertOutputFromTag(
    "0a0003666f6f0100036261722a",
    {type: 10, name: "foo", payload: [{type: 1, name: "bar", payload: 42}]}
);

assertOutputFromTag(
    "0b0003666f6f00000003000000010000000200000003",
    {type: 11, name: "foo", payload: [1, 2, 3]}
);

assertOutputFromTag(
    "0c0003666f6f00000003000000000000000100000000000000020000000000000003",
    {type: 12, name: "foo", payload: [BigInt(1), BigInt(2), BigInt(3)]}
);

// nested list
assertOutputFromTag(
    "090003666f6f09000000020100000002010201000000020304",
    {type: 9, name: "foo", payload: [9, [[1, [1, 2]], [1, [3, 4]]]]}
);

// nested compound
assertOutputFromTag(
    "0a0003666f6f0a000362617201000362617a2a00",
    {type: 10, name: "foo", payload: [{type: 10, name: "bar", payload: [{type: 1, name: "baz", payload: 42}]}]}
);
