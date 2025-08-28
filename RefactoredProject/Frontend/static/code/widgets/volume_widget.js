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

        // 🔄 zuhören auf Events anderer Widgets
        listenVolumeChange(({volume, muted}) => {
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
            const data = await res.json();
            return data;
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
            this.lastVolume = this.volume || 10;
            this.set(0);
        } else {
            this.set(this.lastVolume);
        }
    }

    updateDisplay() {
        this.shadowRoot.querySelector("#volumeSlider").value = this.volume;
        this.shadowRoot.querySelector("#volumeValue").textContent = `${this.volume}%`;
        this.shadowRoot.querySelector("#btnMute").style.background =
            this.isMuted ? "red" : "green";
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                }
                #volumeSlider {
                    writing-mode: bt-lr; /* vertikal */
                    transform: rotate(270deg);
                    width: 200px;
                    height: 50px;
                }
                .value { margin: 1rem; color:white; }
                button { padding:0.5rem 1rem; }
            </style>
            <div class="container">
                <input type="range" min="0" max="100" value="0" id="volumeSlider"/>
                <div class="value" id="volumeValue">0%</div>
                <button id="btnMute">Mute</button>
            </div>
        `;
    }
}

customElements.define("volume-main", VolumeMain);
