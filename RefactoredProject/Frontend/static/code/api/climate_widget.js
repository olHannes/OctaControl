//code/api/climate_widget.js
class ClimateWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/climate";

        this.climateApis = {
            init: `${this.apiPath}/init`,
            start: `${this.apiPath}/start`,
            stop: `${this.apiPath}/stop`,
            local: `${this.apiPath}/get`,
        };

        this.pollingIntervall = null;
    }


    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.initWidget();
    }


    /**
     * init Widget
     */
    async initWidget() {
        //call init api
        try {
            const initRes = await fetch(this.climateApis.init);
            if (!initRes.ok) throw new Error("init failed");
        } catch (error) {
            console.error(`Failed to init climate-widget: ${error}`);
            return;
        }
        //after init: start
        try {
            const initStart = await fetch(this.climateApis.start, { method: "POST" });
            if (!initStart.ok) throw new Error("start failed");
        } catch (error) {
            console.error(`Failed to start climate-reading thread: ${error}`);
            return;
        }
        this.getLocal();
    }


    /**
     * get local
     */
    async getLocal() {
        this.shadowRoot.querySelector("#updateBtn").classList.add("disabled");
        try {
            const res = await fetch(this.climateApis.local);
            if(!res.ok) throw new Error("Failed to load local climate data");

            const data = await res.json();
            const newTemp = data.temperature;
            const newHumi = data.humidity;

            this.shadowRoot.querySelector("#tempValue").textContent = `${newTemp}°C`;
            this.shadowRoot.querySelector("#humValue").textContent = `${newHumi}%`;

        } catch (error) {
            console.error(`Failed to load local data: ${error}`);   
        }
        this.shadowRoot.querySelector("#updateBtn").classList.remove("disabled");
    }


    /**
     * get Remote
     */
    async getRemote() {
        try {
            //call openweather api (if possible)
            //Location (gps) can be read in future per gps-api
        } catch (error) {
            
        }
    }


    /**
     * toggle Polling
     */
    togglePolling() {
        if(this.pollingIntervall){ 
            clearInterval(this.pollingIntervall);
            this.pollingIntervall = null;
            
            this.shadowRoot.querySelector("#toggleBtn").textContent = "Start";
            this.shadowRoot.querySelector("#toggleBtn").style.background = "#00800061";
        } else {
            this.pollingIntervall = setInterval(() => this.getLocal(), 5000);

            this.shadowRoot.querySelector("#toggleBtn").textContent = "Stop";
            this.shadowRoot.querySelector("#toggleBtn").style.background = "#80000061";
        }
    }


    /**
     * render
     * setup of html and css
     */
    render() {
        const style = `
            <style>
                :host {
                    --bg: #0f1724;
                    --card: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
                }

                .climate-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: --card;
                    border-radius: 8px;
                    width: 220px;
                    padding: 16px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    color: white;
                    user-select: none;
                }

                h2 {
                    font-weight: 600;
                    font-size: 1.25rem;
                    margin: 0 0 12px 0;
                    text-align: center;
                }

                .data-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-size: 1.1rem;
                }

                .label {
                    font-weight: 500;
                    color: white;
                }

                .value {
                    font-weight: 700;
                    color: #ccc;
                }

                .buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                }

                button {
                    flex: 1;
                    padding: 8px 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    background-color: #0078d44f;
                    color: white;
                    transition: background-color 0.2s ease;
                    user-select: none;
                }

                .disabled {
                    background-color: #999;
                    cursor: not-allowed;
                }

                #toggleBtn {
                    background-color: #00800061;
                }
            </style>
        `;

        const html = `
            <div class="climate-container">
                <h2>Klima</h2>
                <div class="data-row">
                    <div class="label">Temperatur:</div>
                    <div id="tempValue" class="value">-- °C</div>
                </div>
                <div class="data-row">
                    <div class="label">Luftfeuchtigkeit:</div>
                    <div id="humValue" class="value">-- %</div>
                </div>
                <div class="buttons">
                    <button id="toggleBtn" type="button">Start</button>
                    <button id="updateBtn" type="button">Update</button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;

        this.shadowRoot.querySelector("#toggleBtn").addEventListener("click", () => this.togglePolling());
        this.shadowRoot.querySelector("#updateBtn").addEventListener("click", () => this.getLocal());
    }

}

customElements.define("climate-widget", ClimateWidget);
