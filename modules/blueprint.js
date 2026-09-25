const BED_SUFFIX = {"foot": "-top-foot", "head": "-top-head"};
const DOOR_SUFFIX = {"lower": "-bottom", "upper": "-top"};
const LOG_SUFFIX = {"x": "", "y": "-top", "z": ""};
const SLAB_PREFIX = {"bottom": "", "double": "double-", "top": ""};

const RAIL_SUFFIX = {
    "ascending_east": "-horizontal",
    "ascending_north": "",
    "ascending_south": "",
    "ascending_west": "-horizontal",
    "east_west": "-horizontal",
    "north_east": "-corner-north-west",
    "north_south": "",
    "north_west": "-corner-south-west",
    "south_east": "-corner-north-east",
    "south_west": "-corner-south-east"
}

const ALTERNATIVE_NAMING = {
    "double-blackstone-slab": "blackstone-double-slab",
    "cake-with-black-candle": "black-candle-cake",
    "cake-with-blue-candle": "blue-candle-cake",
    "cake-with-brown-candle": "brown-candle-cake",
    "copper-door-top": "copper-door",
    "copper-door-bottom": "copper-door",
    "damaged-anvil": "anvil",
    "dark-oak-leaves": "oak-leaves",
    "deepslate-lapis-ore": "deepslate-lapis-lazuli-ore",
    "dried-ghast": "dried-ghast-state-1-front",
    "exposed-copper-door-top": "exposed-copper-door",
    "exposed-copper-door-bottom": "exposed-copper-door",
    "jack-o-lantern": "jack-o%27lantern",
    "block-of-lapis": "block-of-lapis-lazuli",
    "lapis-ore": "lapis-lazuli-ore",
    "large-amethyst-bud": "amethyst-bud",
    "note-block": "jukebox-side",
    "oxidized-copper-door-top": "oxidized-copper-door",
    "oxidized-copper-door-bottom": "oxidized-copper-door",
    "pale-oak-door-top": "pale-oak-door",
    "pale-oak-door-bottom": "pale-oak-door",
    "petrified-oak-slab": "oak-slab",
    "double-petrified-oak-slab": "double-oak-slab",
    "piston-head": "piston-arm-collision",
    "poplar-door-top": "poplar-door",
    "poplar-door-bottom": "poplar-door",
    "poplar-shelf-front": "poplar-shelf",
    "redstone-wire": "redstone-dust",
    "skeleton-wall-skull": "skeleton-skull",
    "smooth-quartz": "smooth-quartz-block",
};

function generateCell(blockstate) {
    if (blockstate.Name.match(/(:|_)air$/)) {
        return null;
    }

    let sprite = blockstate.Name;
    
    sprite = sprite.replace("minecraft:", "");
    sprite = sprite.replaceAll("_", "-");

    let match;
    if (match = blockstate.Name.match(/^minecraft:(amethyst|bamboo|coal|copper|diamond|emerald|gold|iron|lapis|netherite|quartz|raw_copper|raw_gold|raw_iron|resin|redstone|stripped_bamboo)_block$/)) {
        sprite = "block-of-" + match[1].replace("_", "-");
    } else if (match = blockstate.Name.match(/^minecraft:(comparator|repeater)$/)) {
        sprite = "redstone-" + match[1];
    } else if (match = blockstate.Name.match(/minecraft:(.*candle)_cake/)) {
        sprite = "cake-with-" + match[1].replaceAll("_", "-");
    }

    if (blockstate.Name.match(/_bed$/)) {
        sprite += BED_SUFFIX[blockstate.Properties.part];
    } else if (blockstate.Name.match(/_door$/)) {
        sprite += DOOR_SUFFIX[blockstate.Properties.half];
    } else if (blockstate.Name.match(/_fungus$/)) {
        sprite = sprite.replace("-fungus", "-fungi");
    } else if (blockstate.Name.match(/_log$/) || blockstate.Name.match(/(crimson)_stem$/) || blockstate.Name === "minecraft:basalt" || blockstate.Name === "minecraft:bamboo_block" || blockstate.Name === "minecraft:hay_block" || blockstate.Name === "minecraft:polished_basalt" || blockstate.Name === "minecraft:stripped_bamboo_block") {
        sprite += LOG_SUFFIX[blockstate.Properties.axis];
    } else if (blockstate.Name === "minecraft:rail") {
        sprite += RAIL_SUFFIX[blockstate.Properties.shape];
    } else if (blockstate.Name.match(/_shelf$/)) {
        sprite += "-front";
    } else if (blockstate.Name.match(/_slab$/)) {
        sprite = SLAB_PREFIX[blockstate.Properties.type] + sprite;
    } else if (blockstate.Name.match(/_coral_wall_fan$/) || blockstate.Name.match(/(:|_)wall_torch$/)) {
        sprite = sprite.replace("wall-", "");
    } else if (blockstate.Name.match(/_wall_head$/)) {
        sprite = sprite.replace("wall-", "");
    } else if (blockstate.Name.match(/_wood$/)) {
        sprite = sprite.replace("-wood", "-log");
    } else if (blockstate.Name.match(/^minecraft:(crimson_nylium|dirt_path|dried_kelp_block|grass_block|mycelium)$/)) {
        sprite += "-top";
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

    if (blockstate.Name.match(/_slab$/) && blockstate.Properties.type === "top") {
        sprite = sprite.replace("-top", "").replace("petrified-", "");
        const transform = "scaleY(-1)";
        return {sprite, blockstate, transform};
    }

    if (blockstate.Name.match(/_coral_wall_fan$/) || blockstate.Name.match(/(:|_)wall_torch$/)) {
        if (blockstate.Properties.facing === "east") {
            const transform = "rotate(90deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "south") {
            const transform = "rotate(180deg)";
            return {sprite, blockstate, transform};
        } else if (blockstate.Properties.facing === "west") {
            const transform = "rotate(270deg)";
            return {sprite, blockstate, transform};
        }
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

    if (blockstate.Name.match(/_log$/) || blockstate.Name.match(/(crimson)_stem$/) || blockstate.Name === "minecraft:basalt" || blockstate.Name === "minecraft:bamboo_block" || blockstate.Name === "minecraft:hay_block" || blockstate.Name === "minecraft:polished_basalt" || blockstate.Name === "minecraft:stripped_bamboo_block") {
        if (blockstate.Properties.axis !== "y") {
            sprite = sprite.replace("-stem", "-hyphae");
        }

        sprite = sprite.replace("hay-block", "hay-bale");

        if (blockstate.Properties.axis === "x") {
            const transform = "rotate(90deg)";
            return {sprite, blockstate, transform};
        }
    }

    for (let key of Object.keys(ALTERNATIVE_NAMING)) {
        if (sprite === key) {
            sprite = ALTERNATIVE_NAMING[key];
        }
    }

    return {sprite, blockstate};
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
