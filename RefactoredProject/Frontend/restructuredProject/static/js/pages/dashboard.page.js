// js/pages/dashboard.page.js
export function renderDashboard(root, store) {
  root.innerHTML = `
    <section class="dashboard">
      <div class="grid dashboard__grid">
        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile" aria-hidden="true">
              <span class="icon icon--temp"></span>
            </span>
          </div>
          <div class="card-title">Temperatur</div>
          <div class="big" id="tempVal">-- °C</div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile" aria-hidden="true">
              <span class="icon icon--hum"></span>
            </span>
          </div>
          <div class="card-title">Luftfeuchte</div>
          <div class="big" id="humVal">-- %</div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile" aria-hidden="true">
              <span class="icon icon--lux"></span>
            </span>
          </div>
          <div class="card-title">Helligkeit</div>
          <div class="big" id="luxVal">-- lx</div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile" aria-hidden="true">
              <span class="icon icon--audio"></span>
            </span>
          </div>
          <div class="card-title">Audio</div>
          <div class="big dashboard-audio" id="audioLine">--</div>
        </div>
      </div>
    </section>
  `;

  // Cache DOM nodes once (skeptisch: querySelector in jedem subscribe ist unnötig)
  const tempEl = root.querySelector("#tempVal");
  const humEl = root.querySelector("#humVal");
  const luxEl = root.querySelector("#luxVal");
  const audioEl = root.querySelector("#audioLine");

  // Initial render (falls Store bereits Werte hat)
  const render = (s) => {
    if (tempEl && s.sensors?.temp != null) tempEl.textContent = `${s.sensors.temp.toFixed(1)} °C`;
    if (humEl && s.sensors?.hum != null) humEl.textContent = `${Math.round(s.sensors.hum)} %`;
    if (luxEl && s.sensors?.lux != null) luxEl.textContent = `${Math.round(s.sensors.lux)} lx`;

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
