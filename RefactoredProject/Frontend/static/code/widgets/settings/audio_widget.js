import { save, load } from "../../utils/storage_handler.js";

class AudioWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
        this.initWidget();
    }

    initWidget() {
        const toggle = this.shadowRoot.querySelector("#welcome-toggle");

        const welcomeSlider = this.shadowRoot.querySelector("#welcome-volume-slider");
        const welcomeValue = this.shadowRoot.querySelector("#welcome-volume-value");

        const systemSlider = this.shadowRoot.querySelector("#system-volume-slider");
        const systemValue = this.shadowRoot.querySelector("#system-volume-value");

        // --- Initial state aus storage ---
        const welcomeEnabled = load("WELCOME_SOUND") ?? false;
        const welcomeVolume = load("WELCOME_VOLUME") ?? 100;
        const systemVolume = load("SYSTEM_VOLUME") ?? 75;

        toggle.checked = welcomeEnabled;

        welcomeSlider.value = welcomeVolume;
        welcomeValue.textContent = welcomeVolume;

        systemSlider.value = systemVolume;
        systemValue.textContent = systemVolume;

        // --- Toggle Welcome Audio ---
        toggle.addEventListener("change", () => {
            save("WELCOME_SOUND", toggle.checked);
        });

        // --- Welcome-Volume Slider ---
        welcomeSlider.addEventListener("input", () => {
            const val = parseInt(welcomeSlider.value, 10);
            welcomeValue.textContent = val;
            save("WELCOME_VOLUME", val);
        });

        // --- System-Volume Slider ---
        systemSlider.addEventListener("input", () => {
            const val = parseInt(systemSlider.value, 10);
            systemValue.textContent = val;
            save("SYSTEM_VOLUME", val);
        });
    }

    render() {
        const style = `
            <style>
                :host {
                    --card: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
                    --accent: #7dd3fc;
                    --muted: rgba(255,255,255,0.7);
                    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                    display: block;
                    width: 100%;
                }

                .audio-widget {
                    background: var(--card);
                    border-radius: 14px;
                    padding: 1rem;
                    box-shadow: 0 6px 20px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }

                .row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                    font-weight: 600;
                }

                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    inset: 0;
                    background: rgba(255,255,255,0.15);
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    border-radius: 50%;
                    transition: .3s;
                }
                input:checked + .slider {
                    background: var(--accent);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }

                /* Range Slider */
                .volume {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .volume-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.15);
                    outline: none;
                    cursor: pointer;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--accent);
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(125,211,252,0.5);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--accent);
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(125,211,252,0.5);
                }
                .value {
                    color: var(--muted);
                    font-weight: 500;
                }
            </style>
        `;

        const html = `
            <div class="audio-widget">
                <div class="row">
                    <span>Welcome Audio</span>
                    <label class="switch">
                        <input type="checkbox" id="welcome-toggle">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="volume">
                    <div class="volume-row">
                        <span>Welcome-Audio Lautstärke</span>
                        <span class="value" id="welcome-volume-value">50</span>
                    </div>
                    <input type="range" min="0" max="100" value="50" id="welcome-volume-slider">
                </div>

                <div class="volume">
                    <div class="volume-row">
                        <span>System Lautstärke</span>
                        <span class="value" id="system-volume-value">50</span>
                    </div>
                    <input type="range" min="0" max="100" value="50" id="system-volume-slider">
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("audio-widget", AudioWidget);
