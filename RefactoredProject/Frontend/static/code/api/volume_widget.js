//code/api/volume_widget.js
class VolumeWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000";

        this.volumeApis = {
            get: `${this.apiPath}/get`,
            set: `${this.apiPath}/set`,
        };
    }


    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.initWidget();

        this.shadowRoot.querySelector("#volumeSlider")
            .addEventListener("input", () => this.set());
    }


    /**
     * init Widget
     * inits the slider value
     */
    async initWidget() {
        const data = await this.get();

        let volume = 10;
        if (data && data.volume !== undefined) {
            volume = data.volume;
        }

        this.shadowRoot.querySelector("#volumeSlider").value = volume;
    }



    /**
     * get
     * calls the get api to read the volume value
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
     * reads the slider value und tries to set the volume value
     */
    async set() {
        try {
            const newValue = this.shadowRoot.querySelector("#volumeSlider").value;
            await fetch(this.volumeApis.set, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volume: Number(newValue) })
            });
        } catch (error) {
            console.error(`Failed to update Volume: ${error}`);
        }
    }


    /**
     * render
     * setup of html and css
     */
    render() {
        const style = `
            <style>
                .volume-container {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 5%;
                    height: 69vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    border-bottom: 1px solid black;
                }
                
                .volume-slider {
                    width: 100%;
                    height: 66vh;
                    display: flex;
                    justify-content: center;
                    padding: 20px 0;
                }
                
                input[type="range"] {
                    -webkit-appearance: slider-vertical;
                    width: 40px;
                    height: 100%;
                    padding: 0 10px;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 30px;
                    height: 30px;
                    background: url("../static/media/volume_thumb.svg") no-repeat center;
                    background-size: contain;
                    border: none;
                    cursor: pointer;
                }
                
            </style>
        `;

        const html = `
            <div class="volume-container">
                <div class="volume-slider">
                    <input type="range" id="volumeSlider" min="0" max="100" step="2" orient="vertical" value=0>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("volume-widget", VolumeWidget);
