//code/widgets/settings/display_widget.js
import { save, load } from "../../utils/storage_handler.js";

class DisplaySettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.contrast = 1;
        this.brightness = 1;

        this.brightnessSlider = null;
        this.contrastSlider = null;
        this.saturation = null;
        this.grayscale = null;
    }


    /**
     * connected callback
     * setup of html, items and starts the loop 
     */
    connectedCallback() {
        this.render();
        this.initWidget();
    }


    /**
     * init widget
     * setup listeners and initial values
     */
    initWidget(){
        this.brightnessSlider = this.shadowRoot.querySelector("#brightnessSlider");
        this.contrastSlider = this.shadowRoot.querySelector("#contrastSlider");
        this.saturationSlider = this.shadowRoot.querySelector("#saturationSlider");
        this.grayscaleSlider = this.shadowRoot.querySelector("#grayscaleSlider");

        const savedBrightness = load("BRIGHTNESS") ?? 1;
        const savedContrast = load("CONTRAST") ?? 1;
        const savedSaturation = load("SATURATION") ?? 1;
        const savedGrayscale = load("GRAYSCALE") ?? 1;

        this.brightnessSlider.value = savedBrightness;
        this.contrastSlider.value = savedContrast;
        this.saturationSlider.value = savedSaturation;
        this.grayscaleSlider.value = savedGrayscale;  
        
        this.updateStyle("brightness", savedBrightness);
        this.updateStyle("contrast", savedContrast);
        this.updateStyle("saturation", savedSaturation);
        this.updateStyle("grayscale", savedGrayscale);

        this.brightnessSlider.addEventListener("input", (e) => {
            this.updateStyle("brightness", e.target.value);
        });

        this.contrastSlider.addEventListener("input", (e) => {
            this.updateStyle("contrast", e.target.value);
        })

        this.saturationSlider.addEventListener("input", (e) => {
            this.updateStyle("saturation", e.target.value);
        })

        this.grayscaleSlider.addEventListener("input", (e) => {
            this.updateStyle("grayscale", e.target.value);
        })

        this.shadowRoot.querySelector("#reset").addEventListener("click", () => {
            this.reset();
        })
    }


    /**
     * update Style
     * sets the value to the global css-variable
     * saves the value into local storage
     */
    updateStyle(type, value){
        if(type==="brightness"){
            this.brightness = value;
            document.documentElement.style.setProperty("--global-brightness", value);
            save("BRIGHTNESS", value);
        }else if (type==="contrast"){
            this.contrast = value;
            document.documentElement.style.setProperty("--global-contrast", value);
            save("CONTRAST", value);
        }else if (type==="saturation"){
            this.saturation = value;
            document.documentElement.style.setProperty("--global-saturation", value);
            save("SATURATION", value);
        }else if (type==="grayscale"){
            this.grayscale = value;
            document.documentElement.style.setProperty("--global-grayscale", value),
            save("GRAYSCALE", value);
        }
    }


    /**
     * reset
     * resets both values to 1
     */
    reset(){
        this.updateStyle("brightness", 1);
        this.updateStyle("contrast", 1);
        this.updateStyle("saturation", 1);
        this.updateStyle("grayscale", 0);

        this.brightnessSlider.value = this.brightness;
        this.contrastSlider.value = this.contrast;
        this.saturationSlider.value = this.saturation; 
        this.grayscaleSlider.value = this.grayscale; 
    }

    
    /**
     * render
     * includes the html and css structure
     */
    render() {
        const style = `
            <style>
                :host {
                    --bg: #121921;
                    --card-bg: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
                    --accent: #3b82f6; /* blau */
                    --accent-hover: #2563eb;
                    --label-color: #d1d5db; /* helles grau */
                    --slider-bg: #374151; /* dunkelgrau */
                    --slider-thumb: #3b82f6;
                    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-color: var(--bg);
                    color: var(--label-color);
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.7);
                    padding: 20px;
                    box-sizing: border-box;
                }

                .display-widget {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-around;
                    gap: 15px;
                    height: 100%;
                    width: 100%;
                }

                header {
                    display: flex;
                    flex-direction: row;
                    width: 95%;
                    justify-content: space-between;
                }

                h2 {
                    margin: 0 0 15px 0;
                    font-weight: 700;
                    font-size: 1.5rem;
                    color: white;
                    user-select: none;
                }

                button {
                    background: none;
                    width: 50px;
                    height: 50px;
                    padding: 5px;
                }

                button img {
                    height: 100%;
                    width: 100%;
                }

                div {
                    width: 90%;
                }

                label {
                    margin-bottom: 6px;
                    font-weight: 600;
                    color: var(--label-color);
                    user-select: none;
                }
                
                input[type="range"] {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    background: var(--slider-bg);
                    border-radius: 4px;
                    outline: none;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: var(--slider-thumb);
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid white;
                    transition: background 0.3s ease, transform 0.2s ease;
                    margin-top: -6px;
                }

                input[type="range"]:focus {
                    background: var(--accent);
                }
            </style>
        `;

        const html = `
            <div class="display-widget">
                <header>
                    <h2>Display Einstellungen</h2>
                    <button id="reset"><img src="../static/media/reset.svg" alt="Reset"></img</button>
                </header>

                <div>
                    <label id="brightnessLabel">Helligkeit</label>
                    <input type="range" id="brightnessSlider" min="0.1" max="2" step="0.01" value="1"></input>
                </div>
                <div>
                    <label id="contrastLabel">Kontrast</label>
                    <input type="range" id="contrastSlider" min="0.1" max="3" step="0.01" value="1"></input>
                </div>
                <div>
                    <label id="saturationLabel">Sättigung</label>
                    <input type="range" id="saturationSlider" min="0" max="3" step="0.01" value="1"></input>
                </div>
                <div>
                    <label id="grayscaleLabel">Grayscale</label>
                    <input type="range" id="grayscaleSlider" min="0" max="1" step="0.01" value="0"></input>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("display-widget", DisplaySettings);
