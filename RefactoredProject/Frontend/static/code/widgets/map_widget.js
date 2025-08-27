//code/widgets/map_widget.js

import {save, load } from '../utils/storage_handler.js';

class MapWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000";
        this.map = null;
        this.marker = null;
    }

    
    /**
     * connected callback
     */
    connectedCallback() {
        this.render();
        this.loadLeaflet(() => this.initMap());
    }


    /**
     * load Leaflet
     */
    loadLeaflet(callback) {
        if (typeof L !== "undefined") {
            callback();
            return;
        }

        const script = document.createElement("script");
        script.src = "../static/libs/leaflet/leaflet.js";
        script.onload = callback;
        this.shadowRoot.appendChild(script);
    }


    /**
     * init Map
     */
    initMap() {
        const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {attribution: '&copy; CartoDB'});
        const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'});
        const savedLayer = load("MAP_STYLE") ?? 0;

        const defaultCoords = [52.5200, 13.4050];
        const myIcon = L.icon({
            iconUrl: '../static/media/pos_marker.svg',
            iconSize: [55, 55],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        this.map = L.map(this.shadowRoot.querySelector("#map"), {
            center: defaultCoords,
            zoom: 13,
            layers: [savedLayer == 0 ? normalLayer : darkLayer]
        });

        this.marker = L.marker(defaultCoords, {icon: myIcon}).addTo(this.map)
            .bindPopup("Standort wird ermittelt...");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = [pos.coords.latitude, pos.coords.longitude];
                    this.map.setView(coords, 15);
                    this.marker.setLatLng(coords);
                },
                (err) => {
                    console.error("Geolocation Fehler:", err);
                }
            );
        }

        function invertMarker(marker, invert = true) {
            if (marker && marker._icon) {
                marker._icon.style.filter = invert ? "invert(1)" : "none";
            }
        }

        const DarkModeControl = L.Control.extend({
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                container.style.backgroundColor = 'white';
                container.style.width = '30px';
                container.style.height = '30px';
                container.style.cursor = 'pointer';
                container.style.textAlign = 'center';
                container.style.lineHeight = '30px';
                container.title = "Toggle Dark Mode";
                container.innerHTML = '🌙';

                container.onclick = () => {
                    if (map.hasLayer(normalLayer)) {
                        map.removeLayer(normalLayer);
                        map.addLayer(darkLayer);
                        invertMarker(this.marker, true);
                        save("MAP_STYLE", 1);
                    } else {
                        map.removeLayer(darkLayer);
                        map.addLayer(normalLayer);
                        invertMarker(this.marker, false);
                        save("MAP_STYLE", 0);
                    }
                };
                return container;
            }
        });

        this.map.addControl(new DarkModeControl({ position: 'topleft' }));
    }

    
    /**
     * render
     */
    render() {
        const pStyle = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    max-width: 750px;
                    margin: 0 auto;
                }
                #map {
                    min-height: 200px;
                    min-width: 350px;
                    width: 100%;
                    height: 100%;
                    border-radius: 18px;
                }

                .leaflet-container .leaflet-control-attribution, .leaflet-container .leaflet-control-scale {
                    display: none;
                }
            </style>
        `;

        const pHTML = `
            <link rel="stylesheet" href="../static/libs/leaflet/leaflet.css">
            <div id="map"></div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
    }
}

customElements.define("map-widget", MapWidget);
