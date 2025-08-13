
// code/widgets/time_widgets.js
class TimeWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.mode = "stopwatch";
        this.stopwatchInterval = null;
        this.timerInterval = null;
        this.stopwatchTime = 0; // ms
        this.timerTime = 0; // ms (restzeit / preset)
    }

    connectedCallback() {
        this.render();
        this.setupElements();
        this.showMode(this.mode);
    }

    setupElements() {
        this.header = this.shadowRoot.querySelector("#title");
        this.content = this.shadowRoot.querySelector("#content");
        // Tabs: wir lesen sie als NodeList und nutzen data-mode
        this.tabs = Array.from(this.shadowRoot.querySelectorAll(".tab"));

        this.tabs.forEach(tab => {
            tab.addEventListener("click", () => this.showMode(tab.dataset.mode));
        });
    }

    showMode(mode) {
        // stoppe laufende intervals (aber bewahre die Zeit-Werte)
        if (this.stopwatchInterval) {
            clearInterval(this.stopwatchInterval);
            this.stopwatchInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.mode = mode;
        this.content.innerHTML = "";

        if (mode === "stopwatch") {
            this.header.textContent = "Stoppuhr";
            this.renderStopwatch();
        } else {
            this.header.textContent = "Timer";
            this.renderTimer();
        }

        // Tab-Styles & accessibility
        this.tabs.forEach(tab => {
            const active = tab.dataset.mode === mode;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    renderStopwatch() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("stopwatch");

        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time");
        timeDisplay.textContent = this.formatStopwatch(this.stopwatchTime || 0);
        wrapper.appendChild(timeDisplay);

        const controls = document.createElement("div");
        controls.classList.add("controls");

        const btnStart = document.createElement("button");
        btnStart.className = "btn primary";
        btnStart.textContent = this.stopwatchInterval ? "Pause" : "Start";

        const btnReset = document.createElement("button");
        btnReset.className = "btn";
        btnReset.textContent = "Reset";

        controls.appendChild(btnStart);
        controls.appendChild(btnReset);
        wrapper.appendChild(controls);

        let startTime = 0;

        btnStart.addEventListener("click", () => {
            if (this.stopwatchInterval) {
                // Pause
                clearInterval(this.stopwatchInterval);
                this.stopwatchInterval = null;
                btnStart.textContent = "Start";
            } else {
                // Start / Resume
                startTime = Date.now() - this.stopwatchTime;
                this.stopwatchInterval = setInterval(() => {
                    this.stopwatchTime = Date.now() - startTime;
                    timeDisplay.textContent = this.formatStopwatch(this.stopwatchTime);
                }, 10);
                btnStart.textContent = "Pause";
            }
        });

        btnReset.addEventListener("click", () => {
            clearInterval(this.stopwatchInterval);
            this.stopwatchInterval = null;
            this.stopwatchTime = 0;
            timeDisplay.textContent = this.formatStopwatch(0);
            btnStart.textContent = "Start";
        });

        this.content.appendChild(wrapper);
    }

    renderTimer() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("timer");

        // preset / verbleibende Zeit initial aus dem gespeicherten Wert
        let timeLeft = this.timerTime || 0; // ms
        let endTime = null;

        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time");
        timeDisplay.textContent = this._formatMinutesSeconds(timeLeft);
        wrapper.appendChild(timeDisplay);

        // Adjust-Buttons (touch-freundlich)
        const adjust = document.createElement("div");
        adjust.classList.add("adjust-controls");

        const btnPlus10 = document.createElement("button");
        btnPlus10.className = "btn small";
        btnPlus10.textContent = "+10s";
        btnPlus10.dataset.add = "10000";

        const btnPlus60 = document.createElement("button");
        btnPlus60.className = "btn small";
        btnPlus60.textContent = "+1m";
        btnPlus60.dataset.add = String(60 * 1000);

        const btnMinus10 = document.createElement("button");
        btnMinus10.className = "btn small";
        btnMinus10.textContent = "-10s";
        btnMinus10.dataset.add = "-10000";

        const btnMinus60 = document.createElement("button");
        btnMinus60.className = "btn small";
        btnMinus60.textContent = "-1m";
        btnMinus60.dataset.add = String(-60 * 1000);

        adjust.appendChild(btnMinus60);
        adjust.appendChild(btnMinus10);
        adjust.appendChild(btnPlus10);
        adjust.appendChild(btnPlus60);

        wrapper.appendChild(adjust);

        // Start / Reset Buttons
        const controls = document.createElement("div");
        controls.classList.add("controls");

        const btnStart = document.createElement("button");
        btnStart.className = "btn primary";
        btnStart.textContent = this.timerInterval ? "Pause" : "Start";

        const btnReset = document.createElement("button");
        btnReset.className = "btn";
        btnReset.textContent = "Reset";

        controls.appendChild(btnStart);
        controls.appendChild(btnReset);
        wrapper.appendChild(controls);

        const updateDisplay = () => {
            timeDisplay.textContent = timeLeft > 0 ? this._formatMinutesSeconds(timeLeft) : "00:00";
        };

        // Adjust handlers
        const adjustHandler = (evt) => {
            const delta = parseInt(evt.currentTarget.dataset.add, 10) || 0;
            timeLeft = Math.max(0, timeLeft + delta);
            // persist preset
            this.timerTime = timeLeft;
            // if running, update endTime to reflect new remaining time
            if (this.timerInterval) {
                endTime = Date.now() + timeLeft;
            }
            updateDisplay();
        };

        [btnPlus10, btnPlus60, btnMinus10, btnMinus60].forEach(b => b.addEventListener("click", adjustHandler));

        // Start / Pause
        btnStart.addEventListener("click", () => {
            if (this.timerInterval) {
                // Pause
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                btnStart.textContent = "Start";
                // persist remaining time
                this.timerTime = timeLeft;
            } else {
                if (timeLeft <= 0) return; // nothing to start
                endTime = Date.now() + timeLeft;
                this.timerInterval = setInterval(() => {
                    const remaining = endTime - Date.now();
                    if (remaining <= 0) {
                        clearInterval(this.timerInterval);
                        this.timerInterval = null;
                        timeLeft = 0;
                        this.timerTime = 0;
                        timeDisplay.textContent = "Fertig!";
                        btnStart.textContent = "Start";
                    } else {
                        timeLeft = remaining;
                        this.timerTime = timeLeft;
                        updateDisplay();
                    }
                }, 200);
                btnStart.textContent = "Pause";
            }
        });

        btnReset.addEventListener("click", () => {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            timeLeft = 0;
            this.timerTime = 0;
            updateDisplay();
            btnStart.textContent = "Start";
        });

        updateDisplay();
        this.content.appendChild(wrapper);
    }

    updateTimerDisplay(display, ms) {
        // fallback compatibility (falls irgendwo noch genutzt)
        display.textContent = this._formatMinutesSeconds(ms);
    }

    // helper: format stopwatch mm:ss.hh
    formatStopwatch(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const hundredths = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(hundredths).padStart(2,"0")}`;
    }

    // helper: format mm:ss
    _formatMinutesSeconds(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }

    render() {
        const style = `
            <style>
                :host {
                    --bg: #0f1724;
                    --card: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
                    --accent: #7dd3fc;
                    --muted: rgba(255,255,255,0.7);
                    display: block;
                    width: 260px;          /* default width - kann überschrieben werden */
                    height: 420px;         /* hochformat */
                    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                    color: var(--muted);
                }

                .time-widget {
                    background: var(--card);
                    border-radius: 7px;
                    box-shadow: 0 8px 30px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }

                header {
                    padding: 0.8rem;
                    text-align: center;
                    font-weight: 700;
                    font-size: 1.05rem;
                    color: white;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }

                main {
                    padding: 5px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.75rem;
                    flex: 1;
                }

                .time {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    letter-spacing: 0.6px;
                }

                .adjust-controls {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .controls {
                    display: flex;
                    gap: 0.6rem;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .btn {
                    -webkit-tap-highlight-color: transparent;
                    padding: 0.5rem 0.6rem;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.03);
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                    min-height: 40px; /* touch target */
                }

                .btn.small {
                    padding: 0.45rem 0.4rem;
                    min-height: 42px;
                }

                .btn.primary {
                    background: linear-gradient(180deg, rgba(125,211,252,0.12), rgba(125,211,252,0.06));
                    box-shadow: 0 6px 14px rgba(2,6,23,0.45);
                }

                .btn:active {
                    transform: translateY(1px);
                }

                footer {
                    display: flex;
                    border-top: 1px solid rgba(255,255,255,0.03);
                }

                .tab {
                    flex: 1;
                    padding: 0.7rem;
                    text-align: center;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .tab.active {
                    background: rgba(125,211,252,0.09);
                    color: white;
                }

                /* kleine responsive Anpassung */
                @media (max-width: 340px) {
                    :host { width: 220px; height: 420px; }
                    .time { font-size: 1.6rem; }
                    .btn { min-height: 38px; font-size: 0.9rem; }
                }
            </style>
        `;

        const html = `
            <div class="time-widget" role="region" aria-label="Zeit-Widget">
                <header id="title">Stoppuhr</header>
                <main id="content"></main>
                <footer>
                    <button class="tab active" id="tab-stopwatch" data-mode="stopwatch" aria-pressed="true">Stoppuhr</button>
                    <button class="tab" id="tab-timer" data-mode="timer" aria-pressed="false">Timer</button>
                </footer>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("time-widget", TimeWidget);
