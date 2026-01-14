import { apiGet, apiPatch, apiPost } from "../api.js";

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
    state() { return apiGet("/api/audio/bluetooth/"); },
    scanUp() { return apiGet("/api/audio/scan?direction=up"); },
    scanDown() { return apiGet("/api/audio/scan?direction=down"); },
    goUp() { return apiGet("/api/audio/go?direction=up"); },
    goDown() { return apiGet("/api/audio/go?direction=down"); },
    setPreset(freq) { return apiPost("/api/audio/set", {freq}); },
    updateVolume(volume) { return apiPatch("/api/system/volume", volume); },
}