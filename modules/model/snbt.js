const SPACE = /^\s*/;
const STRING = /^"(?:[^\\"]|\\[\\"])*"/;
const SYMBOL = /^[:,]/;

const ARRAY_START = /^\[/;
const ARRAY_TYPE_MARKER = /^([BIL]);/;
const ARRAY_END = /^\]/;
const ARRAY_TYPES = {"B": 7, "I": 11, "L": 12};

const COMPOUND_START = /^\{/;
const COMPOUND_END = /^\}/;

const DECIMAL = /^([0-9]+(?:\.[0-9]*)?(?:e[+\-][0-9]+)?)([fd])/;
const DECIMAL_TYPES = {"f": 5, "d": 6};
const INTEGER = /^([0-9]+)([bsil])/;
const INTEGER_TYPES = {"b": 1, "s": 2, "i": 3, "l": 4};

function unescapeSnbtString(input) {
    let output = "";
    let escaped = false;
    for (let i = 1; i < input.length - 1; i++) {
        if (escaped) {
            // TODO: handle cases other than \\ and \"
            output += input[i];
            escaped = false;
        } else if (input[i] === "\\") {
            escaped = true;
        } else {
            output += input[i];
        }
    }

    return output;
}

function readSnbtPayload(input, offset) {
    let rest = input.substring(offset);
    let match, payload, type, itemType;

    match = rest.match(ARRAY_START);
    if (match) {
        offset += match[0].length;
        offset = readNbtSpace(input, offset);
        rest = input.substring(offset);

        match = rest.match(ARRAY_TYPE_MARKER);
        if (match) {
            type = ARRAY_TYPES[match[1]];

            offset += match[0].length;
            offset = readNbtSpace(input, offset);
            rest = input.substring(offset);
        } else {
            type = 9;
        }

        match = rest.match(ARRAY_END);
        if (match) {
            offset += match[0].length;

            // TODO: default itemType for empty lists should be... 10?
            return [type, [undefined, []], offset];
        }

        let items = [];

        while(true) {
            let _, item;

            [itemType, item, offset] = readSnbtPayload(input, offset);
            offset = readNbtSpace(input, offset);
            rest = input.substring(offset);

            items.push(item);

            match = rest.match(SYMBOL);
            if (match && match[0] === ",") {
                offset += match[0].length;
                offset = readNbtSpace(input, offset);
                rest = input.substring(offset);
                continue;
            }

            match = rest.match(ARRAY_END);
            if (match) {
                offset += match[0].length;
                rest = input.substring(offset);
                break;
            }

            throw new Error(`Unexpected character '${rest[0]}'`);
        }

        if (type === 9) {
            return [type, [itemType, items], offset];
        } else {
            return [type, items, offset];
        }
    }

    match = rest.match(COMPOUND_START);
    if (match) {
        type = 10;

        offset += match[0].length;
        offset = readNbtSpace(input, offset);
        rest = input.substring(offset);

        match = rest.match(COMPOUND_END);
        if (match) {
            offset += match[0].length;

            return [10, [], offset];
        }

        let payload = [];

        while (true) {
            let _, item;

            [item, offset] = readSnbtTag(input, offset);
            offset = readNbtSpace(input, offset);

            payload.push(item);
            rest = input.substring(offset);

            match = rest.match(SYMBOL);
            if (match && match[0] === ",") {
                offset += match[0].length;
                offset = readNbtSpace(input, offset);
                rest = input.substring(offset);
                continue;
            }

            match = rest.match(COMPOUND_END);
            if (match) {
                offset += match[0].length;
                rest = input.substring(offset);
                break;
            }

            throw new Error(`Unexpected character '${rest[0]}'`);
        }

        return [type, payload, offset];
    }

    match = rest.match(DECIMAL);
    if (match) {
        type = DECIMAL_TYPES[match[2]];
        payload = parseFloat(match[1]);

        offset += match[0].length;
        return [type, payload, offset];
    }

    match = rest.match(INTEGER);
    if (match) {
        type = INTEGER_TYPES[match[2]];
        payload = type === 4 ? BigInt(match[1]) : parseInt(match[1]);

        offset += match[0].length;
        return [type, payload, offset];
    }

    match = rest.match(STRING);
    if (match) {
        type = 8;
        let payload = unescapeSnbtString(match[0]);

        offset += match[0].length;
        return [type, payload, offset];
    }

    throw new Error(`Unexpected character '${rest[0]}'`);
}

function readSnbtTag(input, offset) {
    offset = readNbtSpace(input, offset);

    let rest = input.substring(offset);
    let match, type, name, payload;
    
    match = rest.match(STRING);
    if (match) {
        name = unescapeSnbtString(match[0]);
        
        offset += match[0].length;
        offset = readNbtSpace(input, offset);
        rest = input.substring(offset);
        
        match = rest.match(SYMBOL);
        if (match && match[0] === ":") {
            offset += match[0].length;
            offset = readNbtSpace(input, offset);
            rest = input.substring(offset);

            [type, payload, offset] = readSnbtPayload(input, offset);

            return [{type, name, payload}, offset];
        }
    }

    throw new Error(`Unexpected character '${rest[0]}'`);
}

function readNbtSpace(input, offset) {
    const rest = input.substring(offset);
    const match = rest.match(SPACE);

    return offset + match[0].length;
}

export function readSnbt(input) {
    let [tag, offset] = readSnbtTag(input, 0);

    offset = readNbtSpace(input, offset);

    if (offset < input.length) {
        throw new Error(`Unexpected characters at position ${offset}`);
    }

    return tag;
}

function escapeSnbtString(input) {
    let output = "";
    output += "\"";
    for (let i = 0; i < input.length; i++) {
        switch (input[i]) {
            case "\\":
            case "\"":
                output += "\\" + input[i];
                break;
            default:
                output += input[i];
                break;
        }
    }
    output += "\"";
    return output;
}

function writeSnbtPayload(type, payload, space, level) {
    const dedent = (space === null ? "" : space.repeat(level));
    level += 1;
    const indent = (space === null ? "" : space.repeat(level));
    const newline = (space === null ? "" : "\n")

    switch (type) {
        case 1:
            return payload + "b";
        case 2:
            return payload + "s";
        case 3:
            return payload + "i";
        case 4:
            return payload + "l";
        case 5:
            return payload + "f";
        case 6:
            return payload + "d";
        case 7:
            return `[B;${newline}${indent}` + payload.map((item) => writeSnbtPayload(1, item, space, level)).join(`,${newline}${indent}`) + `${newline}${dedent}]`;
        case 8:
            return escapeSnbtString(payload);
        case 9:
            if (space !== null && payload[0] !== 9 && payload[0] !== 10) {
                // if this list does not contain lists or compounds, put the elements on one line, with an extra space after each comma
                return `[` + payload[1].map((item) => writeSnbtPayload(payload[0], item, space, level)).join(`, `) + `]`;
            }
            return `[${newline}${indent}` + payload[1].map((item) => writeSnbtPayload(payload[0], item, space, level)).join(`,${newline}${indent}`) + `${newline}${dedent}]`;
        case 10:
            return `{${newline}${indent}` + payload.map((item) => writeSnbtTag(item, space, level)).join(`,${newline}${indent}`) + `${newline}${dedent}}`;
        case 11:
            return `[I;${newline}${indent}` + payload.map((item) => writeSnbtPayload(3, item, space, level)).join(`,${newline}${indent}`) + `${newline}${dedent}]`;
        case 12:
            return `[L;${newline}${indent}` + payload.map((item) => writeSnbtPayload(4, item, space, level)).join(`,${newline}${indent}`) + `${newline}${dedent}]`;
        default:
            throw new Error(`Unsupported tag type ${type}`);
    }
}

export function writeSnbtTag(tag, space, level) {
    return (
        escapeSnbtString(tag.name)
        + ":"
        + (space === null ? "" : " ")
        + writeSnbtPayload(tag.type, tag.payload, space, level)
    );
}

export function writeSnbt(input, space) {
    if (typeof space === "number") {
        space = " ".repeat(space);
    }

    if (typeof space !== "string") {
        space = null;
    }

    return writeSnbtTag(input, space, 0);
}