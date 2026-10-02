import { readSnbt, writeSnbt } from './snbt.js';

function assertTagFromInput(expected, input) {
    const tag = readSnbt(input);

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
    "\"foo\":42b"
);

assertTagFromInput(
    {type: 2, name: "foo", payload: 42},
    "\"foo\":42s"
);

assertTagFromInput(
    {type: 3, name: "foo", payload: 42},
    "\"foo\":42i"
);

assertTagFromInput(
    {type: 4, name: "foo", payload: BigInt(42)},
    "\"foo\":42l"
);

assertTagFromInput(
    {type: 5, name: "foo", payload: 0.15625},
    "\"foo\":0.15625f"
);

assertTagFromInput(
    {type: 6, name: "foo", payload: 0.01171875},
    "\"foo\":0.01171875d"
);

assertTagFromInput(
    {type: 7, name: "foo", payload: [1, 2, 3]},
    "\"foo\":[B;1b,2b,3b]"
);

assertTagFromInput(
    {type: 8, name: "foo", payload: "\"\\bär\""},
    "\"foo\":\"\\\"\\\\bär\\\"\""
);

assertTagFromInput(
    {type: 9, name: "foo", payload: [1, [1, 2, 3]]},
    "\"foo\":[1b,2b,3b]"
);

assertTagFromInput(
    {type: 10, name: "foo", payload: [{type: 1, name: "bar", payload: 42}]},
    "\"foo\":{\"bar\":42b}"
);

assertTagFromInput(
    {type: 11, name: "foo", payload: [1, 2, 3]},
    "\"foo\":[I;1i,2i,3i]"
);

assertTagFromInput(
    {type: 12, name: "foo", payload: [BigInt(1), BigInt(2), BigInt(3)]},
    "\"foo\":[L;1l,2l,3l]"
);

// nested list, with whitespace
assertTagFromInput(
    {type: 9, name: "foo", payload: [9, [[1, [1, 2]], [1, [3, 4]]]]},
    "\"foo\": [\n\t[1b, 2b],\n\t[3b, 4b]\n]\n"
);

// nested compound, with whitespace
assertTagFromInput(
    {type: 10, name: "foo", payload: [{type: 10, name: "bar", payload: [{type: 1, name: "baz", payload: 42}]}]},
    "\"foo\": {\n    \"bar\": {\n        \"baz\": 42b\n    }\n}\n"
);

function assertOutputFromTag(expected, tag, space) {
    const output = writeSnbt(tag, space);

    console.assert(output === expected, `"${output}" === "${expected}"`);
}

assertOutputFromTag(
    "\"foo\":42b",
    {type: 1, name: "foo", payload: 42}
);

assertOutputFromTag(
    "\"foo\":42s",
    {type: 2, name: "foo", payload: 42}
);

assertOutputFromTag(
    "\"foo\":42i",
    {type: 3, name: "foo", payload: 42}
);

assertOutputFromTag(
    "\"foo\":42l",
    {type: 4, name: "foo", payload: BigInt(42)}
);

assertOutputFromTag(
    "\"foo\":0.15625f",
    {type: 5, name: "foo", payload: 0.15625}
);

assertOutputFromTag(
    "\"foo\":0.01171875d",
    {type: 6, name: "foo", payload: 0.01171875}
);

assertOutputFromTag(
    "\"foo\":[B;1b,2b,3b]",
    {type: 7, name: "foo", payload: [1, 2, 3]}
);

assertOutputFromTag(
    "\"foo\":\"\\\"\\\\bär\\\"\"",
    {type: 8, name: "foo", payload: "\"\\bär\""}
);

assertOutputFromTag(
    "\"foo\":[1b,2b,3b]",
    {type: 9, name: "foo", payload: [1, [1, 2, 3]]}
);

assertOutputFromTag(
    "\"foo\":{\"bar\":42b}",
    {type: 10, name: "foo", payload: [{type: 1, name: "bar", payload: 42}]}
);

assertOutputFromTag(
    "\"foo\":[I;1i,2i,3i]",
    {type: 11, name: "foo", payload: [1, 2, 3]}
);

assertOutputFromTag(
    "\"foo\":[L;1l,2l,3l]",
    {type: 12, name: "foo", payload: [BigInt(1), BigInt(2), BigInt(3)]}
);

// nested list, with whitespace
assertOutputFromTag(
    "\"foo\": [\n\t[1b, 2b],\n\t[3b, 4b]\n]",
    {type: 9, name: "foo", payload: [9, [[1, [1, 2]], [1, [3, 4]]]]},
    "\t"
);

// nested compound, with whitespace
assertOutputFromTag(
    "\"foo\": {\n    \"bar\": {\n        \"baz\": 42b\n    }\n}",
    {type: 10, name: "foo", payload: [{type: 10, name: "bar", payload: [{type: 1, name: "baz", payload: 42}]}]},
    4
);
