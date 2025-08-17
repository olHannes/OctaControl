//code/api/relais_widget.js

import {save, load, StorageKeys } from '../utils/settings.js';

class RelaisWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/system/relais";
        
        this.relaiApis = {
            "init": `${this.apiPath}/init`,
            "status": `${this.apiPath}/status?type=`,
            "toggle": `${this.apiPath}/toggle`
        };

        this.state = {
            "trunk": false,
            "park-assistent": false
        };
    }


    /**
     * initilize widget and loads the status
     */
    connectedCallback() {
        this.render();
        this.initWidget();
    }


    /**
     * init Widget
     * gets called one time and initializes the gpio pins and calls load status
     */
    async initWidget(){
        try {
            const res = await fetch(this.relaiApis.init);
            if(!res.ok) throw new Error("Failed to initialize GPIO pins");
        } catch (error) {
            console.error(`Initialization failed: ${error}`);
        } finally {
            this.loadStatus();
        }
    }
    

    /**
     * load Status
     * updates the status for both devices
     */
    async loadStatus() {
        for (let device of Object.keys(this.state)) {
            try{
                const res = await fetch(`${this.relaiApis.status}${device}`);
                if(!res.ok) throw new Error(`Failed to load Status`);
                const data = await res.json();
                this.state[device] = (data.status === "on");
            } catch (error){
                console.error(`Faild load status: ${error}`);
            } finally {

            }
        }
        this.updateUI();
        this.loadSettings();
    }


    /**
     * toggle Device
     * @param device: aimed device
     */
    async toggleDevice(device) {
        const newState = !this.state[device];
        
        try {
            const res = await fetch(`${this.relaiApis.toggle}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: device, newState })
            });
            if(!res.ok) throw new Error(`Failed to set device '${device}' to '${newState}'`);
            this.state[device] = newState;
            this.updateUI();
            this.saveSettings();

        } catch (error) {
            console.error(`Failed to toggle Device: ${error}`);
        }
    }


    /**
     * extern management
     * set Device state
     * @param device: the aimed device
     * @param state: the aimed state
     */
    setDeviceState(device, state) {
        this.state[device] = state;
        this.updateUI();
        this.saveSettings();
    }


    /**
     * extern management
     * get device state
     * @param device: the searched device
     */
    getDeviceState(device) {
        return this.state[device];
    }

    
    /**
     * update UI
     * updates the ui based on the current status of the GPIO-Pins
     */
    updateUI() {
        for (let device of Object.keys(this.state)) {
            const el = this.shadowRoot.querySelector(`.device[data-device="${device}"]`);
            if(!el) continue;
            if (this.state[device]) {
                el.classList.add("on");
            } else {
                el.classList.remove("on");
            }
        }
    }


    /**
     * save Settings
     */
    saveSettings() {
        save("TRUNK_ACTIVE", this.state.trunk);
        save("ASSISTANT", this.state["park-assistent"]);
    }


    /**
     * load Settings
     */
    loadSettings() {
        const trunk = load("TRUNK_ACTIVE");
        const assistant = load("ASSISTANT");

        if (trunk !== null) {
            if((trunk && !this.state.trunk) || (!trunk && this.state.trunk)){
                this.toggleDevice("trunk");
            }
        }
        if (assistant !== null){
            if((assistant && !this.state['park-assistent']) || (!assistant && this.state['park-assistent'])){
                this.toggleDevice("park-assistent");
            }
        }
    }


    /**
     * render
     * setup of html und css
     */
    render() {
        const style = `
            <style>
                :host {
                    --bg: #0f1724;
                    --card: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
                    --accent: #7dd3fc;
                    --muted: rgba(255,255,255,0.7);
                    display: block;
                    width: 100%;
                    height: 200px;
                    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                    color: var(--muted);
                }

                .relais-widget {
                    width: 100%;
                    height: 100%;
                    background: var(--card);
                    border-radius: 7px;
                    box-shadow: 0 8px 30px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                header {
                    padding: 0.8rem;
                    text-align: center;
                    font-weight: 700;
                    font-size: 1.05rem;
                    color: white;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }

                main {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    flex: 1;
                    padding: 0.5rem;
                }

                .device {
                    background: rgba(255,255,255,0.03);
                    border-radius: 10px;
                    padding: 1rem;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
                }

                .device:hover {
                    transform: translateY(-2px);
                }

                .device.on {
                    background: linear-gradient(180deg, rgba(125,211,252,0.15), rgba(125,211,252,0.05));
                    box-shadow: 0 0 12px rgba(125,211,252,0.4);
                    color: white;
                }

                .icon {
                    font-size: 2rem;
                    margin-bottom: 0.4rem;
                }

                .icon img {
                    width: 2rem;
                    height: 2rem;
                } 

                .label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-align: center;
                }
            </style>
        `;

        const html = `
            <div class="relais-widget">
                <header>Relais Steuerung</header>
                <main>
                    <div class="device on" data-device="trunk">
                        <div class="icon"><img src="../static/media/trunk-relais.svg" alt="Audio Icon"></img></div>
                        <div class="label">Audio</div>
                    </div>
                    <div class="device" data-device="park-assistent">
                        <div class="icon"><img src="../static/media/park-sensor.svg" alt="Assistant icon"></img></div>
                        <div class="label">Assistent</div>
                    </div>
                </main>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;

        this.shadowRoot.querySelectorAll(".device").forEach(dev => {
            dev.addEventListener("click", () => {
                const device = dev.getAttribute("data-device");
                this.toggleDevice(device);
            });
        });
    }
}

customElements.define("relais-widget", RelaisWidget);
