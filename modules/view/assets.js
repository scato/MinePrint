const VERSION = "26.2";
const LANGUAGE = "en_us";

const REPO_ROOT = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${VERSION}`;

export const STRUCTURES_ROOT = `${REPO_ROOT}/data/minecraft/structure`;

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
