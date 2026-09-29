import { lookupMaterialName } from './materials.js';

function renderCell(cell) {
    if (cell === null) {
        return `
            <td style="width:16px;height:16px"></td>
        `;
    } else {
        const src = `https://minecraft.wiki/images/BlockSprite_${cell.sprite}.png`;
        const title = cell.hasOwnProperty("blockstate") ? JSON.stringify(cell.blockstate).replaceAll("\"", "&quot;") : "";
        return `
            <td>
                <span style="${cell.hasOwnProperty("transform") ? "transform:" + cell.transform : ""}">
                    <img src="${src}" width="16" height="16" title="${title}">
                </span>
            </td>
        `;
    }
}

function renderRow(row) {
    return `
        <tr>
            ${row.map((cell) => renderCell(cell)).join("")}
        </tr>
    `;
}

function renderLayer(layer, number) {
    return `
        <input id="layer${number}" type="radio" name="layer" ${number == 1 ? "checked=\"checked\"" : ""}>
        <label for="layer${number}">Layer ${number}</label>
        <div class="layered-blueprint-layer">
            <table cellspacing="0" cellpadding="0">
                <tbody>
                    ${layer.map((row) => renderRow(row)).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderMaterial(material, languageFile) {
    const src = `https://minecraft.wiki/images/BlockSprite_${material.sprite}.png`;
    const total = material.amounts.reduce((p, c) => p + c, 0);
    const caption = lookupMaterialName(material.name, languageFile);

    return `<tr>
        <td>
            <img src="${src}" width="16" height="16">
            ${caption}
        </td>
        <td>${total}</td>
        ${material.amounts.map((amount) => `<td>${amount}</td>`).join("")}
    </tr>`;
}

export function renderBlueprint(layers, materials, languageFile) {
    const numRows = layers[0].length;
    const numColumns = layers[0][0].length;

    return `
        <div class="blueprint">
            <h3>Blueprint</h3>
            <div class="layered-blueprint" style="min-height:${numRows * 16}px;width:${numColumns * 16}px">
                ${layers.map((layer, index) => renderLayer(layer, index + 1)).join("")}
            </div>
            <h3>Materials</h3>
            <table class="blueprint-materials">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total</th>
                        ${layers.map((_, index) => `<th>Layer ${index + 1}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${materials.map((material) => renderMaterial(material, languageFile)).join("")}
                </tbody>
            </table>
        </div>
    `;
}