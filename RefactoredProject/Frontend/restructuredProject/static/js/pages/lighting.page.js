// js/pages/lighting.page.js
import {apiGet, apiPatch } from "../api.js";

export const LIGHTING_PRESETS = [
  { key: "skoda", name: "Skoda", css: "var(--color-palette-skoda)" },
  { key: "ocean", name: "Ocean", css: "var(--color-palette-ocean)" },
  { key: "sunset", name: "Sunset", css: "var(--color-palette-sunset)" },
  { key: "royal", name: "Royal", css: "var(--color-palette-royal)" },
  { key: "rose", name: "Rose", css: "var(--color-palette-rose)" },
  { key: "pure", name: "Pure", css: "var(--color-palette-pure)" },
  { key: "warm", name: "Warm", css: "var(--color-palette-warm)" },
  { key: "cool", name: "Cool", css: "var(--color-palette-cool)" },
];


export const lightingService = {
  get() {
    return apiGet("/api/lighting");
  },
  patch(patch) {
    return apiPatch("/api/lighting", patch);
  },
};

let brightnessTimer = null;

export async function loadLighting(store) {
  const data = await lightingService.get();
  store.setSlice("lighting", data);
}

export async function setLightingEnabled(store, enabled) {
  store.setSlice("lighting", { ...store.getState().lighting, enabled });
  await lightingService.patch({ enabled });
}

export function setLightingBrightness(store, brightness) {
  const b = Number(brightness);
  store.setSlice("lighting", { ...store.getState().lighting, brightness: b });

  clearTimeout(brightnessTimer);
  brightnessTimer = setTimeout(() => {
    lightingService.patch({ brightness: b }).catch(console.error);
  }, 250);
}

export async function setLightingColor(store, colorKey) {
  store.setSlice("lighting", { ...store.getState().lighting, colorKey });
  await lightingService.patch({ colorKey });
}


export function renderLighting(root, store) {
  root.innerHTML = `
    <section class="lighting">
      <div class="wrapper-container">
        <div class="card controller lighting-card">

          <div class="lighting-head">
            <div class="lighting-head__left">
              <div class="lighting-icon" aria-hidden="true">
                <span class="icon icon--light"></span>
              </div>

              <div class="lighting-titles">
                <div class="lighting-title">Ambient Lighting</div>
                <div class="lighting-subtitle">Interior LED control</div>
              </div>
            </div>

            <label class="switch" title="Ambient lighting an/aus">
              <input type="checkbox" id="lightEnabled" checked />
              <span class="switch__track" aria-hidden="true"></span>
              <span class="switch__thumb" aria-hidden="true"></span>
            </label>
          </div>

          <span class="color-bar" role="presentation"></span>

          <div class="brightness">
            <div class="brightness__row">
              <div class="brightness__label">Brightness</div>
              <div class="brightness__value"><span id="brightValue">70</span>%</div>
            </div>

            <input
              class="brightness__slider"
              id="brightSlider"
              type="range"
              min="0"
              max="100"
              value="70"
            />
          </div>

          <div class="presets">
            <div class="presets__label">Color Presets</div>

            <div class="preset-grid" role="list">
              ${LIGHTING_PRESETS.map((p) => `
                <button
                  class="preset"
                  type="button"
                  role="listitem"
                  data-key="${p.key}"
                  data-name="${p.name}"
                  aria-label="${p.name}"
                  style="--preset:${p.css}"
                ></button>
              `).join("")}
            </div>
          </div>

          <div class="lighting-info">
            <span class="lighting-info__em">Ambient lighting</span>
            affects the infotainment UI colors and updates the interior led stars.
          </div>
        </div>
      </div>
    </section>
  `;

  const toggleBtn = root.querySelector("#lightEnabled");
  const slider = root.querySelector("#brightSlider");
  const brightValue = root.querySelector("#brightValue");
  const grid = root.querySelector(".preset-grid");
  
  store.subscribeSelector(s => s.lighting, (l) => {
    if(!l) return;

    toggleBtn.checked = !!l.enabled;
    slider.value = String(l.brightness ?? 0);
    brightValue.textContent = String(l.brightness ?? 0);
    slider.disabled = !l.enabled;

    const preset = LIGHTING_PRESETS.find(p => p.key === l.colorKey) ?? LIGHTING_PRESETS[2];
    document.documentElement.style.setProperty("--system-color", preset.css);
  
    grid.querySelectorAll(".preset").forEach(b => {
      if(b.dataset.key === preset.key) b.setAttribute("data-active", "true");
      else b.removeAttribute("data-active");
    });
  });
  
  toggleBtn.addEventListener("change", (e) => {
    setLightingEnabled(store, e.currentTarget.checked).catch(console.error);
  });

  slider.addEventListener("input", (e) => {
    setLightingBrightness(store, e.currentTarget.value);
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".preset");
    if(!btn) return;
    setLightingColor(store, btn.dataset.key).catch(console.error);
  });

  loadLighting(store).catch(console.error);

}
