// code/api/bt_controller_widget.js

class BtSetupWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.scanning = false;
    }


    /**
     * Initial function
     * -> renders the content
     * -> update the ui-status
     * -> loads the paired devices
     * -> setup of all listeners
     */
    connectedCallback() {
        this.render();
        this.loadStatus();
        this.loadPairedDevices();
        this.setupListeners();
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
    * Load Status
    * @param returnValue is false in default case
    * @returns if returnValue is true the function returns the status-data
    * -> {powered: yes/no, discoverable: yes/no, pairable: yes/no, discoverable_timeout: int, connected_device: {address, name}}
    * if returnValue is false: update text of ui-status
    */
    async loadStatus(returnValue=false) {
        try {
            const res = await fetch("/api/bluetooth/setup/status");
            if(!res.ok) throw new Error("Serverfehler")
            const data = await res.json();

        if(returnValue == true){
            return data;
        } else {
                const status = data.powered === "yes" ? "EIN" : "AUS";
                const deviceName = data.name || "Unbekannt";

                const btStatus = this.shadowRoot.querySelector("#btStatus");
                btStatus.innerHTML = `Bluetooth: <strong>${status}</strong> - `;

                const deviceNameSpan = document.createElement("span");
                deviceNameSpan.className = "device-name";
                deviceNameSpan.textContent = deviceName;
                btStatus.appendChild(deviceNameSpan);

                requestAnimationFrame(() => {
                    if(deviceNameSpan.scrollWidth > deviceNameSpan.clientWidth) {
                        deviceNameSpan.classList.add("scroll");
                    }else {
                        deviceNameSpan.classList.remove("scroll");
                    }
                });
            }
        } catch (err) {
            console.error("Fehler beim Status laden: ", err);
        }
    }


    /**
    * toggle Power
    * reads the current status and toggles the bluetooth power
    * reloads the ui-status
    */
    async togglePower() {
        this.showLoader();
        try {
            const res = await this.loadStatus(true);
            if(!res.ok) throw new Error("Failed toggle Bluetooth");
            const current = res.powered;
            const newState = current == "yes" ? "off" : "on";

            await fetch("/api/bluetooth/setup/power", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: newState })
            });
            this.loadStatus();
        }catch (e){
            console.error("Failure while toggle Bluetooth power: ", e);
        }finally {
            this.hideLoader();
        }
    }


    /**
    * toggle Visibility
    * reads the current status and toggles the visibility of the bluetooth device
    * relaods the ui-status
    */
    async toggleVisibility() {
        this.showLoader();
        const current = await this.loadStatus(true);
        if(!current) {
            console.error("failed toggle visibility: status was undefined");
            this.hideLoader();
        }
        const newVisibility = current.discoverable === "yes" ? "off" : "on";

        try{
            const res = await fetch("/api/bluetooth/setup/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ discoverable: newVisibility })
            });
            if(!res.ok){
                throw new Error("Failed toggle visibility");
            }else {
                const responseData = await res.json();
                if(responseData.discoverable !== newVisibility){
                    console.warn("Couldnt toggle visibility!");
                    if(responseData.output){
                        console.info("API Output:", responseData.output);
                    }
                }
                this.loadStatus();
            }
        }catch (e) {
            console.err("Failed toggle visibility:", e);
        }finally {
            this.hideLoader();
        }
    }


    /**
    * start Scan
    * starts the bluetooth scan and renders the found devices
    */
    async startScan() {
        if(this.scanning){
            this.scanning = false;
            this.shadowRoot.querySelector("#startScan").textContent = "🔍 Scan";
            this.shadowRoot.querySelector("#deviceListTitle").textContent = "Gekoppelte Geräte";
            this.loadPairedDevices();
            return;
        }
        this.scanning = true;
        this.shadowRoot.querySelector("#startScan").textContent = "Scan abbrechen";
        this.showLoader();
        
        try{
            const res = await fetch("/api/bluetooth/scan", { method: "POST" });
            if(!res.ok) throw new Error("Scan Error");
            const devices = await res.json();

            if(this.scanning){
                this.renderDevices(devices, "found");
            }
        } catch (err) {
            console.error("Scan Error: ", err);
            this.scanning = false;
            this.shadowRoot.querySelector("#startScan").textContent = "🔍 Scan";
            this.shadowRoot.querySelector("#deviceListTitle").textContent = "Gekoppelte Geräte";
            this.loadPairedDevices();
        }finally {
            this.hideLoader();
        }
    }


    /**
    * render Devices
    * @param devices: list of the found devices {address, name}
    * @param mode = "paired": type of the lists -> for onclick actions
    * the function creates a container for every device (name / address, button)
    */
    renderDevices(devices, mode = "paired") {
        const list = this.shadowRoot.querySelector("#deviceList");
        const title = this.shadowRoot.querySelector("#deviceListTitle");

        title.textContent = mode === "found" ? "Gefundene Geräte" : "Gekoppelte Geräte";
        list.innerHTML = "";

        if (devices.length === 0) {
            list.innerHTML = `<div style="opacity: 0.6;">Keine Geräte gefunden</div>`;
            return;
        }

        devices.forEach(element => {
            const entry = document.createElement("div");
            entry.className = "device-entry";
            entry.innerHTML = `
                <span>${element.name || element.address} </span>
                <div>
                    <button data-action="${mode === "found" ? "pair" : "connect"}" data-address="${element.address}">
                    ${mode === "found" ? "Pair" : "Verbinden"}
                    </button>
                    ${mode === "paired" ? `<button data-action="remove" data-address="${element.address}">❌</button>` : ""}
                </div>
            `;
            list.appendChild(entry);
        });
    }


    /**
    * setup Listeners
    * initial setup of the button listeners
    */
    setupListeners() {
        const root = this.shadowRoot;

        root.querySelector("#togglePower").addEventListener("click", () => this.togglePower());
        root.querySelector("#toggleVisibility").addEventListener("click", () => this.toggleVisibility());
        root.querySelector("#startScan").addEventListener("click", () => this.startScan());

        root.querySelector("#deviceList").addEventListener("click", (e) => {
            const target = e.target;
            if (!target.matches("button[data-action]")) return;

            const action = target.dataset.action;
            const address = target.dataset.address;

            this.handleDeviceAction(action, address);
        });
    }


    /**
    * handle Device Action
    * onclick action when a device gets clicked
    * @param action: the type of action <connect, pair, remove>
    * @param address: the device address for the action
     */
    async handleDeviceAction(action, address){
        const endpointMap = {
            connect: "/api/bluetooth/device/connect",
            pair: "/api/bluetooth/device/pair",
            remove: "/api/bluetooth/device/remove"
        };
        if(!endpointMap[action]) return;

        this.showLoader();

        await fetch(endpointMap[action], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address })
        });

        if(["remove", "pair", "connect"].includes(action)) this.loadPairedDevices();
        this.hideLoader();
    }


    /**
     * load Paried Devices
     * reads the paired devicelist and calls the renderDevice function
     */
    async loadPairedDevices() {
        this.showLoader();
        try {
            const res = await fetch("/api/bluetooth/paired");
            if(!res.ok){
                throw new Error("Loading paired device failure");
            }
            const devices = await res.json();
            this.renderDevices(devices, "paired");
        }catch (e){
            console.error("Paired List Error:", e);
        }finally {
            this.hideLoader();
        }
    }




  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
              all: initial;
            --color-bg-start: #757882ff;
            --color-bg-end: #111827;
            --color-border: rgba(97, 218, 251, 0.15);
            --color-text: #ffffffff;
            --color-heading: #c2c3d2ff;
            --color-button-bg: linear-gradient(145deg, #1B2A40, #152233);
            --color-button-hover: #24344E;
            --color-button-border: #2C3E50;
            --color-button-border-hover: #075270ff;
            --color-button-shadow: rgba(97, 218, 251, 0.2);
            --color-device-bg: rgba(25, 34, 50, 0.9);
            --color-device-hover: rgba(40, 55, 80, 0.9);
            --color-device-button: #2B3E59;
            --color-device-button-hover: #3C577A;
            --color-scrollbar-thumb: #3C4A5A;
        }

        .bt-widget {
            position: relative;
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, var(--color-bg-start), var(--color-bg-end));
            border: 1px solid var(--color-border);
            color: var(--color-text);
            border-radius: 16px;
            padding: 1.5em;
            width: 320px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(6px);
        }

        h3 {
            margin-top: 0;
            margin-bottom: 0.7em;
            font-size: 1.3em;
            color: var(--color-heading);
            letter-spacing: 0.5px;
            text-align: left;
        }

        .status-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.2em;
            gap: 0.6em;
        }

        .device-name {
            display: inline-block;
            max-width: 120px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            vertical-align: bottom;
            position: relative;
        }
        .device-name.scroll {
            animation: scrollText 8s linear infinite;
        }

        @keyframes scrollText {
            0% { transform: translateX(0); }
            30% { transform: translateX(x); }
            50% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
        }


        .actions {
            display: flex;
            gap: 0.6em;
            margin-bottom: 1.2em;
        }

        button {
            flex: 1;
            background: var(--color-button-bg);
            color: var(--color-text);
            border: 1px solid var(--color-button-border);
            padding: 0.55em 0.9em;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.25s ease;
            font-size: 0.95em;
        }

        button:hover {
            background: var(--color-button-hover);
            border-color: var(--color-button-border-hover);
            box-shadow: 0 0 8px var(--color-button-shadow);
        }

        button:active {
              transform: scale(0.97);
        }

        .device-section h4 {
            margin-bottom: 0.5em;
            color: var(--color-heading);
            font-size: 1.1em;
        }

        .device-list {
            max-height: 200px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.7em;
        }

        .device-entry {
            background: var(--color-device-bg);
            padding: 0.7em;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.95em;
            border: 1px solid var(--color-border);
            transition: background 0.3s;
        }

        .device-entry:hover {
              background: var(--color-device-hover);
        }

        .device-entry button {
            margin-left: 0.6em;
            padding: 0.35em 0.7em;
            font-size: 0.85em;
            background: var(--color-device-button);
            border: none;
            border-radius: 6px;
            transition: background 0.2s;
        }

        .device-entry button:hover {
            background: var(--color-device-button-hover);
        }

        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--color-scrollbar-thumb);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

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
      </style>

      <div class="bt-widget">
        <header>
          <h3>Bluetooth Einstellungen</h3>
          <div class="status-controls">
            <button id="togglePower">An/Aus</button>
            <div id="btStatus">Lade...</div>
          </div>
        </header>

        <section class="actions">
          <button id="startScan">🔍 Scan</button>
          <button id="toggleVisibility">👁 Sichtbarkeit</button>
        </section>

        <section class="device-section">
          <h4 id="deviceListTitle">Gekoppelte Geräte</h4>
          <div class="device-list" id="deviceList">
            <!-- Geräte -->
          </div>
        </section>

        <div id="loader" class="loader hidden"></div>
      </div>
    `;
  }
}

customElements.define("bt-setup-widget", BtSetupWidget);
