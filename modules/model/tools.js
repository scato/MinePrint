import { alterSize, extractBlocks, translateBlocks } from './structure.js';

export function trim(structure) {
    const blocks = extractBlocks(structure);

    let minX = blocks[0].pos[0];
    let minY = blocks[0].pos[1];
    let minZ = blocks[0].pos[2];
    let maxX = blocks[0].pos[0];
    let maxY = blocks[0].pos[1];
    let maxZ = blocks[0].pos[2];

    for (let block of blocks) {
        minX = Math.min(minX, block.pos[0]);
        minY = Math.min(minY, block.pos[1]);
        minZ = Math.min(minZ, block.pos[2]);
        maxX = Math.max(maxX, block.pos[0]);
        maxY = Math.max(maxY, block.pos[1]);
        maxZ = Math.max(maxZ, block.pos[2]);
    }

    alterSize(structure, [maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1]);
    translateBlocks(structure, [-minX, -minY, -minZ]);
}
