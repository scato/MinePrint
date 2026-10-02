function readNbtPayload(input, offset, type) {
    const dataView = new DataView(input.buffer);
    let length;

    switch (type) {
        case 1:
            return [dataView.getInt8(offset), offset + 1];
        case 2:
            return [dataView.getInt16(offset), offset + 2];
        case 3:
            return [dataView.getInt32(offset), offset + 4];
        case 4:
            return [dataView.getBigInt64(offset), offset + 8];
        case 5:
            return [dataView.getFloat32(offset), offset + 4];
        case 6:
            return [dataView.getFloat64(offset), offset + 8];
        case 7:
            length = dataView.getInt32(offset);
            offset += 4;

            return [new Array(length).fill(0).map((_, i) => dataView.getInt8(offset + i)), offset + length];
        case 8:
            length = dataView.getUint16(offset);
            offset += 2;

            return [new TextDecoder().decode(input.slice(offset, offset + length)), offset + length];
        case 9:
            const itemType = dataView.getUint8(offset);
            offset += 1;

            length = dataView.getInt32(offset);
            offset += 4;

            const items = new Array(length);

            for (let i = 0; i < length; i++) {
                [items[i], offset] = readNbtPayload(input, offset, itemType);
            }

            return [[itemType, items], offset];
        case 10:
            const tags = new Array();

            while (true) {
                if (offset === input.length) {
                    break;
                }

                if (dataView.getUint8(offset) === 0) {
                    offset += 1;
                    break;
                }

                let tag;
                [tag, offset] = readNbtTag(input, offset);
                tags.push(tag);
            }

            return [tags, offset];
        case 11:
            length = dataView.getInt32(offset);
            offset += 4;

            return [new Array(length).fill(0).map((_, i) => dataView.getInt32(offset + i * 4)), offset + length * 4];
        case 12:
            length = dataView.getInt32(offset);
            offset += 4;

            return [new Array(length).fill(0).map((_, i) => dataView.getBigInt64(offset + i * 8)), offset + length * 8];
        default:
            throw new Error(`Unsupported tag type ${type}`);
    }
}

function readNbtTag(input, offset) {
    const dataView = new DataView(input.buffer);
    let payload;

    const type = dataView.getUint8(offset);
    offset += 1;

    const nameLength = dataView.getUint16(offset);
    offset += 2;

    const nameBytes = input.slice(offset, offset + nameLength);
    const name = new TextDecoder().decode(nameBytes);
    offset += nameLength;

    [payload, offset] = readNbtPayload(input, offset, type);

    return [{type, name, payload}, offset];
}

/**
 * Read NBT and return a tag object
 * 
 * @param {Uint8Array} input 
 * @param {Number} offset 
 * @returns Object
 */
export function readNbt(input) {
    let [tag, offset] = readNbtTag(input, 0);

    if (offset < input.length) {
        throw new Error(`Unexpected bytes at position ${offset}`);
    }

    return tag;
}

function writeNbtPayload(type, payload, output, offset) {
    const dataView = new DataView(output);

    switch (type) {
        case 1:
            output.resize(offset + 1);
            dataView.setInt8(offset, payload);
            return offset + 1;
        case 2:
            output.resize(offset + 2);
            dataView.setInt16(offset, payload);
            return offset + 2;
        case 3:
            output.resize(offset + 4);
            dataView.setInt32(offset, payload);
            return offset + 4;
        case 4:
            output.resize(offset + 8);
            dataView.setBigInt64(offset, payload);
            return offset + 8;
        case 5:
            output.resize(offset + 4);
            dataView.setFloat32(offset, payload);
            return offset + 4;
        case 6:
            output.resize(offset + 8);
            dataView.setFloat64(offset, payload);
            return offset + 8;
        case 7:
            output.resize(offset + 4);
            dataView.setInt32(offset, payload.length);
            offset += 4;
            for (let i = 0; i < payload.length; i++) {
                offset = writeNbtPayload(1, payload[i], output, offset);
            }
            return offset;
        case 8:
            const nameBytes = new TextEncoder().encode(payload);
            output.resize(offset + 2);
            dataView.setUint16(offset, nameBytes.length);
            offset += 2;
            output.resize(offset + nameBytes.length);
            new Uint8Array(output).set(nameBytes, offset);
            return offset + nameBytes.length;
        case 9:
            const [itemType, items] = payload;

            output.resize(offset + 1);
            dataView.setUint8(offset, itemType);
            offset += 1;

            output.resize(offset + 4);
            dataView.setInt32(offset, items.length);
            offset += 4;

            for (let i = 0; i < items.length; i++) {
                offset = writeNbtPayload(itemType, items[i], output, offset);
            }
            return offset;
        case 10:
            for (let i = 0; i < payload.length; i++) {
                offset = writeNbtTag(payload[i], output, offset);
            }
            output.resize(offset + 1);
            dataView.setUint8(offset, 0);
            offset += 1;
            return offset;
        case 11:
            output.resize(offset + 4);
            dataView.setInt32(offset, payload.length);
            offset += 4;
            for (let i = 0; i < payload.length; i++) {
                offset = writeNbtPayload(3, payload[i], output, offset);
            }
            return offset;
        case 12:
            output.resize(offset + 4);
            dataView.setInt32(offset, payload.length);
            offset += 4;
            for (let i = 0; i < payload.length; i++) {
                offset = writeNbtPayload(4, payload[i], output, offset);
            }
            return offset;
        default:
            throw new Error(`Unsupported tag type ${type}`);
    }
}

function writeNbtTag(tag, output, offset) {
    const dataView = new DataView(output);
    
    output.resize(offset + 1);
    dataView.setUint8(offset, tag.type);
    offset += 1;

    offset = writeNbtPayload(8, tag.name, output, offset);

    return writeNbtPayload(tag.type, tag.payload, output, offset);
}

/**
 * Take a tag object and write out its NBT
 * 
 * @param {Object} tag
 * @returns Uint8Array
 */
export function writeNbt(tag) {
    const output = new ArrayBuffer(0, {maxByteLength: 1024 * 1024});

    const offset = writeNbtTag(tag, output, 0);

    if (tag.type === 10) {
        // trim trailing TAG_End
        output.resize(offset - 1);
    }

    return new Uint8Array(output);
}
