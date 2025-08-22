//code/widgets/display_settings.js
import { save, load } from "../../utils/storage_handler.js";

class VisibleSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000";

        this.widgets = [
            { id: "audio-widget", label: "Audio", storageKey: "AUDIO_WIDGET" },
            { id: "map-widget", label: "Map", storageKey: "MAP_WIDGET" },
            { id: "time-widget", label: "Time", storageKey: "TIMER_WIDGET" },
            { id: "clock-widget", label: "Clock", storageKey: "CLOCK_WIDGET" },
            { id: "relais-widget", label: "Relais", storageKey: "RELAIS_WIDGET" },
            { id: "climate-widget", label: "Klima", storageKey: "WEATHER_WIDGET" },
        ];
    }


    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.setupInitialVisibility();
        this.setupListeners();
    }


    /**
     * setup initial visibility
     * sets the visibility based on the saved values
     */
    setupInitialVisibility(){
        this.widgets.forEach(({id, storageKey }) => {
            const btn = this.shadowRoot.getElementById(`btn-${id}`);
            const widgetElem = document.getElementById(id);

            if(!btn || !widgetElem) return;

            let visible = true;
            if (storageKey){
                const saved = load(storageKey);
                if(typeof saved === "boolean") visible = saved;
            }
            widgetElem.style.display= visible ? "block": "none";
            btn.classList.toggle("active", visible);
        });
    }


    /**
     * setup Listeners
     * sets the listeners to the buttons and handles the action
     */
    setupListeners() {
        this.widgets.forEach(({ id, storageKey }) => {
            const btn = this.shadowRoot.getElementById(`btn-${id}`);
            if (!btn) return;

            btn.addEventListener("click", () => {
                const widgetElem = document.getElementById(id);
                if (!widgetElem) return;

                const currentlyVisible = widgetElem.style.display !== "none";
                const newVisible = !currentlyVisible;

                widgetElem.style.display= newVisible? "block": "none";
                btn.classList.toggle("active", newVisible);

//                if(id === "leftSidebar")
//                    document.getElementById("widget-container").style.width = newVisible ? "95%" : "100%";

                if(storageKey)
                    save(storageKey, newVisible);
            });
        });
    }


    /**
     * render
     * setup of html and css
     */
    render() {
        const style = `
        <style>
            :host {
                display: block;
                max-width: 750px;
                padding: 10px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }

            .buttons {
                display: flex;
                flex-direction: column; /* untereinander */
                gap: 10px;
                max-width: 200px;
            }

            button {
            padding: 10px 15px;
                font-size: 1rem;
                font-weight: 600;
                color: white;
                background-color: #444;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.3s ease, transform 0.2s ease;
            }

            button:hover {
                background-color: #666;
                transform: scale(1.05);
            }

            button.active {
                background-color: #28a745;
                box-shadow: 0 0 8px #28a745cc;
                transform: scale(1.1);
            }
        </style>
        `;

        const html = `
        <div class="buttons">
            <h2>Widgets-Manager</h2>
            ${this.widgets
            .map(
                (w) => `<button id="btn-${w.id}" class="active">${w.label}</button>`
            )
            .join("")}
        </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("vsettings-widget", VisibleSettings);
