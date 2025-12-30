// js/pages/dashboard.page.js
let map;
let marker;

export function renderDashboard(root, store) {
  root.innerHTML = `
    <section class="dashboard">
      <div class="grid dashboard__grid">

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile"><span class="icon icon--temp"></span></span>
          </div>
          <div class="card-title">Temperatur</div>
          <div class="big" id="tempVal">
            <span class="big__value" data-kpi="temp">--</span>
            <span class="big__unit">°C</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile"><span class="icon icon--hum"></span></span>
          </div>
          <div class="card-title">Luftfeuchte</div>
          <div class="big" id="humVal">
            <span class="big__value" data-kpi="hum">--</span>
            <span class="big__unit">%</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile"><span class="icon icon--lux"></span></span>
          </div>
          <div class="card-title">Helligkeit</div>
          <div class="big" id="luxVal">
            <span class="big__value" data-kpi="lux">--</span>
            <span class="big__unit">lx</span>
          </div>
        </div>

        <div class="card dashboard-card">
          <div class="card__top">
            <span class="icon-tile"><span class="icon icon--position"></span></span>
          </div>
          <div class="card-title">Position</div>
          <div class="big" id="posVal">
            <span class="big__value" data-kpi="pos-lat">--</span>
            <span class="big__unit" data-kpi="pos-lon">--</span>
          </div>
        </div>

      </div>

      <div class="big__card">
        <div class="map_card">
          <div id="map"></div>

          <div class="map_info" id="map_dashboard-info">
            <div class="map_info_tile">
              <span class="icon icon--satellites"></span>
              <span class="value" data-kpi="sats">--</span>
              <span class="big__unit">Satellites</span>
            </div>
            <div class="seperator_vertical"></div>
            <div class="map_info_tile">
              <span class="icon icon--altitude"></span>
              <span class="value" data-kpi="alt">--</span>
              <span class="big__unit">Altitude</span>
            </div>
            <div class="seperator_vertical"></div>
            <div class="map_info_tile">
              <span class="icon icon--speed"></span>
              <span class="value" data-kpi="speed">--</span>
              <span class="big__unit">Speed</span>
            </div>
            <div class="seperator_vertical"></div>
            <div class="map_info_tile">
              <span class="icon icon--direction"></span>
              <span class="value" data-kpi="heading">--</span>
              <span class="big__unit">Direction</span>
            </div>
          </div>
        </div>

        <div class="audio_card">audio</div>
      </div>
    </section>
  `;

  // Cache
  const elTemp    = root.querySelector('[data-kpi="temp"]');
  const elHum     = root.querySelector('[data-kpi="hum"]');
  const elLux     = root.querySelector('[data-kpi="lux"]');
  const elPosLat  = root.querySelector('[data-kpi="pos-lat"]');
  const elPosLon  = root.querySelector('[data-kpi="pos-lon"]');

  const elSats    = root.querySelector('[data-kpi="sats"]');
  const elAlt     = root.querySelector('[data-kpi="alt"]');
  const elSpeed   = root.querySelector('[data-kpi="speed"]');
  const elHeading = root.querySelector('[data-kpi="heading"]');

  // Map einmal init
  initMapOnce();

  // Nur auf sensor-slice reagieren
  store.subscribeSelector(s => s.sensor, (sensor) => {
    const t = sensor?.climate?.temperature;
    const h = sensor?.climate?.humidity;
    const b = sensor?.brightness;

    if (elTemp) elTemp.textContent = (t == null) ? "--" : t.toFixed(1);
    if (elHum)  elHum.textContent  = (h == null) ? "--" : Math.round(h);
    if (elLux)  elLux.textContent  = (b == null) ? "--" : Math.round(b);

    const gps = sensor?.gps ?? {};
    const lat = gps.lat, lon = gps.lon;

    if(elPosLat) {
      elPosLat.textContent = (lat == null) ? "--°" : `${lat.toFixed(2)}°N`;
    }
    if(elPosLon) {
      elPosLon.textContent = (lon == null) ? "--°" : `${lon.toFixed(2)}°E`;
    }

    if (elSats)    elSats.textContent    = gps.sats ?? "--";
    if (elAlt)     elAlt.textContent     = (gps.altitude == null) ? "--" : `${Math.round(gps.altitude)} m`;
    if (elSpeed)   elSpeed.textContent   = (gps.speed == null) ? "--" : `${Math.round(gps.speed)} km/h`;
    if (elHeading) elHeading.textContent = (gps.heading == null) ? "--" : `${Math.round(gps.heading)}°`;

    // Map update
    if (map && marker && lat != null && lon != null) {
      const ll = [lat, lon];
      marker.setLatLng(ll);
      // optional: nur bei Dashboard-View aktiv zentrieren (sonst springt es nervig)
      map.panTo(ll, { animate: false });
    }
  });
}

function initMapOnce() {
  if (map) return;

  map = L.map("map").setView([52.5200, 13.4050], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; CartoDB",
  }).addTo(map);

  const positionIcon = L.icon({
    iconUrl: "/RefactoredProject/Frontend/restructuredProject/static/assets/icons/map/position-location-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    className: "pos-marker",
  });
  marker = L.marker([52.5200, 13.4050], { icon: positionIcon }).addTo(map);

}
