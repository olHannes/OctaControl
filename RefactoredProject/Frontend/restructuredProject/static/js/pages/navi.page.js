
let main_map;
let main_marker;

export function renderNavi(root) {
  root.innerHTML = `
    <div class="card map-data">
      <div class="map-data-block">
        <span class="icon icon--satellites"></span>
        <div class="vertical-container">
          <span>--</span>
          <span class="card-title">Satellites</span>
        </div>
      </div>

      <div class="map-data-block">
        <span class="icon icon--altitude"></span>
        <div class="vertical-container">
          <span>--m</span>
          <span class="card-title">Altitude</span>
        </div>  
      </div>

      <div class="map-data-block">
        <span class="icon icon--speed"></span>
        <div class="vertical-container">
          <span>--km/h</span>
          <span class="card-title">Speed</span>
        </div>
      </div>

      <div class="map-data-block">
        <span class="icon icon--direction"></span>
        <div class="vertical-container">
          <span>--°</span>
          <span class="card-title">Direction</span>
        </div>
      </div>

      <div class="map-data-block">
        <span class="icon icon--accuracy"></span>
        <div class="vertical-container">
          <span class="quality-bad">bad</span>
          <span class="card-title">Quality</span>
        </div>
      </div>
    </div>

    <div class="card map-container">
      <div id="main_map"></div>
    </div>
  `;

  initMainMap();
}

function initMainMap() {
  if (main_map) return;

  main_map = L.map("main_map").setView([52.5200, 13.4050], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; CartoDB",
  }).addTo(main_map);

  const positionIcon = L.icon({
    iconUrl: "/RefactoredProject/Frontend/restructuredProject/static/assets/icons/map/position-location-svgrepo-com.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    className: "pos-marker",
  });
  main_marker = L.marker([52.5200, 13.4050], { icon: positionIcon }).addTo(main_map);

}