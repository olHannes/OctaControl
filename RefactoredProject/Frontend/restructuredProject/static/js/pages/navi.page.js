
let main_map;
let main_marker;

export function renderNavi(root, store) {
  root.innerHTML = `
    <section class="navi">
      <div class="card" style="padding: 0; padding-top: 15px;">
      <div class="map-data">
        <div class="map-data-block">
          <span class="icon icon--satellites"></span>
          <div class="vertical-container">
            <span data-kpi="satellites">--</span>
            <span class="card-title">Satellites</span>
          </div>
        </div>

        <div class="map-data-block">
          <span class="icon icon--altitude"></span>
          <div class="vertical-container">
            <span data-kpi="altitude">--m</span>
            <span class="card-title">Altitude</span>
          </div>  
        </div>

        <div class="map-data-block">
          <span class="icon icon--speed"></span>
          <div class="vertical-container">
            <span data-kpi="speed">--km/h</span>
            <span class="card-title">Speed</span>
          </div>
        </div>

        <div class="map-data-block">
          <span class="icon icon--direction"></span>
          <div class="vertical-container">
            <span data-kpi="direction">--°</span>
            <span class="card-title">Direction</span>
          </div>
        </div>

        <div class="map-data-block">
          <span class="icon icon--accuracy"></span>
          <div class="vertical-container">
            <span data-kpi="accuracy" data-quality="bad">error</span>
            <span class="card-title">Accuracy</span>
          </div>
        </div>
      </div>
        
      <div class="map-container">
        <div id="main_map"></div>
      </div>
      </div>
    </section>
  `;

  initMainMap();


  const elSat  = root.querySelector('[data-kpi="satellites"]');
  const elAlt  = root.querySelector('[data-kpi="altitude"]');
  const elSpe  = root.querySelector('[data-kpi="speed"]');
  const elDir  = root.querySelector('[data-kpi="direction"]');
  const elAcc  = root.querySelector('[data-kpi="accuracy"]');

  
  store.subscribeSelector(s => s.sensor, (sensor) => {
    const gps = sensor?.gps ?? {};
    if(elSat) elSat.textContent = (gps.sats == null) ? "--" : `${gps.sats}`;
    if(elAlt) elAlt.textContent = (gps.altitude == null) ? "-- h" : `${gps.altitude.toFixed(1)}m`;
    if(elSpe) elSpe.textContent = (gps.speed == null) ? "-- km/h" : `${gps.speed.toFixed(0)} km/h`;
    if(elDir) elDir.textContent = (gps.heading == null) ? "--°" : `${gps.heading.toFixed(0)}°`;

    if(elAcc) elAcc.textContent = (gps.accuracy == null || gps.quality == null) ? "error" : `${gps.accuracy.toFixed(0)}`;
    elAcc.dataset.quality = (gps.quality == null) ? "bad" : gps.quality;

    const lat = gps.lat, lon = gps.lon;
    if (main_map && main_marker && lat != null && lon != null) {
      const ll = [lat, lon];
      main_marker.setLatLng(ll);
      main_map.panTo(ll, { animate: false });
    }
  });
}



function initMainMap() {
  if (main_map) return;

  main_map = L.map("main_map").setView([52.5200, 13.4050], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; CartoDB",
  }).addTo(main_map);

  const positionIcon = L.icon({
    iconUrl: "../static/assets/icons/map/position-location-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    className: "pos-marker",
  });
  main_marker = L.marker([52.5200, 13.4050], { icon: positionIcon }).addTo(main_map);

}


window.addEventListener("view:shown", (e) => {
  if(e.detail.view === "navi") {
    requestAnimationFrame(() => {
      //console.log("resize navi-map");
      main_map.invalidateSize();
    })
  }
})