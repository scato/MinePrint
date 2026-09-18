function generateCell(blockstate) {
    if (blockstate.Name === "minecraft:air") {
        return null;
    }

    let sprite = blockstate.Name;
    
    sprite = sprite.replace("minecraft:", "");
    sprite = sprite.replaceAll("_", "-");

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
