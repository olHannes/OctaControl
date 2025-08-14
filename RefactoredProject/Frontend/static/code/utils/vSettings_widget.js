class VisibleSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000";

        this.widgets = [
        { id: "audio-widget", label: "Audio" },
        { id: "map-widget", label: "Map" },
        { id: "time-widget", label: "Time" },
        { id: "clock-widget", label: "Clock" },
        { id: "relais-widget", label: "Relais" },
        { id: "climate-widget", label: "Klima" },
        { id: "leftSidebar", label: "Sidebar" },
        ];
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
    }

    setupListeners() {
        this.widgets.forEach(({ id }) => {
            const btn = this.shadowRoot.getElementById(`btn-${id}`);
            if (!btn) return;

            btn.addEventListener("click", () => {
                const widgetElem = document.getElementById(id);
                if (!widgetElem) return;

                if (widgetElem.style.display === "none") {
                    widgetElem.style.display = "block";
                    btn.classList.add("active");
                    if(id === "leftSidebar"){document.getElementById("widget-container").style.width="95%";}
                
                } else {
                    widgetElem.style.display = "none";
                    btn.classList.remove("active");
                    if(id === "leftSidebar"){document.getElementById("widget-container").style.width="100%";}
                }
            });
        });
    }

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
