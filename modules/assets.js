const VERSION = "26.3";
const LANGUAGE = "en_us";

export async function fetchLanguageFile() {
    try {
        const url = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${VERSION}/assets/minecraft/lang/${LANGUAGE}.json`;
        const response = await fetch(url);
        const text = await response.text();

        return JSON.parse(text);
    } catch(e) {
        return {};
    }
}
