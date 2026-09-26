import { lookupBlockstate } from './structure.js';

function generateMaterial(blockstate) {
        // these blockstates should be ignored
        if (blockstate.Name.match(/_bed$/) && blockstate.Properties.part === "head") {
            return [blockstate.Name, 0];
        } else if (blockstate.Name.match(/_door$/) && blockstate.Properties.half === "upper") {
            return [blockstate.Name, 0];
        }

        // these blockstates should be counted double
        if (blockstate.Name.match(/_slab$/) && blockstate.Properties.type === "double") {
            return [blockstate.Name, 2];
        }

        // TODO: some names should be changed, like skeleton_wall_head

        // the rest should count one time
        return [blockstate.Name, 1];
}

export function generateMaterials(size, blocks, palette) {
    const materials = {};
    const height = size[1];

    for (let block of blocks) {
        const [x, y, z] = block.pos;
        const blockstate = lookupBlockstate(block, palette);

        const [name, number] = generateMaterial(blockstate);
        if (!materials.hasOwnProperty(name)) {
            materials[name] = new Array(height).fill(0);
        }
        materials[name][y] += number;
    }

    return materials;
}
