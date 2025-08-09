// code/api/wifi_controller_widget.js

class WifiSetupWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }


    demoNetworks = {
            networks: [
                { ssid: "TestNetzwerk1", signal: 75, known: false },
                { ssid: "Hausnetz", signal: 90, known: true },
                { ssid: "Gastnetzwerk", signal: 55, known: false },
                { ssid: "CafeWiFi", signal: 35, known: true },
                { ssid: "Test0", signal: 35, known: true },
                { ssid: "Test1", signal: 10, known: false },
                { ssid: "Test2", signal: 5, known: true },
                { ssid: "Test3", signal: 100, known: true },
                { ssid: "Unbekanntes", signal: 20, known: false }
            ]
        };


    /**
     * Initial function
     * -> renders the content
     */
    connectedCallback() {
        this.render();
        this.setupListeners();
        this.known();
        this.status();
    }


    /**
     * show Loader
     * Shows a Loading animation
     */
    showLoader(type = "global") {
        const el = this.shadowRoot.querySelector(`#${type}Loader`);
        if (el) el.classList.remove("hidden");

        this.setButtonsDisabled(true);
    }


    /**
     * hide Loader
     * Hides a Loading animation
     */
    hideLoader(type = "global") {
        const el = this.shadowRoot.querySelector(`#${type}Loader`);
        if (el) el.classList.add("hidden");

        this.setButtonsDisabled(false);
    }

    /**
     * set Buttons disabled
     * disables all the buttons when a api is active
     */
    setButtonsDisabled(disabled) {
        const root = this.shadowRoot;
        root.querySelectorAll("button").forEach(btn => {
            btn.disabled = disabled;
        });
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
        el.className = `show ${type}`;
        
        if (timeout) {
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
     * signalColor
     * returns a color based on the signal strength
     */
    getSignalColor(signal) {
        if(typeof signal !== "number") return "gray";
        if (signal >= 80) return "green";
        if (signal >= 50) return "gold";
        return "red";
    }


    /**
     * status
     * calls the api to get the current wifi status.
     * the function updates the panel and changes the power button
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
            
            const root = this.shadowRoot;

            const toggleBtn = root.querySelector("#toggleBtn");
            if (state === "on") {
                toggleBtn.textContent = "WLAN deaktivieren";
                toggleBtn.classList.add("on");
                toggleBtn.classList.remove("off");
            } else {
                toggleBtn.textContent = "WLAN aktivieren";
                toggleBtn.classList.add("off");
                toggleBtn.classList.remove("on");
            }

            const disconnectBtn = root.querySelector("#disconnectBtn");
            
            if (status === "connected") {
                name = data.name;
                ip = data.ip;
                signal = data.signal;
                disconnectBtn.classList.remove("hidden");
                disconnectBtn.onclick = () => this.disconnect(name);
            } else {
                disconnectBtn.classList.add("hidden");
                disconnectBtn.onclick = null;
            }

            root.querySelector("#statusName").textContent = `Verbunden mit: ${name}`;
            root.querySelector("#statusIp").innerHTML = `IP: <i>${ip}</i>`;
            const statSignal = root.querySelector("#statusSignal");
            statSignal.textContent = `Signal: ${signal}`;
            statSignal.style.color = this.getSignalColor(signal);

            return data;
        } catch (error) {
            console.error("Failed to load status", error);
            this.showNotification("Fehler beim Status laden!", "error");
        }
    }


    /**
     * toggle Wifi
     * updates the status and toggles the wifi (on / off) based on the current state
     */
    async toggleWifi() {
        this.showLoader("status");
        this.showLoader("list");
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
            this.showNotification(`Wlan konnte nicht '${newState}' geschaltet werden!`, "error");
            console.error("Failed to toggle WLAN:", error);
        } finally {
            this.hideLoader("status");
            this.hideLoader("list");
        }
    }


    /**
     * scan
     * gets a list of scanned and available wifis
     */
    async scan(){
        this.showLoader("list");
        try {
            const res = await fetch("/api/wifi/scan", { method: "GET" });
            if(!res.ok) throw new Error("Failed to scan networks");
            const data = await res.json();

            const networks = data.networks.map(n => ({ ...n, known: false }));
            this.showNotification(`Netzwerke erfolgreich gescannt`, "info");
            this.renderNetwork(networks, true);
        } catch (error) {
            this.showNotification(`Wlan Netzwerke konnten nicht gescannt werden!`, "error");
            console.error("Failed to scan", error);
        } finally {
            this.hideLoader("list");
        }
    }


    /**
     * known
     * gets a list of known and safed networks
     */
    async known(){
        this.showLoader("list");
        try {
            const res = await fetch("/api/wifi/known", { method: "GET" });
            if(!res.ok) throw new Error("Failed to load known networks");

            const data = await res.json();

            this.showNotification(`Gespeicherte Netzwerke erfolgreich abgerufen`, "info");
            const networks = data.networks.map(n => ({ ...n, known: true }));
            this.renderNetwork(networks, false);
        } catch (error) {
            this.showNotification("Bekannte Netzwerke konnten nicht geladen werden!", "error");
            console.error("Failed to load known networks", error);
        } finally {
            this.hideLoader("list");
        }
    }


    /**
     * connect
     * @param ssid: the ssid of the aimed network
     * @param password: a password to connect with the wlan
     */
    async connect(ssid, password){
        this.showLoader("status");
        this.showLoader("list");
        try {
            const res = await fetch("/api/wlan/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ssid, password })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || "Unbekannter Fehler");
            }

            const result = await res.json();
            this.showNotification(`Erfolgreich mit '${ssid}' verbunden.`, "success");
            await this.status();
        } catch (error) {
            this.showNotification(`Es konnte keine Verbindung mit '${ssid}' hergestellt werden!`);
            console.error("Failure while connecting to the network:", error);
        } finally {
            this.hideLoader("status");
            this.hideLoader("list");
        }
    }


    /**
     * disconnect
     * @param ssid: try to disconnect to a given network
     */
    async disconnect(ssid){
        this.showLoader("status");
        this.showLoader("list");
        try {
            const res = await fetch("/api/wlan/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ssid })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || "Unbekannter Fehler");
            } 

            this.showNotification(`Erfolgreich von '${ssid}' getrennt.`, "success");
            await this.status();
        } catch (error) {
            this.showNotification(`Die Verbindung zu '${ssid}' konnte nicht getrennt werden!`, "error");
            console.error("Failure while disconnecting to the network", error);
        } finally {
            this.hideLoader("status");
            this.hideLoader("list");
        }
    }


    /**
     * render Network
     * @param list: a list of found networks (scan or know)
     * @param scanned: false = known networks -> direct connection possible, true = scanned networks - password required
     * The function renders a list of networks with ssid and a button to connect with
     */
    renderNetwork(list, scanned=false){
        const title = this.shadowRoot.querySelector("#networkListTitle");
        title.textContent = scanned? "Gefundene Netzwerke" : "Bekannte Netzwerke";

        const listTag = this.shadowRoot.querySelector("#networkList");
        listTag.innerHTML = "";

        list.forEach(net => {
            const item = document.createElement("div");
            item.classList.add("network-item");

            const name = document.createElement("span");
            name.classList.add("network-name");
            name.textContent = net.ssid || "<Unbekanntes Netzwerk>";

            const actions = document.createElement("div");
            actions.classList.add("network-actions");

            const btn = document.createElement("button");
            btn.textContent = "Verbinden";
            btn.addEventListener("click", () => {
                if(net.known) {
                    this.connect(net.ssid, null);
                }else {
                    this.setupNewConnection(net.ssid, net.signal);
                }
            });

            actions.appendChild(btn);
            item.appendChild(name);
            item.appendChild(actions);
            listTag.append(item);
        });
    }
    

    /**
     * setup new Connection
     * @param ssid: the ssid of the network the user tries to connect with
     * @param signal: the signal strength of the aimed network
     * The function shows a keyboard and the aimed network.
     */
    setupNewConnection(ssid, signal) {
        if (!ssid || !signal) return;
        const root = this.shadowRoot;
        root.querySelector("#connectToSSID").textContent = `SSID: ${ssid}`;
        root.querySelector("#connectToSignal").textContent = `Signal: ${signal}`;
        root.querySelector("#wifiPassword").value = "";
        root.querySelector("#connectToNetwork").classList.add("show");
    }


    /**
     * hide new Connection
     * hides the keyboard and resets the input values
     */
    hideNewConnection(){
        this.shadowRoot.querySelector("#wifiPassword").value = "";
        this.shadowRoot.querySelector("#connectToSSID").textContent = "SSID: -";
        this.shadowRoot.querySelector("#connectToSignal").textContent = "Signal: -";
        this.shadowRoot.querySelector("#connectToNetwork").classList.remove("show");
    }


    /**
     * setup Listeners
     * sets all listeners to the different buttons and to the keyboard
     */
    setupListeners(){
        const root = this.shadowRoot;

        root.querySelector("#scanBtn").addEventListener("click", () => this.scan());
        root.querySelector("#knownBtn").addEventListener("click", () => this.known());
        root.querySelector("#toggleBtn").addEventListener("click", () => this.toggleWifi());

        const passwordInput = this.shadowRoot.querySelector("#wifiPassword");
        let isShift = false;

        this.shadowRoot.querySelectorAll("#keyboard .key").forEach(key => {
            key.addEventListener("click", () => {
                const keyValue = key.textContent;

                if (key.classList.contains("shift")) {
                    isShift = !isShift;
                    key.classList.toggle("active", isShift);
                    toggleShift(isShift);
                    return;
                }

                if (key.classList.contains("backspace")) {
                    passwordInput.value = passwordInput.value.slice(0, -1);
                    return;
                }

                if (key.classList.contains("space")) {
                    passwordInput.value += " ";
                    return;
                }

                if (
                    !key.classList.contains("action-connect") &&
                    !key.classList.contains("action-cancel")
                ) {
                    passwordInput.value += keyValue;
                }
            });
        });

        //toggle shift
        const toggleShift = (shiftOn) => {
            this.shadowRoot.querySelectorAll("#keyboard .key").forEach(k => {
                if (
                    !k.classList.contains("shift") &&
                    !k.classList.contains("backspace") &&
                    !k.classList.contains("space") &&
                    !k.classList.contains("symbol") &&
                    !k.classList.contains("action-connect") &&
                    !k.classList.contains("action-cancel")
                ) {
                    k.textContent = shiftOn
                        ? k.textContent.toUpperCase()
                        : k.textContent.toLowerCase();
                }
            });
        };

        //action: connect
        this.shadowRoot.querySelector(".action-connect").addEventListener("click", () => {
            const ssid = this.shadowRoot.querySelector("#connectToSSID").textContent.replace("SSID: ", "");
            const password = passwordInput.value;
            if (ssid && password) {
                this.connect(ssid, password);
                this.hideNewConnection();
            }
        });

        //action: cancel
        this.shadowRoot.querySelector(".action-cancel").addEventListener("click", () => {
            this.hideNewConnection();
        });
    }


    /**
     * render
     * setup the html and css structure
     */
    render() {
        const pStyle = `
            <style>
                :host {
                    display: block;
                    width: 100%;  
                    max-width: 750px;
                    margin: 0 auto;
                }

                .loader {
                    border: 4px solid rgba(0,0,0,0.1);
                    border-left-color: #09f;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                }

                .hidden {
                    display: none;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
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

                #toggleBtn {
                    padding: 0.5rem 1rem;
                    font-size: 1rem;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: background 0.3s, transform 0.2s;
                    color: #adadad;
                    font-weight: bold;
                }

                #toggleBtn.on {
                    background: #2ecc71; /* Grün */
                    box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
                }

                #toggleBtn.off {
                    background: #e74c3c; /* Rot */
                    box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
                }

                #toggleBtn:hover {
                    transform: scale(1.05);
                }


                #notification {
                    position: relative;
                    padding: 0.6rem 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    opacity: 0;
                    transform: translateY(-10px);
                    pointer-events: none;
                    transition: opacity 0.4s ease, transform 0.4s ease;
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


                .status {
                    position: relative;
                    background: #1b1b22;
                    padding: 0.8rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .status p {
                    margin: 0.2rem 0;
                }
                
                #statusLoader {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                }

                #disconnectBtn {
                    margin-top: 0.5rem;
                    background: #3b1f1f;
                    color: #fff;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 5px;
                    cursor: pointer;
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
                    position: relative;
                    min-height: 30px;
                    max-height: 250px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: #16161d;
                    padding: 0.5rem;
                    border-radius: 8px;
                }
                
                .list h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                    color: #ccc;
                }

                #listLoader {
                    position: absolute;
                    top: 5px;
                    right: 5px;
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

                #connectToNetwork {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(14, 14, 18, 0.95);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 1rem;
                    box-sizing: border-box;
                    z-index: 2000;
                    opacity: 0;
                    pointer-events: none;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }

                #wifiPassword {
                    width: 100%;
                    max-width: 400px;
                    padding: 0.6rem 1rem;
                    font-size: 1.1rem;
                    border-radius: 8px;
                    border: 2px solid #444;
                    background: #1b1b22;
                    color: white;
                    margin-top: 0.5rem;
                    text-align: center;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                #wifiPassword:focus {
                    outline: none;
                    border-color: #61dafb;
                    box-shadow: 0 0 8px rgba(97, 218, 251, 0.5);
                }

                #connectToNetwork.show {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateY(0);
                }

                #keyboard {
                    margin-top: 0.5rem;
                    background: #1a1a20;
                    padding: 0.5rem;
                    border-radius: 8px;
                    display: inline-block;
                    position: relative;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }

                .key-row {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 0.3rem;
                }

                .key {
                    background: #2b3a5e;
                    color: white;
                    border: none;
                    padding: 0.7rem 1.9rem;
                    margin: 0.1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    min-width: 2rem;
                    text-align: center;
                }

                .key:hover {
                    background: #3e5580;
                }

                .key.shift, .key.backspace, .key.space {
                    background: #44475a;
                }

                .key.space {
                    flex: 1;
                    max-width: 150px;
                }

                .key.action-connect {
                    background: #2ecc71; /* Grün */
                }

                .key.action-connect:hover {
                    background: #27ae60;
                }

                .key.action-cancel {
                    background: #e74c3c; /* Rot */
                }

                .key.action-cancel:hover {
                    background: #c0392b;
                }

            </style>
        `;

        const pHTML = `
            <div class="wifi-widget">
                <header>
                    <h3>WLAN-Einstellungen</h3>
                    <button id="toggleBtn">An/Aus</button>
                </header>

                <div id="notification" class="hidden"></div>

                <section class="status">
                    <div id="statusLoader" class="loader hidden"></div>
                    <p id="statusName">Verbunden mit: -</p>
                    <p id="statusIp">IP: -</p>
                    <p id="statusSignal">Signal: -</p>
                    <button id="disconnectBtn" class="hidden">Verbindung trennen</button>
                </section>

                <div class="actions">
                    <button id="scanBtn">Netzwerke scannen</button>
                    <button id="knownBtn">Bekannte Netzwerke</button>
                </div>

                <div class="list">
                    <div id="listLoader" class="loader"></div>

                    <h4 id="networkListTitle">Netzwerke</h4>
                    <div id="networkList"></div>
                </div>

                <div id="connectToNetwork" >
                    <div style="text-align: center;">
                        <span id="connectToSSID">SSID: -</span><br>
                        <span id="connectToSignal">Signal: -</span><br>
                        <input type="text" id="wifiPassword" placeholder="Passwort eingeben">
                    </div>

                    <div id="keyboard">
                        <div class="key-row">
                            <button class="key">1</button><button class="key">2</button><button class="key">3</button>
                            <button class="key">4</button><button class="key">5</button><button class="key">6</button>
                            <button class="key">7</button><button class="key">8</button><button class="key">9</button>
                            <button class="key">0</button>
                        </div>

                        <div class="key-row">
                            <button class="key">q</button><button class="key">w</button><button class="key">e</button>
                            <button class="key">r</button><button class="key">t</button><button class="key">y</button>
                            <button class="key">u</button><button class="key">i</button><button class="key">o</button>
                            <button class="key">p</button>
                        </div>

                        <div class="key-row">
                            <button class="key">a</button><button class="key">s</button><button class="key">d</button>
                            <button class="key">f</button><button class="key">g</button><button class="key">h</button>
                            <button class="key">j</button><button class="key">k</button><button class="key">l</button>
                        </div>

                        <div class="key-row">
                            <button class="key shift">⇧</button>
                            <button class="key">z</button><button class="key">x</button><button class="key">c</button>
                            <button class="key">v</button><button class="key">b</button><button class="key">n</button>
                            <button class="key">m</button>
                            <button class="key backspace">⌫</button>
                        </div>

                        <div class="key-row">
                            <button class="key symbol">!</button><button class="key symbol">@</button>
                            <button class="key symbol">#</button><button class="key symbol">$</button>
                            <button class="key symbol">%</button><button class="key symbol">&</button>
                            <button class="key space">␣</button>
                        </div>
                        <div class="key-row">
                            <button class="key action-connect">Connect</button>
                            <button class="key action-cancel">Abbruch</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
    }
}


customElements.define("wifi-setup-widget", WifiSetupWidget);
