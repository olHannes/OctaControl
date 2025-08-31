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
        const expandBtn = this.shadowRoot.querySelector("#expand");

        muteBtn.addEventListener("click", () => this.toggleMute());
        expandBtn.addEventListener("click", () => this.expandWidget());

        const updateFromPointer = (clientY) => {
            const rect = slider.getBoundingClientRect();
            let percent = 1 - (clientY - rect.top) / rect.height;
            percent = Math.max(0, Math.min(1, percent));
            const newVal = Math.round(percent * 100);
            slider.value = newVal;
            this.set(newVal);
        };

        let isDragging = false;

        slider.addEventListener("mousedown", e => {
            isDragging = true;
            updateFromPointer(e.clientY);
        });
        window.addEventListener("mousemove", e => {
            if (isDragging) updateFromPointer(e.clientY);
        });
        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

        slider.addEventListener("touchstart", e => {
            isDragging = true;
            updateFromPointer(e.touches[0].clientY);
            e.preventDefault();
        });
        slider.addEventListener("touchmove", e => {
            if (isDragging) {
                updateFromPointer(e.touches[0].clientY);
                e.preventDefault();
            }
        });
        slider.addEventListener("touchend", () => {
            isDragging = false;
        });

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


    expandWidget() {
        const widget = document.querySelector("volume-main");
        const btn = this.shadowRoot.querySelector("#expand");
        const volumeSlider = this.shadowRoot.querySelector("#volumeSlider");
        if(widget.style.width > "300px"){
            widget.style.width = "250px";
            btn.style.transform = "rotate(0deg)";
            volumeSlider.style.left = "-35%";
        }else {
            widget.style.width = "550px";
            btn.style.transform = "rotate(180deg)";
            volumeSlider.style.left = "-15%";
        }
    }


    updateDisplay() {
        const slider = this.shadowRoot.querySelector("#volumeSlider");
        slider.value = this.volume;

        const btn = this.shadowRoot.querySelector("#btnMute");
        const label = this.shadowRoot.querySelector("#volumeValue");

        label.textContent = `${this.volume}%`;

        btn.classList.toggle("muted", this.isMuted);

        if (this.volume > 75) {
            label.style.color = "red";
        } else if (this.volume > 45) {
            label.style.color = "orange";
        } else {
            label.style.color = "green";
        }
    }


    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .volume-widget {
                    height: 100%;
                    width: 100%;
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
                    -webkit-appearance: none;
                    appearance: none;
                    width: 53dvh;
                    height: 40px;
                    rotate: -90deg;
                    position: absolute;
                    bottom: 51%;
                    left: -35%;
                    background: none;
                }

                #volumeSlider::-webkit-slider-runnable-track {
                    height: 15px;
                    backround: none;
                    border-radius: 14px;
                    border: none;
                    background: linear-gradient(90deg, #021609ff, #17a047ff);
                }
                
                #volumeSlider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 6rem;
                    height: 3rem;
                    background: url("../static/media/slider_thumb.png") no-repeat center center;
                    background-size: contain;
                    border: 0;
                    border-radius: 10px;
                    margin-top: -1.4rem;
                    margin-top: calc((15px - 3rem) / 2);
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
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

                .expand {
                    position: absolute;
                    top: 50%;
                    right: 5px;
                    height: 5rem;
                    transform: translateY(-50%);
                    opacity: 0.02;
                }

            </style>

            <div class="volume-widget">
                <h2>Lautstärke</h2>
                <div class="volume-content">
                    <img class="expand" id="expand" src="../static/media/expand_arrow.svg" alt"expand"></img>
                    <input type="range" min="0" max="100" value="0" step="2" id="volumeSlider"/>
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
