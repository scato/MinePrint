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
            const items = new Array(length);

            offset += 4;

            for (let i = 0; i < length; i++) {
                [items[i], offset] = readNbtPayload(input, offset, itemType);
            }

            return [items, offset];
        case 10:
            const tags = new Array();

            while (offset < input.length && dataView.getUint8(offset) != 0) {
                let tag;
                [tag, offset] = readNbtTag(input, offset);
                tags.push(tag);
            }

            return [tags, offset];
        case 11:
            length = dataView.getInt32(offset);
            offset += 4;

            return [new Array(length).fill(0).map((_, i) => dataView.getInt16(offset + i * 2)), offset + length * 2];
        case 12:
            length = dataView.getInt32(offset);
            offset += 4;

            return [new Array(length).fill(0).map((_, i) => dataView.getInt32(offset + i * 4)), offset + length * 4];
        default:
            throw new Error(`Unsupported tag type ${type}`);
    }
}

function readNbtTag(input, offset) {
    const dataView = new DataView(input.buffer);
    const tag = {};

    tag.type = dataView.getUint8(offset);
    tag.itemType = null;

    offset += 1;

    const nameLength = dataView.getUint16(offset);
    const nameBytes = input.slice(offset + 2, offset + 2 + nameLength);
    tag.name = new TextDecoder().decode(nameBytes);

    offset += 2 + nameLength;

    if (tag.type === 9) {
        tag.itemType = dataView.getUint8(offset);
        // don't increment, we need the itemType inside readNbtPayload as well
    }

    [tag.payload, offset] = readNbtPayload(input, offset, tag.type);

    return [tag, offset];
}

/**
 * 
 * @param {Uint8Array} input 
 * @param {Number} offset 
 * @returns Object
 */
export function readNbt(input) {
    let [tag, offset] = readNbtTag(input, 0);

    return tag;
}
