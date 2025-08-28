// code/utils/volumeEvents.js
export function emitVolumeChange(volume, muted) {
    window.dispatchEvent(new CustomEvent("volume-change", {
        detail: { volume, muted }
    }));
}

export function listenVolumeChange(callback) {
    window.addEventListener("volume-change", (e) => callback(e.detail));
}
