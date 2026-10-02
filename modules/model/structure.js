function hasTagWithName(childTags, name) {
    const tags = childTags.filter((tag) => tag.name === name);

    return tags.length > 0;
}

function extractTagByName(childTags, name) {
    const tags = childTags.filter((tag) => tag.name === name);

    if (tags.length === 0) {
        throw new Error(`Parent tag does not contain tag with name ${name}`);
    }

    return tags[0];
}

function extractListItems(listPayload) {
    return listPayload[1];
}

function extractCompoundProperties(compoundPayload) {
    const properties = {};
    for (let tag of compoundPayload) {
        properties[tag.name] = tag.payload;
    }
    return properties;
}

export function extractSize(structureTag) {
    const sizeTag = extractTagByName(structureTag.payload, "size");

    return extractListItems(sizeTag.payload);
}

export function extractBlocks(structureTag) {
    const blocksTag = extractTagByName(structureTag.payload, "blocks");

    return extractListItems(blocksTag.payload).map((item) => {
        const hasNbt = hasTagWithName(item, "nbt");
        const posTag = extractTagByName(item, "pos");
        return {
            nbt: hasNbt ? extractCompoundProperties(extractTagByName(item, "nbt").payload) : undefined,
            pos: posTag.type === 9 ? extractListItems(posTag.payload) : posTag.payload,
            state: extractTagByName(item, "state").payload
        };
    });
}

export function extractPalette(structureTag) {
    const blocksTag = extractTagByName(structureTag.payload, "palette");

    return extractListItems(blocksTag.payload).map((item) => {
        const hasProperties = hasTagWithName(item, "Properties");
        return {
            Properties: hasProperties ? extractCompoundProperties(extractTagByName(item, "Properties").payload) : undefined,
            Name: extractTagByName(item, "Name").payload
        };
    });
}

function parseBlockstate(input) {
    const match = input.match(/^([^\[\]]*)(?:\[([^\]]*)\])?$/);
    const name = match[1];
    let properties = undefined;

    if (match[2] !== undefined) {
        properties = {};
        for (let kv of match[2].split(",")) {
            let [k, v] = kv.split("=");

            properties[k] = v;
        }
    }

    return {
        Properties: properties,
        Name: name
    }
}

export function lookupBlockstate(block, palette) {
    const blockstate = palette[block.state];
    if (blockstate.Name === "minecraft:jigsaw") {
        return parseBlockstate(block.nbt.final_state);
    }
    return blockstate;
}
