import { apiGet, apiPatch, apiPost, apiDelete } from "../api.js";

export const audioService = {
    get() { return apiGet("/api/audio/source/status"); },
    switchSource(oldSource, newSource) { return apiPatch("/api/audio/source/change", {oldSource, newSource}); },
}

export const bluetoothAudioService = {
    state() { return apiGet("/api/audio/bluetooth/"); },
    play() { return apiPost("/api/audio/bluetooth/play"); },
    pause() { return apiPost("/api/audio/bluetooth/pause"); },
    skip() { return apiPost("/api/audio/bluetooth/skip"); },
    previous() { return apiPost("/api/audio/bluetooth/previous"); },
    updatePosition(pos) { return apiPost("/api/audio/bluetooth/set_position", pos); },
    updateVolume(volume) { return apiPatch("/api/system/volume", volume); },
}

export const fmAudioService = {
    state() { return apiGet("/api/audio/radio/"); },
    scanUp() { return apiGet("/api/audio/radio/scan?direction=up"); },
    scanDown() { return apiGet("/api/audio/radio/scan?direction=down"); },
    goUp() { return apiGet("/api/audio/radio/go?direction=up"); },
    goDown() { return apiGet("/api/audio/radio/go?direction=down"); },
    setFrequency(freq) { return apiPost("/api/audio/radio/set", freq); },
    addFavorite(freq, name) { return apiPost("/api/audio/radio/favorites", freq, name); },
    deleteFavorite(freq) { return apiDelete("/api/audio/radio/favorites", freq); },
    updateVolume(volume) { return apiPatch("/api/system/volume", volume); },
}