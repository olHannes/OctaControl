//code/widgets/system_widget.js

class SystemWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/system";

        this.systemApis = {
            update: `${this.apiPath}/update`,
            reboot: `${this.apiPath}/reboot`,
            shutdown: `${this.apiPath}/shutdown`,
            version: `${this.apiPath}/version`,
        };

        this.loading = false;
        this.pendingAction = null;
    }

    
    /**
     * connected Callback
     * setup of widget
     */
    connectedCallback() {
        this.render();
        this.initWidget();
    }


    /**
     * init widget
     * calls the version api
     */
    async initWidget(){
        this.setLoading(true);
        try {
            const res = await fetch(this.systemApis.version);
            if(!res.ok) throw new Error("Error while fetching version");

            const data = await res.json();
            const version = data.version ||"n/a";
            const versionTag = this.shadowRoot.querySelector("header p");
            if(versionTag) versionTag.textContent = version;

        } catch (error) {
            console.error("Failed to load version:", error);
            this.showMsg("Versionsfehler", 3000, "red");            
        } finally {
            this.setLoading(false);
        }
    }


    /**
     * set Loading
     * sets the loading state and toggles the loading animation
     */
    setLoading(state) {
        this.loading = state;
        const container = this.shadowRoot.querySelector(".system-widget");
        const loader = this.shadowRoot.querySelector(".loader");

        if (state) {
            container.classList.add("disabled");
        } else {
            container.classList.remove("disabled");
        }

        if (loader) loader.style.display = state ? "inline-block" : "none";
    }


    /**
     * show Confirmation
     * displays the confirmation panel
     */
    showConfirmation(action) {
        this.pendingAction = action;
        const confirmBox = this.shadowRoot.querySelector(".confirm-box");
        confirmBox.style.display = "flex";
    }


    /**
     * hide Confirmation
     * hides the confirmation panel
     */
    hideConfirmation() {
        const confirmBox = this.shadowRoot.querySelector(".confirm-box");
        confirmBox.style.display = "none";
        this.pendingAction = null;
    }


    /**
     * show Msg
     * shows a message for a few seconds
     */
    showMsg(msg, time=3000, color="green"){
        const item = this.shadowRoot.querySelector("#msg");
        item.style.color = color;
        item.innerText = msg;
        setTimeout(()=>{
            this.shadowRoot.querySelector("#msg").innerText = "";
        }, time);
    }


    /**
     * call Api
     * calls the specific api
     */
    async callApi(action) {
        this.hideConfirmation();
        this.setLoading(true);

        try {
            const res = await fetch(this.systemApis[action], { method: "POST" });
            if (!res.ok) throw new Error(`${action} fehlgeschlagen`);
            const data = await res.json();
            this.showMsg(`'${action}' erfolgreich.`)
        } catch (err) {
            console.error(err);
            this.showMsg(`'${action}' fehlgeschlagen!`, 3000, "red");
        } finally {
            this.setLoading(false);
        }
    }


    /**
     * render
     * setup of html and css structure
     */
    render() {
        const style = `
            <style>
                :host {
                    --bg: #0f1724;
                    --accent: #8c99a0;
                    --loader: #e0eaefff;
                    --muted: rgba(255,255,255,0.7);
                    display: block;
                    width: 100%;
                    font-family: Inter, system-ui, sans-serif;
                    position: relative;
                }
                .system-widget {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    height: 100%;
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border-radius: 8px;
                    transition: opacity 0.2s;
                    padding-bottom: 5px;
                }
                .system-widget.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                header {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    padding-left: 10px;
                    padding-right: 10px;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg);
                    color: var(--muted);
                    border: 1px solid var(--accent);
                    padding: 0.6rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .btn:hover {
                    background: var(--accent);
                    color: #000;
                }
                .btn img {
                    width: 1.2rem;
                    height: 1.2rem;
                }
                .loader {
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid var(--loader);
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    display: none;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .confirm-box {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    color: white;
                    padding: 1rem;
                }
                .confirm-actions {
                    display: flex;
                    gap: 1rem;
                }
                .confirm-btn {
                    background: var(--accent);
                    border: none;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .confirm-btn.cancel {
                    background: #f87171;
                }
                .feedback-div {
                    display: flex;
                    justify-content: space-around;
                    flex-direction: column;
                    color: white;
                    text-align: center;
                    font-family: "Courier New", monospace;
                    font-size: 1.0rem;
                }
            </style>
        `;

        const html = `
            <div class="system-widget">
                <header>
                    <h2>Version</h2>
                    <p>--.--.----</p>
                </header>

                <button class="btn" data-action="reload">
                    <img src="../static/media/update.svg" alt="Reload Icon">
                    Reload
                </button>

                <button class="btn" data-action="update">
                    <img src="../static/media/update.svg" alt="Update Icon">
                    Update
                </button>
                
                <button class="btn" data-action="reboot">
                    <img src="../static/media/reboot.svg" alt="Reboot Icon">
                    Reboot
                </button>
                
                <button class="btn" data-action="shutdown">
                    <img src="../static/media/shutdown.svg" alt="Shutdown Icon">
                    Shutdown
                </button>
                
                <div class="feedback-div">
                    <span class="loader"></span>
                    <p id="msg"></p>
                </div>
            </div>

            <div class="confirm-box">
                <div>Bist du sicher?</div>
                <div class="confirm-actions">
                    <button class="confirm-btn proceed">Weiter</button>
                    <button class="confirm-btn cancel">Abbrechen</button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;

        this.shadowRoot.querySelectorAll(".btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.shadowRoot.querySelector("#msg").innerText = "";
                const action = btn.getAttribute("data-action");
                if (action === "update") {
                    this.callApi(action);
                } else if(action === "reload"){
                    window.location.reload();
                } else {
                    this.showConfirmation(action);
                }
            });
        });

        this.shadowRoot.querySelector(".confirm-btn.proceed").addEventListener("click", () => {
            if (this.pendingAction) this.callApi(this.pendingAction);
        });

        this.shadowRoot.querySelector(".confirm-btn.cancel").addEventListener("click", () => {
            this.hideConfirmation();
        });
    }
}

customElements.define("system-widget", SystemWidget);
