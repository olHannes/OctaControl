//code/utils/storage_handler.js

/**
 * enum for different type of settings
 */
export const StorageKeys = Object.freeze({
    // Widgets visible?
    SIDEBAR_WIDGET: "sidebarWidget",
    AUDIO_WIDGET: "audioWidget",
    MAP_WIDGET: "mapWidget",
    TIMER_WIDGET: "timerWidget",
    CLOCK_WIDGET: "clockWidget",
    RELAIS_WIDGET: "relaisWidget",
    WEATHER_WIDGET: "weatherWidget",

    //Toggled Relais
    TRUNK_ACTIVE: "trunkPower",
    ASSISTANT: "assistant",
});


/**
 * saves an object based on the key
 * @param {string} key - of the storage Keys
 * @param {Object} data - saved data
 */
export function save(key, data) {
    if (!StorageKeys[key]) {
        console.warn(`Speichern: Invalid Key '${key}'`);
        return;
    }
    try {
        localStorage.setItem(StorageKeys[key], JSON.stringify(data));
    } catch (err) {
        console.error("error while saving:", err);
    }
}


/**
 * Loads the saved value of a given key
 * @param {string} key - requested key
 * @returns {Object|null} - saved value or null
 */
export function load(key) {
    if (!StorageKeys[key]) {
        console.warn(`Laden: Ungültiger Key '${key}'`);
        return null;
    }
    try {
        const json = localStorage.getItem(StorageKeys[key]);
        return json ? JSON.parse(json) : null;
    } catch (err) {
        console.error("Fehler beim Laden:", err);
        return null;
    }
}


/**
 * deletes the given key
 * @param {string} key - member of storageKeys
 */
export function clear(key) {
    if (!StorageKeys[key]) return;
    localStorage.removeItem(StorageKeys[key]);
}
