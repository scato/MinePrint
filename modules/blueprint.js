const BED_SUFFIX = {"foot": "-top-foot", "head": "-top-head"};
const DOOR_SUFFIX = {"lower": "-bottom", "upper": "-top"};
const LOG_SUFFIX = {"x": "-horizontal", "y": "-top", "z": ""};
const SLAB_PREFIX = {"bottom": "", "double": "double-", "top": ""};
const SLAB_SUFFIX = {"bottom": "", "double": "", "top": "-top"};

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

function generateCell(blockstate) {
    if (blockstate.Name === "minecraft:air") {
        return null;
    }

    let sprite = blockstate.Name;
    
    sprite = sprite.replace("minecraft:", "");
    sprite = sprite.replaceAll("_", "-");

    if (blockstate.Name.match(/_bed$/)) {
        sprite += BED_SUFFIX[blockstate.Properties.part];
    } else if (blockstate.Name.match(/_door$/)) {
        sprite += DOOR_SUFFIX[blockstate.Properties.half];
    } else if (blockstate.Name.match(/_log$/) || blockstate.Name === "minecraft:basalt") {
        sprite += LOG_SUFFIX[blockstate.Properties.axis];
    } else if (blockstate.Name.match(/_shelf$/)) {
        sprite += "-front";
    } else if (blockstate.Name.match(/_slab$/)) {
        sprite = SLAB_PREFIX[blockstate.Properties.type] + sprite + SLAB_SUFFIX[blockstate.Properties.type];
    } else if (blockstate.Name.match(/_wood$/)) {
        sprite = sprite.replace("-wood", "-log");
    } else if (blockstate.Name === "minecraft:amethyst_block") {
        sprite = "block-of-amethyst";
    } else if (blockstate.Name === "minecraft:bamboo_block") {
        sprite = "block-of-bamboo";
        sprite += LOG_SUFFIX[blockstate.Properties.axis];
    } else if (blockstate.Name === "minecraft:grass_block") {
        // sprite += "-top";
    }

    if (blockstate.Name.match(/_bed$/)) {
        if (blockstate.Properties.facing === "south") {
            const transform = "rotate(90deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "west") {
            const transform = "rotate(180deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "north") {
            const transform = "rotate(270deg)";
            return {sprite, blockstate, transform};
        }
    }

    if (blockstate.Name.match(/_concrete_slab$/) && blockstate.Properties.type === "top") {
        sprite = sprite.replace("-top", "");
        const transform = "scaleY(-1)";
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name.match(/(:|_)glass_pane$/) && blockstate.Properties.east === "true") {
        const transform = "rotate(90deg)";
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name.match(/_glazed_terracotta$/)) {
        if (blockstate.Properties.facing === "west") {
            const transform = "rotate(90deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "north") {
            const transform = "rotate(180deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "east") {
            const transform = "rotate(270deg)";
            return {sprite, blockstate, transform};
        }
    }

    if (blockstate.Name.match(/_stairs$/)) {
        const transforms = [];
        if (blockstate.Properties.facing === "east") {
            transforms.push("rotate(180deg)");
        }
        if (blockstate.Properties.facing === "north") {
            transforms.push("rotate(90deg)");
        }
        if (blockstate.Properties.facing === "west") {
            transforms.push("rotate(0deg)");
        }
        if (blockstate.Properties.facing === "south") {
            transforms.push("rotate(270deg)");
        }
        if (blockstate.Properties.half === "top") {
            transforms.push("scaleY(-1)");
        }
        const transform = transforms.join(" ");
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name.match(/_wool_slab$/) && blockstate.Properties.type === "top") {
        sprite = sprite.replace("-top", "");
        const transform = "scaleY(-1)";
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name === "minecraft:basalt" && blockstate.Properties.axis === "x") {
        sprite = sprite.replace("-horizontal", "");
        const transform = "rotate(90deg)";
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name === "minecraft:blackstone_slab" && blockstate.Properties.type === "double") {
        sprite = "blackstone-double-slab";
    }

    return {sprite, blockstate};
}

export function generateLayers(size, blocks, palette, padding = 0) {
    const width = size[0] + padding * 2;
    const height = size[1];
    const depth = size[2] + padding * 2;

    const layers = new Array(height)
        .fill(null)
        .map(() => (
            new Array(depth)
                .fill(null)
                .map(() => (
                    new Array(width)
                        .fill(null)
            ))
        ));
    
    for(let block of blocks) {
        let [x, y, z] = block.pos;
        let blockstate = palette[block.state];
        if (blockstate.Name === "minecraft:jigsaw") {
            blockstate = parseBlockstate(block.nbt.final_state);
        }
        layers[y][z + padding][x + padding] = generateCell(blockstate);
    }

    return layers;
}
