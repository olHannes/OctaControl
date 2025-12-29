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
            <div id="map"></div>
          <div class="map_info" id="map_dashboard-info">

            <div class="map_info_tile">
              <span class="icon icon--satellites"></span>
              <span class="value">6</span>
              <span class="big__unit">Satellites</span>
            </div>
            <div class="map_info_tile">
              <span class="icon icon--altitude"></span>
              <span class="value">235m</span>
              <span class="big__unit">Altitude</span>
            </div>
            <div class="map_info_tile">
              <span class="icon icon--speed"></span>
              <span class="value">87 km/h</span>
              <span class="big__unit">Speed</span>
            </div>
            <div class="map_info_tile">
              <span class="icon icon--direction"></span>
              <span class="value">97° E</span>
              <span class="big__unit">Direction</span>
            </div>
            
          </div>
        </div>
        <div class="audio_card">
          audio
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
    setTimeout(initMap, 0);
  };

  render(store.getState?.() ?? {});

  store.subscribe((s) => render(s));
}



let map;

function initMap() {
  if (map) return;

  map = L.map("map").setView([50.08, 14.44], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; CartoDB"
  }).addTo(map);

  //L.marker([50.08, 14.44]).addTo(map);
}
