// code/widgets/widget_order_settings.js
import { save, load } from "../../utils/storage_handler.js";

class OrderSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.defaultOrder = ["audio_map", "clock_time", "hardware"];
        this.activeIndex = 0;
    }


    /**
     * connected Callback
     */
    connectedCallback() {
        this.render();
        this.loadSavedOrder();
        this.setupListeners();
    }


    /**
     * load saved order
     * load saved order from storage
     */
    loadSavedOrder() {
        const savedOrder = load("WIDGET_ORDER");
        this.order = Array.isArray(savedOrder) && savedOrder.length > 0
            ? savedOrder
            : this.defaultOrder;

        this.renderThumbnails();
        this.applyOrderToDOM();
    }


    /**
     * render Thumbnails (update widget)
     */
    renderThumbnails() {
        const container = this.shadowRoot.querySelector(".order-display");
        container.innerHTML = "";

        this.order.forEach((id, index) => {
            const thumb = document.createElement("div");
            thumb.classList.add("thumb");
            if (index === this.activeIndex) thumb.classList.add("active");

            thumb.innerHTML = `<img src="../static/media/widgets/${id}.png" alt="${id}"/>`;

            thumb.addEventListener("click", () => {
                this.activeIndex = index;
                this.renderThumbnails();
            });

            container.appendChild(thumb);
        });
    }


    /**
     * setup Listeners
     * setup listeners for buttons
     */
    setupListeners() {
        const btnLeft = this.shadowRoot.getElementById("toLeft");
        const btnRight = this.shadowRoot.getElementById("toRight");

        btnLeft.addEventListener("click", () => this.moveActive(-1));
        btnRight.addEventListener("click", () => this.moveActive(1));
    }


    /**
     * move active
     * move item -> change order
     */
    moveActive(direction) {
        const newIndex = this.activeIndex + direction;
        if (newIndex < 0 || newIndex >= this.order.length) return;

        [this.order[this.activeIndex], this.order[newIndex]] =
            [this.order[newIndex], this.order[this.activeIndex]];

        this.activeIndex = newIndex;

        this.renderThumbnails();
        this.applyOrderToDOM();
        save("WIDGET_ORDER", this.order);
    }


    /**
     * apply order to DOM
     * new order should be applied to the DOM-object
     */
    applyOrderToDOM() {
        return;
        const container = document.getElementById("widget-container");
        if (!container) return;

        const settingsPanel = document.getElementById("settingsWidget")?.parentElement;
        const settings = document.getElementById("settings");

        this.order.forEach(id => {
            const el = document.getElementById(id);
            if (el && el !== this) container.appendChild(el);
        });

        if(settingsPanel) container.appendChild(settingsPanel);
        if(settings) container.appendChild(settings);
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
                max-width: 750px;
                padding: 10px;
                font-family: Arial, sans-serif;
                text-align: center;
            }

            h2 {
                margin-bottom: 35px;
            }

            .order-display {
                display: flex;
                flex-direction: row;
                margin-bottom: 26px;
                justify-content: space-evenly;
            }

            .thumb {
                cursor: pointer;
                opacity: 0.5;
                transition: transform 0.2s, opacity 0.2s;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 0 5px rgba(0,0,0,0.3);
            }

            .thumb.active {
                opacity: 1;
                transform: scale(1.1);
            }

            .thumb img {
                display: block;
                width: 120px;
                height: auto;
                object-fit: cover;
            }

            .order-actions {
                display: flex;
                gap: 10px;
                justify-content: space-around;
            }

            .order-button {
                padding: 8px 12px;
                width: 100px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                border-radius: 5px;
                border: none;
                background-color: #444;
                color: white;
                transition: background 0.2s, transform 0.2s;
            }

            .order-button:hover {
                background-color: #666;
                transform: scale(1.05);
            }
        </style>
        `;

        const html = `
        <div class="widget-order">
            <h2>Widgets Reihenfolge</h2>    
            <div class="order-display"></div>
            <div class="order-actions">
                <button class="order-button" id="toLeft">to left</button>
                <button class="order-button" id="toRight">to right</button>
            </div>
        </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("order-widget", OrderSettings);
