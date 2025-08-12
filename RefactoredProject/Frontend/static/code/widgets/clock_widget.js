//code/widgets/clock_widget.js
class ClockWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }


    /**
     * connected callback
     * setup of html, items and starts the loop 
     */
    connectedCallback() {
        this.render();
        this.setupItems();
        this.start();
    }


    /**
     * setup items
     * uses a querySelector to find the moveable items
     */
    setupItems() {
        this.clockWrap = this.shadowRoot.querySelector("#clock");
        this.hourHand = this.shadowRoot.querySelector("#hour");
        this.minuteHand = this.shadowRoot.querySelector("#minute");
        this.secondHand = this.shadowRoot.querySelector("#second");
        this.digital = this.shadowRoot.querySelector("#digital");
        this.dateEl = this.shadowRoot.querySelector("#date");
    }


    /**
     * start
     * handles a loop to update the clock
     */
    start() {
        const update = () => {
            const now = new Date();
            const ms = now.getMilliseconds();
            const s = now.getSeconds() + ms / 1000;
            const m = now.getMinutes() + s / 60;
            const h = (now.getHours() % 12) + m / 60;

            const secondDeg = s * 6;
            const minuteDeg = m * 6;
            const hourDeg = h * 30;

            this.hourHand.style.transform = `translate(-50%,-88%) rotate(${hourDeg}deg)`;
            this.minuteHand.style.transform = `translate(-50%,-88%) rotate(${minuteDeg}deg)`;
            this.secondHand.style.transform = `translate(-50%,-88%) rotate(${secondDeg}deg)`;

            const pad = n => String(n).padStart(2, '0');
            this.digital.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

            const opts = { weekday: 'short', day: 'numeric', month: 'short' };
            this.dateEl.textContent = now.toLocaleDateString('de-DE', opts);

            requestAnimationFrame(update);
        };
        update();
    }


    /**
     * render
     * includes the html and css structure
     */
    render() {
        const style = `
            <style>
                :host {
                    --bg: #0f1724;
                    --card: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
                    --accent: #7dd3fc;
                    --muted: rgba(255,255,255,0.6);
                    --glass: rgba(255,255,255,0.03);
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                    display: block;
                    width: 300px;
                }

                .clock-widget {
                    width: 600px;
                    height: 400px;
                    background: var(--card);
                    padding: 1rem;
                    border-radius: 18px;
                    display: grid;
                    gap: 0.75rem;
                    align-items: center;
                    justify-items: center;
                    box-shadow: 0 8px 30px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
                }

                .clock-wrap {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    position: relative;
                    background: linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.01) 100%), rgba(255,255,255,0.01);
                    backdrop-filter: blur(6px);
                    border: 1px solid rgba(255,255,255,0.03);
                    box-shadow: 0 6px 20px rgba(2,6,23,0.6), inset 0 6px 20px rgba(255,255,255,0.01);
                }

                .dial {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                }

                .hand {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform-origin: 50% 88%;
                    border-radius: 6px;
                }
                .hand.hour {
                    height: 32%;
                    width: 6px;
                    background: linear-gradient(180deg,var(--muted),rgba(255,255,255,0.85));
                }
                .hand.minute {
                    height: 44%;
                    width: 4px;
                    background: linear-gradient(180deg,var(--muted),rgba(255,255,255,0.9));
                }
                .hand.second {
                    height: 46%;
                    width: 2px;
                    background: var(--accent);
                    box-shadow: 0 0 8px rgba(125,211,252,0.14);
                }

                .hub {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 12px;
                    height: 12px;
                    background: var(--accent);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                }

                .info {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--muted);
                    font-weight: 600;
                }
                .time-large {
                    font-size: 1.15rem;
                    color: white;
                }
                .date {
                    opacity: 0.75;
                }
            </style>
        `;

        const html = `
            <div class="clock-widget">
                <div class="clock-wrap" id="clock">
                    <div class="dial"></div>
                    <div class="hand hour" id="hour"></div>
                    <div class="hand minute" id="minute"></div>
                    <div class="hand second" id="second"></div>
                    <div class="hub"></div>
                </div>
                <div class="info">
                    <div class="time-large" id="digital">00:00:00</div>
                    <div class="date" id="date">—</div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("clock-widget", ClockWidget);
