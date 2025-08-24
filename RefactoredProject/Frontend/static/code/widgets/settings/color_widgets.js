//code/widgets/settings/color_widget.js
import { save, load } from "../../utils/storage_handler.js";

class ColorSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.bgColor = "#42674d";
        this.colorSlider = null;
    }

    
    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.initWidget();
    }


    /**
     * init widget
     * setup of the current color and references
     */
    initWidget() {
        this.colorSlider = this.shadowRoot.querySelector("#colorSlider");

        const savedColor = load("BG_COLOR") ?? this.bgColor;
        this.bgColor = savedColor;
        this.colorSlider.value = savedColor;

        this.updateColor(savedColor);

        this.colorSlider.addEventListener("input", (e) => {
            this.updateColor(e.target.value);
        });
    }


    /**
     * update color
     * update ui and saves the value
     */
    updateColor(value) {
        this.bgColor = value;
        document.documentElement.style.setProperty("--bg", value);
        save("BG_COLOR", value);
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
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                    color: #d1d5db;
                }

                .color-widget {
                    border-radius: 18px;
                    background-color: #121921;
                    padding: 20px;
                }

                label {
                    margin-bottom: 6px;
                    font-weight: 600;
                }

                .row-container {
                    display: flex;
                    justify-content: space-between;
                }

                input[type="color"] {
                    width: 85%;
                    height: 50px;
                    border: none;
                    cursor: pointer;
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
            </style>
        `;

        const html = `
            <div class="color-widget">
                <label for="colorSlider">Hintergrundfarbe</label>
                <div class="row-container">
                    <input type="color" id="colorSlider" value="${this.bgColor}">
                    <button id="resetColor"><img src="../static/media/reset.svg" alt="Reset"></img</button>    
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
        
        const resetColorBtn = this.shadowRoot.querySelector('#resetColor');
        const colorInputPanel = this.shadowRoot.querySelector('#colorSlider');
        if(resetColorBtn) resetColorBtn.addEventListener("click", () => {
            this.updateColor("#42674d");
            if(colorInputPanel) colorInputPanel.value = "#42674d";
        });
    }

}

customElements.define("color-widget", ColorSettings);
