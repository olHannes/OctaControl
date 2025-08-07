// code/api/wifi_controller_widget.js

class WifiSetupWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }


    /**
     * Initial function
     * -> renders the content
     */
    connectedCallback() {
        this.render();
        this.addListeners
        this.known();
    }


    /**
     * Shows a Loading animation
     */
    showLoader() {
        this.shadowRoot.querySelector("#loader").classList.remove("hidden");
    }


    /**
     * hide Loader
     * Hides a Loading animation
     */
    hideLoader() {
        this.shadowRoot.querySelector("#loader").classList.add("hidden");
    }


    /**
     * status
     */
    async status(){
    try {
        const res = await fetch("/api/wifi/status", { method: "GET" });
        if(!res.ok) throw new Error("Failed to fetch status");
        
        const data = await res.json();
        const state = data.state;
        const status = data.status;
        
        let name = "-";
        let ip = "-";
        let signal = "-";
        
        const toggleBtn = this.shadowRoot.querySelector("#toggleBtn");
        toggleBtn.textContent = (state === "on") ? "WLAN deaktivieren" : "WLAN aktivieren";

        if (status === "connected") {
            name = data.name;
            ip = data.ip;
            signal = data.signal;
        }

        this.shadowRoot.querySelector("#statusName").textContent = `Verbunden mit: ${name}`;
        this.shadowRoot.querySelector("#statusIp").textContent = `IP: ${ip}`;
        this.shadowRoot.querySelector("#statusSignal").textContent = `Signal: ${signal}`;

        return data;
    } catch (error) {
        console.error("Failed to load status", error);
    }
}



    /**
     * toggle Wifi
     */
    async toggleWifi() {
        this.showLoader();
        try {
            const data = await this.status();
            const newState = (data.state === "on") ? "off" : "on";

            const res = await fetch("/api/wifi/power", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ state: newState })
            });

            if (!res.ok) throw new Error("Failed to toggle WLAN power");

            await this.status();
        } catch (error) {
            console.error("Failed to toggle WLAN:", error);
        } finally {
            this.hideLoader();
        }
    }



    /**
     * scan
     */
    async scan(){
        this.showLoader();
        try {
            const res = await fetch("/api/wifi/scan", { mehtod: "GET" });
            if(!res.ok) throw new Error("Failed to scan networks");

            const data = await res.json();
            this.renderNetwork(data, true);
        } catch (error) {
            console.error("Failed to scan", error);
        } finally {
            this.hideLoader();
        }
    }


    /**
     * known
     */
    async known(){
        this.showLoader();
        try {
            
        } catch (error) {
            
        } finally {
            this.hideLoader();
        }
    }


    /**
     * connect
     */
    async connect(wifi, password){
        this.showLoader();
        try {
            
        } catch (error) {
            
        } finally {
            this.hideLoader();
        }
    }


    /**
     * disconnect
     */
    async disconnect(wifi){
        this.showLoader();
        try {
            
        } catch (error) {
            
        } finally {
            this.hideLoader();
        }
    }


    /**
     * render Network
     */
    renderNetwork(list, scanned=false){
        const listTag = this.shadowRoot.querySelector("#networkList");

        list.forEach(element => {
            
        });
    }
    

    /**
     * setup Listeners
     */
    setupListeners(){
        const root = this.shadowRoot;

        root.querySelector("#scanBtn").addEventListener("click", () => this.scan());
        root.querySelector("#knownBtn").addEventListener("click", () => this.known());
        root.querySelector("#toggleBtn").addEventListener("click", () => this.toggleWifi());

    }


    /**
     * render 
     */
    render() {
        const pStyle = `
            <style>
                .loader {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top: 4px solid #61dafb;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    animation: spin 1s linear infinite;
                    z-index: 1000;
                }

                .hidden {
                    display: none;
                }

                @keyframes spin {
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }

                .wifi-widget {
                    font-family: sans-serif;
                    padding: 1rem;
                    background: #0e0e12;
                    color: white;
                    border-radius: 12px;
                    width: 100%;
                    box-sizing: border-box;
                }

                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .status {
                    background: #1b1b22;
                    padding: 0.8rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .status p {
                    margin: 0.2rem 0;
                }

                .actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .actions button {
                    flex: 1;
                    padding: 0.5rem;
                    font-size: 1rem;
                    background: #1f2c44;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .list {
                    max-height: 250px;
                    overflow-y: auto;
                    background: #16161d;
                    padding: 0.5rem;
                    border-radius: 8px;
                }

                .network-item {
                    padding: 0.5rem;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .network-item:last-child {
                    border-bottom: none;
                }

                .network-name {
                    font-weight: bold;
                }

                .network-actions button {
                    margin-left: 0.3rem;
                    background: #2b3a5e;
                    border: none;
                    color: white;
                    padding: 0.3rem 0.6rem;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
        `;

        const pHTML = `
            <div class="wifi-widget">
                <header>
                    <h3>WLAN-Einstellungen</h3>
                    <button id="toggleBtn">An/Aus</button>
                </header>

                <section class="status">
                    <p id="statusName">Verbunden mit: -</p>
                    <p id="statusIp">IP: -</p>
                    <p id="statusSignal">Signal: -</p>
                </section>

                <div class="actions">
                    <button id="scanBtn">Netzwerke scannen</button>
                    <button id="knownBtn">Bekannte Netzwerke</button>
                </div>

                <div class="list" id="networkList">
                    <!-- Netzwerk-Items hier -->
                </div>

                <div id="loader" class="loader hidden"></div>
            </div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
    }
}


customElements.define("wifi-setup-widget", WifiSetupWidget);
