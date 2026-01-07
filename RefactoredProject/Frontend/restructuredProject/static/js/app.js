// js/app.js
import { createStore } from "./store.js";
import { initRouter } from "./router.js";
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

import { renderDashboard } from "./pages/dashboard.page.js";
import { renderNavi } from "./pages/navi.page.js";
import { renderAudio } from "./pages/audio.page.js";
import { renderLighting } from "./pages/lighting.page.js";
import { renderSettings } from "./pages/settings.page.js";


const store = createStore({
  conn: { connected: false },
  sensor: {
    brightness: null,
    climate: { temperature: null, humidity: null },
    gps: {
      lat: null, lon: null, speed: null, sats: null,
      altitude: null, accuracy: null, quality: null, heading: null
    },
    time: null,
    local_time: null,
    flags: null,
  },
  ui: { theme: "dark", systemColor: "#3aa0ff" },
  system: { battery: 70, audioSource: "bluetooth", version: null },
  network: { power: null, state: null, internet: null, ip: null, ssid: null, signal: null, knownNetworks: [], scannedNetworks: [] },
  bluetooth: { power: null, visibility: null, connectedDeviceName: null, connectedDeviceMac: null, pairedDevices: [], scannedDevices: []},
  software: { branch: null, commit: null, date: null, dirty: null },
  lighting: { enabled: null, brightness: null, colorKey: null },
});


const router = initRouter();
renderDashboard(router.views.dashboard, store);
renderAudio(router.views.audio, store);
renderNavi(router.views.navi, store);
renderLighting(router.views.lighting, store);
renderSettings(router.views.settings, store);


const socket = io("http://127.0.0.1:5000");

socket.on("connect", () => store.setSlice("conn", { connected: true }));
socket.on("disconnect", () => store.setSlice("conn", { connected: false }));

socket.on("sensor_update", (data) => {
  const cur = store.get().sensor;

  store.setSlice("sensor", {
    ...data,
    climate: { ...cur.climate, ...(data.climate ?? {}) },
    gps:     { ...cur.gps,     ...(data.gps ?? {}) },
  });
});



const themeBtn = document.querySelector("#themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = store.get().ui.theme === "dark" ? "light" : "dark";
    store.setSlice("ui", { theme: next });
  });
}


store.subscribeSelector(s => s.ui, (ui) => {
  document.documentElement.dataset.theme = ui.theme;
  document.documentElement.style.setProperty("--system-color", ui.systemColor);
});


store.subscribeSelector(s => s.sensor, (sensor) => {
  const clock = document.querySelector("#clock");
  const date  = document.querySelector("#date");
  const temp  = document.querySelector("#tempPill");

  const t = sensor?.local_time ?? sensor?.time;
  if (clock && t) {
    clock.textContent = String(t).split(" ")[1]?.slice(0,5) ?? "--:--";
  }
  if (date && t) {
    date.textContent = String(t).split(" ")[0] ?? "";
  }

  if (temp) {
    const v = sensor?.climate?.temperature;
    temp.textContent = (v == null) ? "--°C" : `${v.toFixed(1)}°C`;
  }
});



function batteryLevel(percent) {
  if(percent == null) return "none";
  if(percent <= 5) return "empty";
  if(percent <= 20) return "low";
  if(percent <= 60) return "mid";
  return "full";
}

function updateBattery(percent) {
  const level = batteryLevel(percent);

  document.querySelectorAll(".battery").forEach(icon => {
    icon.classList.toggle("is-active", icon.dataset.battery === level);
  });

  const pill = document.querySelector("#batteryPill");
  if (pill) pill.textContent = percent != null ? `${percent}%` : "--%";
}


store.subscribe((s) => {
  const wifi = document.querySelector("#wifiPill");
  const bt   = document.querySelector("#pill-bluetooth");
  const radio = document.querySelector("#pill-radio");

  const gps  = document.querySelector("#gpsPill");

  if (wifi) wifi.style.display = s.system?.internet ? "block" : "none";

  if(bt) bt.style.display = (s.system?.audioSource == "radio") ? "none" : "block";
  if(radio) radio.style.display = (s.system?.audioSource == "radio") ? "block" : "none";
  
  updateBattery(s.system?.battery);
});



window.addEventListener("showGlobalLoader", () => {
  const loader = document.getElementById('globalLoader');
  if(loader) loader.style.opacity = "100%";
});
window.addEventListener("hideGlobalLoader", () => {
  const loader = document.getElementById('globalLoader');
  if(loader) loader.style.opacity = "0%";
});