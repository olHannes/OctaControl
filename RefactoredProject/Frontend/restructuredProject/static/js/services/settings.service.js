import { apiGet, apiPost } from "../api.js";

export const systemService = {
    version() { return apiGet("/api/system/version"); },
    shutdown() { return apiPost("/api/system/shutdown"); },
    restart() { return apiPost("/api/system/reboot"); },
    update() { return apiPost("/api/system/update"); },
};

export const wifiService = {
    toggleWifi(enabled) { return apiPost("/api/wlan/power", { state: enabled ? "on" : "off" }); },
    getWifiStatus() { return apiGet("/api/wlan/status"); },
    getKnownWifi() { return apiGet("/api/wlan/known"); },
    scanWifi() { return apiGet("/api/wlan/scan"); },
    connectWifi(ssid, password) { return apiPost("/api/wlan/connect", { ssid, password }); },
    disconnectWifi(ssid) { return apiPost("/api/wlan/disconnect", { ssid }); },
};
