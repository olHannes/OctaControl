import { emitVolumeChange, listenVolumeChange } from "../utils/volumeEvents.js";

class VolumeMain extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/system/volume";
        this.volumeApis = { get: `${this.apiPath}/get`, set: `${this.apiPath}/set` };
        this.volume = 10;
        this.isMuted = false;
        this.lastVolume = this.volume;
    }

    connectedCallback() {
        this.render();
        this.initWidget();

        const slider = this.shadowRoot.querySelector("#volumeSlider");
        const muteBtn = this.shadowRoot.querySelector("#btnMute");

        slider.addEventListener("input", e => {
            const val = Number(e.target.value);
            this.set(val);
        });

        muteBtn.addEventListener("click", () => this.toggleMute());

        listenVolumeChange(({ volume, muted }) => {
            this.volume = volume;
            this.isMuted = muted;
            this.updateDisplay();
        });
    }

    async initWidget() {
        const data = await this.get();
        if (data && data.volume !== undefined) {
            this.volume = data.volume;
            this.isMuted = (this.volume === 0);
            this.updateDisplay();
        }
    }

    async get() {
        try {
            const res = await fetch(this.volumeApis.get, { method: "GET" });
            if (!res.ok) throw new Error("Failed to Load Volume");
            return await res.json();
        } catch (error) {
            console.error(`Failed to get Volume: ${error}`);
            return null;
        }
    }

    async set(volume) {
        try {
            const res = await fetch(this.volumeApis.set, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volume })
            });
            if (!res.ok) throw new Error("API failed");

            this.volume = volume;
            this.isMuted = (volume === 0);
            this.updateDisplay();

            emitVolumeChange(this.volume, this.isMuted);

        } catch (e) {
            console.error(e);
        }
    }

    toggleMute() {
        if (!this.isMuted) {
            this.lastVolume = this.volume || 50;
            this.set(0);
        } else {
            this.set(this.lastVolume);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.shadowRoot.querySelector("#volumeSlider").value = this.volume;
        const btn = this.shadowRoot.querySelector("#btnMute");
        const label = this.shadowRoot.querySelector("#volumeValue");
        
        label.textContent = `${this.volume}%`;

        btn.classList.toggle("muted", this.isMuted);

        if(this.volume > 75){
            label.style.color="red";
        }else if(this.volume > 45) {
            label.style.color="orange";
        } else {
            label.style.color="green";
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .volume-widget {
                    height: 100%;
                    width: 100%;
                    max-width: 250px;
                    overflow-x: hidden;
                    position: relative;
                }

                h2 {
                    text-align: center;
                    border-bottom: 1px solid gray;
                }

                .volume-content {
                    display: flex;
                    flex-direction: column;

                    align-items: center;
                    justify-content: space-around;
                }

                #volumeSlider {
                    cursor: none;
                    width: 41dvh;
                    /**rotate: -90deg;
                    position: relative;
                    top: 41dvh;**/
                }

                footer {
                    display: flex;
                    width: 100%;
                    justify-content: space-around;
                    align-items: center;
                    position: absolute;
                    bottom: 10px;
                    border-top: 1px solid gray;
                    padding-top: 5px;
                }

                .value { 
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #333;
                    letter-spacing: 0.5px;
                    margin: 0.5rem 0;
                    padding: 0.25rem 0.75rem;
                    background: #f5f5f5;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                    transition: all 0.2s ease;
                }
                .value:hover {
                    background: #eaeaea;
                }

                button { 
                    padding: 0.5rem 1rem; 
                    border-radius: 0.25rem; 
                    cursor: pointer; 
                    color: red; 
                    border: none; 
                }
                
                button:not(.muted) {
                    background: #f5f5f5;
                    color: red;
                }
                button.muted {
                    background: red;
                    color: #f5f5f5;
                }

            </style>

            <div class="volume-widget">
                <h2>Lautstärke</h2>
                <div class="volume-content">
                    <input type="range" min="0" max="100" value="0" step="2" id="volumeSlider" oninput="this.set(this.value);"/>
                    <footer>
                        <div class="value" id="volumeValue">0%</div>
                        <button id="btnMute">Mute</button>
                    </footer>
                </div>
            </div>
        `;
    }
}

customElements.define("volume-main", VolumeMain);
