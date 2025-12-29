// js/pages/dashboard.page.js
export function renderDashboard(root, store) {
  root.innerHTML = `
    <section class="dashboard" aria-hidden="true">
      <div class="grid dashboard__grid">
        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile">
              <span class="icon icon--temp"></span>
            </span>
          </div>
          <div class="card-title">Temperatur</div>
          <div class="big" id="tempVal">
            <span class="big__value">19.5</span>
            <span class="big__unit">°C</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile">
              <span class="icon icon--hum"></span>
            </span>
          </div>
          <div class="card-title">Luftfeuchte</div>
          <div class="big" id="tempVal">
            <span class="big__value">75</span>
            <span class="big__unit">%</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile">
              <span class="icon icon--lux"></span>
            </span>
          </div>
          <div class="card-title">Helligkeit</div>
          <div class="big" id="tempVal">
            <span class="big__value">100</span>
            <span class="big__unit">lx</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile">
              <span class="icon icon--position"></span>
            </span>
          </div>
          <div class="card-title">Position</div>
          <div class="big" id="posVal">
            <span class="big__value">50.08°N</span>
            <span class="big__unit">14.44°E</span>
          </div>
        </div>

      </div>

      <div class="big__card">
        <div class="map_card">
        
        </div>
        <div class="audio_card">
        
        </div>
      </div>
    </section>
  `;

  // Cache DOM nodes once (skeptisch: querySelector in jedem subscribe ist unnötig)
  const tempEl = root.querySelector("#tempVal .big__value");
  const humEl = root.querySelector("#humVal .big__value");
  const luxEl = root.querySelector("#luxVal .big__value");
  const audioEl = root.querySelector("#audioLine .big__value");

  // Initial render (falls Store bereits Werte hat)
  const render = (s) => {
    if (tempEl && s.sensors?.temp != null) tempEl.textContent = s.sensors.temp.toFixed(1);
    if (humEl && s.sensors?.hum != null) humEl.textContent = Math.round(s.sensors.hum);
    if (luxEl && s.sensors?.lux != null) luxEl.textContent = Math.round(s.sensors.lux);

    if (audioEl) {
      if (s.audio?.source) {
        const state = s.audio.state ?? "--";
        audioEl.textContent = `${s.audio.source} • ${state}`;
      } else {
        audioEl.textContent = `--`;
      }
    }
  };

  render(store.getState?.() ?? {});

  // Update UI when store changes
  store.subscribe((s) => render(s));
}
