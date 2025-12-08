//code/widgets/volume_sidebar.js

import { emitVolumeChange, listenVolumeChange } from "../utils/volumeEvents.js";

class VolumeSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/system/volume";

        this.volumeApis = {
            get: `${this.apiPath}/get`,
            set: `${this.apiPath}/set`,
        };
        this.volume = 10;
        this.isMuted = false;
        this.lastVolume = this.volume;
    }


    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.initWidget();

        listenVolumeChange(({volume, muted}) => {
            if(volume !== this.volume || muted !== this.isMuted) {
                this.volume = volume;
                this.isMuted = muted;
                this.updateDisplay();
            }
        });

        this.shadowRoot.querySelector("#btnUp").addEventListener("click", () => this.adjustVolume(5));
        this.shadowRoot.querySelector("#btnDown").addEventListener("click", () => this.adjustVolume(-5));
        this.shadowRoot.querySelector("#btnMute").addEventListener("click", () => {this.adjustVolume(0, true)});
    }


    /**
     * init Widget
     * inits the widget based on the system volume
     */
    async initWidget() {
        const data = await this.get();
        if (data && data.volume !== undefined) {
            this.volume = data.volume;
            this.updateDisplay();
        }
    }


    /**
     * get
     * returns null of the system volume [0-100]
     */
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


    /**
     * set
     * sets the volume of the system to the given value
     */
    async set(volume) {
        try {
            const res = await fetch(this.volumeApis.set, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volume: Number(volume) })
            });

            if (!res.ok) throw new Error("API set failed");

            this.volume = volume;
            this.updateDisplay();
            emitVolumeChange(this.volume, this.isMuted);
        } catch (error) {
            console.error(`Failed to update Volume: ${error}`);
        }
    }


    /**
     * adjust volume
     * updates the volume based on the delta value
     */
    adjustVolume(delta, mute = false) {
        if(mute){
            if(!this.isMuted){
                this.lastVolume = this.volume > 0 ? this.volume : this.lastVolume;
                this.set(0);
                this.isMuted = true;
            }else {
                this.set(this.lastVolume);
                this.isMuted = false;
            }
            this.updateDisplay();
            return;
        }
        const newVolume = Math.min(100, Math.max(0, this.volume + delta));
        this.set(newVolume);
        this.isMuted = (newVolume === 0);
        this.updateDisplay();
    }


    /**
     * update Display
     * update of the UI
     */
    updateDisplay() {
        const display = this.shadowRoot.querySelector("#volumeValue");
        if (display) {
            display.textContent = `${this.volume}%`;
        }

        const muteBtn = this.shadowRoot.querySelector("#btnMute");
        if(muteBtn){
            if(this.isMuted){
                muteBtn.style.background = "linear-gradient(145deg, #4092bb, #061d3fff)";
            }else {
                muteBtn.style.background = "linear-gradient(145deg, #4092bb, #3f0606ff)";
            }
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
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .volume-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                    padding: 1rem 0;
                    box-sizing: border-box;
                }

                .volume-button {
                    width: 80%;
                    height: 70px;
                    margin: 0.5rem 0;
                    font-size: 24px;
                    font-weight: bold;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(145deg, #4092bb, #061d3fff);
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }

                .volume-button:active {
                    transform: scale(0.95);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
                }

                .volume-button:hover {
                    width: 82%;
                }

                .volume-button img {
                    width: 35px;
                    background: none;
                }

                .volume-value {
                    margin-top: 0.5rem;
                    font-size: 18px;
                    color: #fff;
                    font-weight: 500;
                    width: 50%;
                    text-align: center;
                    background: #05202b;
                    padding: 5px;
                    border-radius: 32px;
                }
            </style>
        `;

        const html = `
            <div class="volume-container">
                <div class="volume-value" id="volumeValue">0%</div>
                <button class="volume-button" id="btnUp">
                    <img src="../static/media/volume_up.svg" alt="+">
                </button>
                <button class="volume-button" id="btnDown">
                    <img src="../static/media/volume_down.svg" alt="-">
                </button>
                <button class="volume-button" id="btnMute">
                    <img src="../static/media/volume_none.svg" alt="/">
                </button>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("volume-sidebar", VolumeSidebar);
