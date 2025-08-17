class VolumeWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000/api/system/volume";

        this.volumeApis = {
            get: `${this.apiPath}/get`,
            set: `${this.apiPath}/set`,
        };

        this.volume = 10;
    }

    connectedCallback() {
        this.render();
        this.initWidget();

        this.shadowRoot.querySelector("#btnUp").addEventListener("click", () => this.adjustVolume(5));
        this.shadowRoot.querySelector("#btnDown").addEventListener("click", () => this.adjustVolume(-5));
    }

    async initWidget() {
        const data = await this.get();
        if (data && data.volume !== undefined) {
            this.volume = data.volume;
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
                body: JSON.stringify({ volume: Number(volume) })
            });

            if (!res.ok) throw new Error("API set failed");

            this.volume = volume;
            this.updateDisplay();
        } catch (error) {
            console.error(`Failed to update Volume: ${error}`);
        }
    }

    adjustVolume(delta) {
        const newVolume = Math.min(100, Math.max(0, this.volume + delta));
        this.set(newVolume);
    }

    updateDisplay() {
        const display = this.shadowRoot.querySelector("#volumeValue");
        if (display) {
            display.textContent = `${this.volume}%`;
        }
    }

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
                    width: 48px;
                    height: 60px;
                    margin: 0.5rem 0;
                    font-size: 24px;
                    font-weight: bold;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(145deg, #4092bb, #04152f);
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }

                .volume-button:active {
                    transform: scale(0.95);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
                }

                .volume-value {
                    margin-top: 0.5rem;
                    font-size: 18px;
                    color: #fff;
                    font-weight: 500;
                }
            </style>
        `;

        const html = `
            <div class="volume-container">
                <button class="volume-button" id="btnUp">+</button>
                <button class="volume-button" id="btnDown">−</button>
                <div class="volume-value" id="volumeValue">--%</div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("volume-widget", VolumeWidget);
