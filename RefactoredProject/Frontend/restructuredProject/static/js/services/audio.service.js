import { apiGet, apiPatch, apiPost } from "../api.js";

export const audioService = {
    switchSource(oldSource, newSource) { return apiPatch("/api/audio/change", {oldSource, newSource}); },
}

export const bluetoothAudioService = {
    state() { return apiGet("/api/audio/state"); },
    play() { return apiGet("/api/audio/play"); },
    pause() { return apiGet("/api/audio/pause"); },
    skip() { return apiGet("/api/audio/skip"); },
    previous() { return apiGet("/api/audio/previous"); },
    updateVolume(volume) { return apiPatch("/api/audio/volume", {volume}); },
}

export const fmAudioService = {
    state() { return apiGet("/api/audio/state"); },
    scanUp() { return apiGet("/api/audio/scan?direction=up"); },
    scanDown() { return apiGet("/api/audio/scan?direction=down"); },
    goUp() { return apiGet("/api/audio/go?direction=up"); },
    goDown() { return apiGet("/api/audio/go?direction=down"); },
    setPreset(freq) { return apiPost("/api/audio/set", {freq}); },
    updateVolume(volume) { return apiPatch("/api/audio/volume", {volume}); },
}