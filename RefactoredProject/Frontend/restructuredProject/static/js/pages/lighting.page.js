// js/pages/lighting.page.js
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
              ${[
                ["Skoda",   "var(--color-palette-skoda)"],
                ["Ocean",   "var(--color-palette-ocean)"],
                ["Sunset", "var(--color-palette-sunset)"],
                ["Royal", "var(--color-palette-royal)"],
                ["Rose",   "var(--color-palette-rose)"],
                ["Pure",  "var(--color-palette-pure)"],
                ["Warm",  "var(--color-palette-warm)"],
                ["Cool",   "var(--color-palette-cool)"],
              ].map(([name, hex], idx) => `
                <button
                  class="preset"
                  type="button"
                  role="listitem"
                  data-color="${hex}"
                  data-name="${name}"
                  aria-label="${name}"
                  style="--preset:${hex}"
                  ${idx === 2 ? 'data-active="true"' : ""}
                  
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

  const slider = root.querySelector("#brightSlider");
  const brightValue = root.querySelector("#brightValue");
  slider?.addEventListener("input", () => (brightValue.textContent = slider.value));

  const grid = root.querySelector(".preset-grid");
  grid?.addEventListener("click", (e) => {
    const btn = e.target.closest(".preset");
    if (!btn) return;

    grid.querySelectorAll(".preset").forEach(b => b.removeAttribute("data-active"));
    btn.setAttribute("data-active", "true");

    const c = btn.dataset.color;
    document.documentElement.style.setProperty("--system-color", c);
  });
}
