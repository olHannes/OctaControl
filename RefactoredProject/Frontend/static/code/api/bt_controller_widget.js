// code/api/bt_controller_widget.js

class BtSetupWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.scanning = false;

        this.apiPath = "http://127.0.0.1:5000";

        this.bluetoothApis = {
            "power": `${this.apiPath}/api/bluetooth/setup/power`,
            "scan": `${this.apiPath}/api/bluetooth/setup/scan`,
            "visibility": `${this.apiPath}/api/bluetooth/setup/visibility`,
            "paired_devices": `${this.apiPath}/api/bluetooth/setup/paired_devices`,
            "pair": `${this.apiPath}/api/bluetooth/setup/pair`,
            "connect": `${this.apiPath}/api/bluetooth/setup/connect`,
            "disconnect": `${this.apiPath}/api/bluetooth/setup/disconnect`,
            "remove": `${this.apiPath}/api/bluetooth/setup/remove`,
            "status": `${this.apiPath}/api/bluetooth/setup/status`
        };
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
        this.setupListeners();
        this.loadStatus();
        this.loadPairedDevices();
    }


    /**
     * show Status Loader
     */
    showStatusLoader() {
        this.shadowRoot.querySelector("#statusLoader").classList.remove("hidden");
        this.shadowRoot.querySelector("#connectedDevice").style.opacity = "0.5";
    }


    /**
     * hide Status Loader
     */
    hideStatusLoader() {
        this.shadowRoot.querySelector("#statusLoader").classList.add("hidden");
        this.shadowRoot.querySelector("#connectedDevice").style.opacity = "1";
    }


    /**
     * show List Loader
     */
    showListLoader() {
        this.shadowRoot.querySelector("#listLoader").classList.remove("hidden");
    }


    /**
     * hide List Loader
     */
    hideListLoader() {
        this.shadowRoot.querySelector("#listLoader").classList.add("hidden");
    }


    /**
     * show Notification
     * @param message: text that will be shown
     * @param type: "success" or "error" -> style feature
     * @param timeout: timeout in milliseconds
     */
    showNotification(message, type = "success", timeout = 3000) {
        const el = this.shadowRoot.querySelector("#notification");
        el.textContent = message;

        el.classList.remove("success", "error", "info", "show");

        el.classList.add("notification", type);

        requestAnimationFrame(() => {
            el.classList.add("show");
        });

        if(timeout){
            clearTimeout(this._notifTimer);
            this._notifTimer = setTimeout(() => this.hideNotification(), timeout);
        }
    }


    /**
     * hide Notification
     * hides a notification after a timeout
     */
    hideNotification() {
        const el = this.shadowRoot.querySelector("#notification");
        el.classList.remove("show");
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
            const res = await fetch(`${this.bluetoothApis.status}`);
            if(!res.ok) throw new Error("Serverfehler")
            const data = await res.json();

            if(returnValue == true) return data;

            //Power Status
            const powerStatus = data.powered === "yes" ? "EIN" : "AUS";
            const newPowerStatus = powerStatus === "EIN" ? "AUS" : "EIN";
            const pTxtColor = newPowerStatus === "AUS" ? "red" : "green";
            const btToggleBtn = this.shadowRoot.querySelector("#togglePower");
            btToggleBtn.innerHTML = "Blutooth " + `<p style="color: ${pTxtColor}; margin: 0;">${newPowerStatus}</p>`;

            //Discoverable Status
            const discoverableStatus = data.discoverable === "yes" ? "EIN" : "AUS";
            const newDiscoverableStatus = discoverableStatus === "EIN" ? "AUS" : "EIN";
            const txtColor = newDiscoverableStatus === "AUS" ? "red" : "green";
            const discoverableBtn = this.shadowRoot.querySelector("#toggleVisibility");
            discoverableBtn.innerHTML = "Sichtbarkeit " + `<p style="color: ${txtColor}; margin: 0;">${newDiscoverableStatus}</p>`;
            
            //Connected Device
            const connectedDev = data.connected_device;
            const connectedDevTag = this.shadowRoot.querySelector("#connectedDevice");
            if(connectedDev && connectedDev !== "Unbekannt" && connectedDev.address){
                connectedDevTag.innerHTML = `
                Verbundenes Gerät: <i>${connectedDev.name}</i> - <i>${connectedDev.address}</i>`;
            } else {
                connectedDevTag.innerHTML = `Verbundenes Gerät: -`;
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
        this.showStatusLoader();
        this.showListLoader();
        try {
            const stat = await this.loadStatus(true);
            if(!stat || !stat.powered) throw new Error("Failed toggle Bluetooth");
            const current = stat.powered;
            const newState = current == "yes" ? "off" : "on";

            const res = await fetch(`${this.bluetoothApis.power}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: newState })
            });
            if(!res.ok) throw new Error("Failed to toggle Bluetooth");

            this.loadStatus();
            this.showNotification(`Bluetooth konnte erfolgreich '${newState}' geschaltet werden.`, "success");
        }catch (error){
            console.error("Failure while toggle Bluetooth power: ", error);
            this.showNotification(`Bluetooth konnte nicht geschaltet werden!`, "error");
        }finally {
            this.hideStatusLoader();
            this.hideListLoader();
        }
    }


    /**
    * toggle Visibility
    * reads the current status and toggles the visibility of the bluetooth device
    * relaods the ui-status
    */
    async toggleVisibility() {
        this.showStatusLoader();
        const current = await this.loadStatus(true);
        if(!current) {
            console.error("failed toggle visibility: status was undefined");
            this.showNotification(`Sichtbarkeit konnte nicht geändert werden!`, "error");
            this.hideStatusLoader();
        }
        const newVisibility = current.discoverable === "yes" ? "off" : "on";

        try{
            const res = await fetch(`${this.bluetoothApis.visibility}`, {
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
                this.showNotification(`Sichtbarkeit konnte erfolgreich '${newVisibility}' geschaltet werden.`, "success");
                if(newVisibility == "off"){
                    this.loadPairedDevices();
                }
            }
        }catch (error) {
            console.error("Failed toggle visibility:", error);
            this.showNotification(`Fehler beim ändern der Sichtbarkeit auf '${newVisibility}'`);
        }finally {
            this.hideStatusLoader();
        }
    }


    /**
    * start Scan
    * starts the bluetooth scan and renders the found devices
    */
    async startScan() {
        if(this.scanning){
            this.scanning = false;
            this.shadowRoot.querySelector("#startScan").textContent = "Scan";
            this.shadowRoot.querySelector("#deviceListTitle").textContent = "Gekoppelte Geräte";
            this.loadPairedDevices();
            return;
        }
        this.scanning = true;
        this.shadowRoot.querySelector("#startScan").textContent = "Gekoppelte Geräte";
        this.showListLoader();
        try{
            const res = await fetch(`${this.bluetoothApis.scan}`, { method: "POST" });
            if(!res.ok) throw new Error("Scan Error");
            const devices = await res.json();

            if(this.scanning){
                this.renderDevices(devices, "found");
            }
            this.showNotification("Scan wurde erfolgreich ausgeführt", "success");
        } catch (error) {
            console.error("Scan Error: ", error);
            this.scanning = false;
            this.shadowRoot.querySelector("#startScan").textContent = "Scan";
            this.shadowRoot.querySelector("#deviceListTitle").textContent = "Gekoppelte Geräte";
            this.loadPairedDevices();
            this.showNotification("Scan konnte nicht erfolgreich ausgeführt werden!", "error");
        }finally {
            this.hideListLoader();
        }
    }

    
    /**
     * load Paried Devices
     * reads the paired devicelist and calls the renderDevice function
     */
    async loadPairedDevices() {
        this.showListLoader();
        try {
            const res = await fetch(`${this.bluetoothApis.paired_devices}`);
            if(!res.ok) throw new Error("Loading paired device failure");
            const devices = await res.json().paired_devices;

            this.renderDevices(devices, "paired");
            this.showNotification("Gekoppelte Geräte wurden erfolgreich abgerufen.", "success");
        }catch (error){
            console.error("Paired List Error:", error);
            this.showNotification(`Die gekoppelten Geräte konnten nicht geladen werden!`, "error");
        }finally {
            this.hideListLoader();
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

        if (!Array.isArray(devices) || devices.length === 0) {
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
    * handle Device Action
    * onclick action when a device gets clicked
    * @param action: the type of action <connect, pair, remove>
    * @param address: the device address for the action
     */
    async handleDeviceAction(action, address){
        const endpointMap = {
            connect: `${this.bluetoothApis.connect}`,
            pair: `${this.bluetoothApis.pair}`,
            remove: `${this.bluetoothApis.remove}`,
        };
        if(!endpointMap[action]) return;

        this.showListLoader();
        this.showStatusLoader();
        try {
            const res = await fetch(endpointMap[action], {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address })
            });
            if(!res.ok) throw new Error(`Failed to ${action} - ${address}`);

            if(action === "pair") this.startScan();
            else if(action === "remove" || action === "connect") this.loadPairedDevices();
            this.showNotification(`'${action}' wurde erfolgreich ausgeführt.`, "success");
        } catch (error) {
            console.error(`Fehler bei deviceAction: ${error}`);
            this.showNotification(`'${action}' konnte nicht ausgeführt werden!`, "error");
        } finally {
            this.hideListLoader();
            this.hideStatusLoader();
        }
    }


    /**
     * disconnect Device
     * tries to disconnect a given device
     */
    async disconnectDevice(address){
        if(!address) return;

        try{
            this.showStatusLoader();
            const res = await fetch(`${this.bluetoothApis.disconnect}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address })
            });
            if(!res.ok) throw new Error("Failed to disconnect to device");
            this.loadStatus();
        }catch (error){
            this.showNotification(`Verbindung zu '${address}' konnte nicht getrennt werden!`, "error");
            console.error(`Failed to disconnect: ${error}`);
        }finally{
            this.hideStatusLoader();
        }
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
     * render
     * handles all html and style attributes 
    */
    render() {
        const pStyle = `
            <style>
            :host {
                all: initial;
                --color-bg-start: #757882ff;
                --color-bg-end: #111827;
                --color-border: rgba(97, 218, 251, 0.15);
                --color-text: #ffffffff;
                --color-heading: #b0b0b0;
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

                display: block;
                width: 100%;
                margin: 0 auto;
            }

            .bt-widget {
                position: relative;
                font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(333deg, var(--color-bg-start), var(--color-bg-end));
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: 16px;
                padding: 1.5em;
                width: 100%;
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

            #actions {
                display: flex;
                justify-content: space-around;
            }

            .device-section h4 {
                margin-bottom: 0.5em;
                color: var(--color-heading);
                font-size: 1.1em;
            }


            #deviceList {
                max-height: 215px;
                min-height: 50px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 0.1em;
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

            h3 {
                margin: 0;
                font-size: 1.3em;
                color: var(--color-heading);
            }

            #notification {
                position: relative;
                padding: 0.3rem 0.3rem;
                margin-bottom: 0.5rem;
                border-radius: 6px;
                font-size: 0.9rem;
                opacity: 0;
                transform: translateY(-10px);
                pointer-events: none;
                transition: opacity 0.4s ease, transform 0.4s ease;
                min-height: 1.5rem;
            }

            #notification.show {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            #notification.success {
                background: #2ecc71;
                color: white;
                box-shadow: 0 2px 6px rgba(46, 204, 113, 0.4);
            }

            #notification.error {
                background: #e74c3c;
                color: white;
                box-shadow: 0 2px 6px rgba(231, 76, 60, 0.4);
            }

            #notification.info {
                background: #3498db;
                color: white;
                box-shadow: 0 2px 6px rgba(52, 152, 219, 0.4);
            }

            .status-controls {
                margin-top: 1em;
            }

            #statusContainer {
                margin-top: 0.5em;
                margin-bottom: 12px;
                font-size: 0.9em;
                color: var(--color-text);
                border: 1px solid var(--color-border);
                border-radius: 8px;
                padding: 0.6em;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #statusLoader {
                position: absolute;
                top: 15px;
                right: 15px;
            }

            #listLoader {
                position: absolute;
                left: 87%;
                top: 38%;
            }

            .loader {
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top: 4px solid #61dafb;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                animation: spin 1s linear infinite;
            }

            .hidden { display: none; }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>`;

        const pHTML = `
            <div class="bt-widget">
                <h3>Bluetooth Einstellungen</h3>
                
                <div id="notification" class="notification"></div>
        
                <div id="statusContainer">
                    <div id="statusLoader" class="loader hidden"></div>
                    <span id="connectedDevice">Verbundenes Gerät: -</span>
                </div>

                <div id="actions">
                    <button id="togglePower">An/Aus</button>
                    <button id="toggleVisibility">Sichtbarkeit</button>
                    <button id="startScan">Scan</button>
                </div>

                <div id="device-section">
                    <h4 id="deviceListTitle">Gekoppelte Geräte</h4>
                    <div id="listLoader" class="loader hidden"></div>
                    <div id="deviceList"></div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
  }
}

customElements.define("bt-setup-widget", BtSetupWidget);
