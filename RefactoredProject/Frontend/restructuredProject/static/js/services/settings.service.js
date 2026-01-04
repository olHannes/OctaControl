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

export const bluetoothService = {
    toggleBluetooth(enabled) { return apiPost("/api/bluetooth/power", { state: enabled ? "on": "off" }); },
    toggleVisibility(visible) { return apiPost("/api/bluetooth/visibility", { discoverable: visible ? "on": "off" }); },
    getBluetoothStatus() { return apiGet("/api/bluetooth/status"); },
    getKnownDevices() { return apiGet("/api/bluetooth/paired_devices"); },
    scanBluetooth() { return apiGet("/api/bluetooth/scan"); },
    pairDevice(address) { return apiPost("/api/bluetooth/pair", {address: address}); },
    connectDevice(address) { return apiPost("/api/bluetooth/connect", {address: address}); },
    disconnectDevice(address) { return apiPost("/api/bluetooth/disconnect", {address: address}); },
    removeDevice(address) { return apiPost("/api/bluetooth/remove", {address: address}); },
}
