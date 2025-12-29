// js/app.js
import { createStore } from "./store.js";
import { WsHub } from "./wsHub.js";
import { initRouter } from "./router.js";

import { renderDashboard } from "./pages/dashboard.page.js";
import { renderAudio } from "./pages/audio.page.js";
import { renderNavi } from "./pages/navi.page.js";
import { renderSettings } from "./pages/settings.page.js";

const store = createStore({
  theme: localStorage.getItem("theme") ?? "dark",
  ws: { connected: false },
  sensors: { temp: null, hum: null, lux: null },
  audio: { source: "bluetooth", state: "stopped", title: null, artist: null },
  net: { wifi: null, bt: null, gps: null },
});

// Theme initial
document.documentElement.dataset.theme = store.get().theme;

// Theme toggle
document.querySelector("#themeBtn").addEventListener("click", () => {
  const next = store.get().theme === "dark" ? "light" : "dark";
  store.set({ theme: next });
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
});

// Clock
setInterval(() => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  document.querySelector("#clock").textContent = `${hh}:${mm}`;
}, 500);

// Router
const router = initRouter();

// Render pages once
renderDashboard(router.views.dashboard, store);
renderAudio(router.views.audio, store, null); // wsHub setzen wir gleich
renderNavi(router.views.navi);
renderSensors(router.views.sensors);
renderSettings(router.views.settings);

// WS Hub (eine zentrale Verbindung!)
const wsUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
const wsHub = new WsHub(wsUrl);

// Jetzt Audio-Page mit wsHub “nachrüsten” (einfach neu rendern)
renderAudio(router.views.audio, store, wsHub);

// WS connection status -> Pills
wsHub.addEventListener("ws:open", () => store.set({ ws: { connected: true } }));
wsHub.addEventListener("ws:close", () => store.set({ ws: { connected: false } }));

// Erwartete Events vom Backend: sensor:update, gps:update, wifi:update, bt:update, audio:update
wsHub.addEventListener("sensor:update", (e) => {
  // Beispiel: { key: "temp", value: 21.5 } oder { temp:.., hum:.. }
  const p = e.detail ?? {};
  const current = store.get().sensors;

  if (typeof p.key === "string") {
    store.set({ sensors: { ...current, [p.key]: p.value } });
  } else {
    store.set({ sensors: { ...current, ...p } });
  }
});

wsHub.addEventListener("audio:update", (e) => {
  const p = e.detail ?? {};
  store.set({ audio: { ...store.get().audio, ...p } });
});

// Topbar pills from store
store.subscribe((s) => {
  const wifi = document.querySelector("#wifiPill");
  const bt = document.querySelector("#btPill");
  const gps = document.querySelector("#gpsPill");

  // Basic placeholders (du kannst später echte states mappen)
  wifi.textContent = `WLAN: ${s.net?.wifi ?? "--"}`;
  bt.textContent = `BT: ${s.net?.bt ?? "--"}`;
  gps.textContent = `GPS: ${s.net?.gps ?? "--"}`;

  // Connection indicator via outline color
  const okClass = s.ws.connected ? "pill--ok" : "pill--bad";
  [wifi, bt, gps].forEach(el => {
    el.classList.remove("pill--ok", "pill--bad");
    el.classList.add(okClass);
  });
});
