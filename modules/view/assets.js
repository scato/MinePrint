const VERSION = "26.2";
const LANGUAGE = "en_us";

const REPO_ROOT = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${VERSION}`;

export const STRUCTURES_ROOT = `${REPO_ROOT}/data/minecraft/structure`;
export const TEXTURES_ROOT = `${REPO_ROOT}/assets/minecraft/textures`;

export async function fetchLanguageFile() {
    try {
        const url = `${REPO_ROOT}/assets/minecraft/lang/${LANGUAGE}.json`;
        const response = await fetch(url);
        const text = await response.text();

        return JSON.parse(text);
    } catch(e) {
        return {};
    }
}

export async function fetchBlockStateFile() {
    try {
        const url = `${REPO_ROOT}/assets/minecraft/blockstates/_all.json`;
        const response = await fetch(url);
        const text = await response.text();

        return JSON.parse(text);
    } catch(e) {
        return {};
    }
}

export async function fetchModelFile() {
    try {
        const url = `${REPO_ROOT}/assets/minecraft/models/block/_all.json`;
        const response = await fetch(url);
        const text = await response.text();

        return JSON.parse(text);
    } catch(e) {
        return {};
    }
}

function parseVariantKey(key) {
    const condition = {};

    for(let kv of key.split(",")) {
        const [k, v] = kv.split("=");

        condition[k] = v;
    }

    return condition;
}

function getPropertyDefault(k) {
    switch (k) {
        case "snowy":
            return "false";
        case "facing":
            return "south";
        default:
            return null;
    }
}

function testProperties(properties, condition) {
    if (condition.hasOwnProperty("AND")) {
        return condition.AND.every((subcondition) => testProperties(properties, subcondition));
    }

    if (condition.hasOwnProperty("OR")) {
        return condition.OR.some((subcondition) => testProperties(properties, subcondition));
    }

    for(let k of Object.keys(condition)) {
        let v;

        if (properties === undefined) {
            v = getPropertyDefault(k);
        } else if (!properties.hasOwnProperty(k)) {
            v = getPropertyDefault(k);
        } else {
            v = properties[k];
        }

        if (v != condition[k]) {
            return false;
        }
    }

    return true;
}

// returns an array of variants, which are arrays of parts
export function lookupParts(blockstate, blockstateFile) {
    const name = blockstate.Name.replace("minecraft:", "");

    if (!blockstateFile.hasOwnProperty(name)) {
        console.log(`blockstate not found for ${name}`);

        return [null];
    }

    const definition = blockstateFile[name];

    if (definition.hasOwnProperty("variants")) {
        let variant = null;

        for(let key of Object.keys(definition.variants)) {
            if (key === "") {
                variant = definition.variants[key];
            } else if(testProperties(blockstate.Properties, parseVariantKey(key))) {
                variant = definition.variants[key];
            }
        }

        if (variant instanceof Array) {
            return variant.map((parts) => [parts]);
        } else if (variant !== null) {
            return [[variant]];
        } else {
            console.log("No variant matched");

            return [null];
        }
    }

    if (definition.hasOwnProperty("multipart")) {
        let parts = [];

        for (let candidate of definition.multipart) {
            if (!candidate.hasOwnProperty("when")) {
                parts.push(candidate.apply);
            } else if (blockstate.hasOwnProperty("Properties")) {
                if (testProperties(blockstate.Properties, candidate.when)) {
                    parts.push(candidate.apply);
                }
            }
        }

        return [parts];
    }

    return [null];
}

export function lookupModel(model, modelFile) {
    model = model.replace("minecraft:", "");
    model = model.replace("block/", "");

    if (!modelFile.hasOwnProperty(model)) {
        console.log(`model not found for ${model}`);

        return null;
    }

    const match = modelFile[model];
    let combined;

    if (match.hasOwnProperty("parent")) {
        combined = lookupModel(match.parent, modelFile);
    } else {
        combined = {};
    }

    if (match.hasOwnProperty("elements")) {
        if (combined.hasOwnProperty("elements")) {
            combined.elements = [...combined.elements, ...match.elements];
        } else {
            combined.elements = match.elements;
        }
    }

    if (match.hasOwnProperty("textures")) {
        if (combined.hasOwnProperty("textures")) {
            combined.textures = {...combined.textures, ...match.textures};
        } else {
            combined.textures = match.textures;
        }
    }

    return combined;
}

export function lookupTexture(texture, textures) {
    if (typeof texture === "object") {
        return lookupTexture(texture.sprite, textures);
    } else if (texture.startsWith("#")) {
        return lookupTexture(textures[texture.replace("#", "")], textures);
    } else {
        return texture;
    }
}
