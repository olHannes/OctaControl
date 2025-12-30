// js/app.js
import { createStore } from "./store.js";
import { initRouter } from "./router.js";
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

import { renderDashboard } from "./pages/dashboard.page.js";
import { renderAudio } from "./pages/audio.page.js";
import { renderNavi } from "./pages/navi.page.js";
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
  system: { battery: null, internet: null, wifi: null, audioSource: null, version: null },
});

document.documentElement.dataset.theme = store.get().ui.theme;
document.documentElement.style.setProperty("--system-color", store.get().ui.systemColor);


const router = initRouter();
renderDashboard(router.views.dashboard, store);
renderAudio(router.views.audio, store);
renderNavi(router.views.navi, store);
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


store.subscribe((s) => {
  const wifi = document.querySelector("#wifiPill");
  const bt   = document.querySelector("#btPill");
  const gps  = document.querySelector("#gpsPill");

  if (wifi) wifi.textContent = `NET: ${s.system?.internet ?? "--"}`;
  if (bt)   bt.textContent   = `SRC: ${s.system?.audioSource ?? "--"}`;
  if (gps)  gps.textContent  = `GPS: ${s.sensor?.gps?.quality ?? "--"}`;

  const okClass = s.conn.connected ? "pill--ok" : "pill--bad";
  [wifi, bt, gps].forEach(el => {
    if (!el) return;
    el.classList.remove("pill--ok", "pill--bad");
    el.classList.add(okClass);
  });
});
