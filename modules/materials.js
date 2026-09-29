import { lookupBlockstate } from './structure.js';

function generateAmount(blockstate) {
        // these blockstates should be ignored
        if (blockstate.Name.match(/_bed$/) && blockstate.Properties.part === "head") {
            return [blockstate.Name, 0];
        } else if (blockstate.Name.match(/_door$/) && blockstate.Properties.half === "upper") {
            return [blockstate.Name, 0];
        } else if (blockstate.Name.match(/(:|_)air$/)) {
            return [blockstate.Name, 0];
        } else if (blockstate.Name.match(/(attached_)?(melon|pumpkin)_stem$/)) {
            return [blockstate.Name, 0];
        } else if (blockstate.Name === "minecraft:bubble_column") {
            return [blockstate.Name, 0];
        } else if (blockstate.Name === "minecraft:moving_piston") {
            return [blockstate.Name, 0];
        } else if (blockstate.Name === "minecraft:piston_head") {
            return [blockstate.Name, 0];
        }

        // these blockstates should be counted double
        if (blockstate.Name.match(/_slab$/) && blockstate.Properties.type === "double") {
            return [blockstate.Name, 2];
        }

        // these blockstates should map to different block names
        if (blockstate.Name.match(/_wall(_hanging_sign|_sign|_banner|_fan|_torch|_head)$/)) {
            return [blockstate.Name.replace("_wall", ""), 1];
        } else if (blockstate.Name === "minecraft:bamboo_sapling") {
            return ["minecraft:bamboo", 1];
        } else if (blockstate.Name === "minecraft:big_dripleaf_stem") {
            return ["minecraft:big_dripleaf", 1];
        } else if (blockstate.Name === "minecraft:cave_vines_plant") {
            return ["minecraft:cave_vines", 1];
        } else if (blockstate.Name === "minecraft:chipped_anvil") {
            return ["minecraft:anvil", 1];
        } else if (blockstate.Name === "minecraft:damaged_anvil") {
            return ["minecraft:anvil", 1];
        } else if (blockstate.Name === "minecraft:kelp_plant") {
            return ["minecraft:kelp", 1];
        }

        // the rest should count one time
        return [blockstate.Name, 1];
}

function generateMaterial(name, amounts) {
    let sprite = name;
    
    sprite = sprite.replace("minecraft:", "");
    sprite = sprite.replaceAll("_", "-");

    let match;
    if (match = name.match(/^minecraft:(amethyst|bamboo|coal|copper|diamond|emerald|gold|iron|lapis|netherite|quartz|raw_copper|raw_gold|raw_iron|resin|redstone|stripped_bamboo)_block$/)) {
        sprite = "block-of-" + match[1].replace("_", "-");
    } else if (match = name.match(/^minecraft:(comparator|repeater)$/)) {
        sprite = "redstone-" + match[1];
    } else if ((match = name.match(/^minecraft:(.*candle)_cake/)) && !name.match(/^minecraft:(black|blue|brown)_candle_cake$/)) {
        sprite = "cake-with-" + match[1].replaceAll("_", "-");
    }

    if (name === "minecraft:bamboo") {
        sprite = "bamboo-stalk";
    } else if (name === "minecraft:dark_oak_leaves") {
        sprite = "oak-leaves";
    } else if (name === "minecraft:dried_ghast") {
        sprite = "dried-ghast-state-1-front";
    } else if (name.match(/_fungus$/)) {
        sprite = sprite.replace("-fungus", "-fungi");
    } else if (name === "minecraft:hay_block") {
        sprite = "hay-bale";
    } else if (name === "minecraft:jack_o_lantern") {
        sprite = "jack-o%27lantern";
    } else if (name === "minecraft:large_amethyst_bud") {
        sprite = "amethyst-bud";
    } else if (name === "minecraft:note_block") {
        sprite = "jukebox-side";
    } else if (name === "minecraft:petrified_oak_slab") {
        sprite = "oak-slab";
    } else if (name === "minecraft:redstone_wire") {
        sprite = "redstone-dust";
    } else if (name.match(/_shelf$/) && name !== "minecraft:poplar_shelf") {
        sprite += "-front";
    } else if (name.match(/(crimson)_stem$/)) {
        sprite = sprite.replace("-stem", "-hyphae");
    } else if (name.match(/_wood$/)) {
        sprite = sprite.replace("-wood", "-log");
    }

    sprite = sprite.replace("lapis", "lapis-lazuli");

    return {
        sprite: sprite,
        name: name.replace("minecraft:", ""),
        amounts: amounts
    };
}

export function generateMaterials(size, blocks, palette) {
    const amountsByName = {};
    const height = size[1];

    for (let block of blocks) {
        const [x, y, z] = block.pos;
        const blockstate = lookupBlockstate(block, palette);

        const [name, amount] = generateAmount(blockstate);

        if (amount === 0) {
            continue;
        }

        if (!amountsByName.hasOwnProperty(name)) {
            amountsByName[name] = new Array(height).fill(0);
        }
        amountsByName[name][y] += amount;
    }

    return Object.keys(amountsByName).map((name) => generateMaterial(name, amountsByName[name]));
}

export function lookupMaterialName(name, languageFile) {
    const key = `block.minecraft.${name}`;

    if (languageFile.hasOwnProperty(key)) {
        return languageFile[`block.minecraft.${name}`];
    } else {
        return name.split("_").map((part) => part.substring(0, 1).toUpperCase() + part.substring(1)).join(" ");
    }
}
