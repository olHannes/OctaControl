// code/widgets/settings/notification_widget.js

class Notification extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.timeoutId = null;
    }

    connectedCallback() {
        this.render();
        this.setup();
    }

    setup() {
        this.container = this.shadowRoot.querySelector("#global-notification");
        this.imgTag = this.shadowRoot.querySelector("img");
        this.hTag = this.shadowRoot.querySelector("h2");
        this.textTag = this.shadowRoot.querySelector("span");

        this.container.addEventListener("click", () => this.hideGlobalNotification());
    }

    /**
     * show notification based on title, message, image, sound and duration
     */
    showGlobalNotification(pTitle, pMsg, pImg, sound = "", duration = 3000) {
        if (pImg) {
            const img = new Image();
            img.onload = () => {
                this.imgTag.src = pImg;
                this.imgTag.style.display="block";
            };
            img.src = pImg;
        } else {
            this.imgTag.style.display = "none";
        }

        this.hTag.innerText = pTitle || "";
        this.textTag.innerText = pMsg || "";

        this.container.style.display = "flex";
        this.container.style.animation = "fadeSlideDown 0.4s ease-out";

        if (sound) {
            const audio = new Audio(sound);
            audio.play().catch(() => {});
        }

        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (duration > 0) {
            this.timeoutId = setTimeout(() => this.hideGlobalNotification(), duration);
        }
    }

    /**
     * remove notification (animated)
     */
    hideGlobalNotification() {
        this.container.style.animation = "fadeOut 0.3s ease-in forwards";
        setTimeout(() => {
            this.container.style.display = "none";
        }, 300);
    }

    render() {
        const style = `
            <style>
                :host {
                    display: block;
                }

                #global-notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: none;
                    align-items: center;
                    gap: 12px;
                    
                    background: linear-gradient(135deg, #ff9800, #ffc107);
                    color: #fff;
                    padding: 14px 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    
                    max-width: 420px;
                    width: calc(100% - 40px);
                    font-family: "Segoe UI", sans-serif;
                    z-index: 1000;
                }

                #global-notification img {
                    height: 40px;
                    flex-shrink: 0;
                }

                #global-notification h2 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.2;
                }

                #global-notification span {
                    display: block;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                    
                #global-notification div.text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                @keyframes fadeSlideDown {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                    to {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                }
            </style>
        `;

        const html = `
            <div id="global-notification">
                <img rel="preload" src="../static/media/notification/info.svg" alt="Icon">
                <div class="text">
                    <h2>Title</h2>
                    <span>Text...</span>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

customElements.define("notification-widget", Notification);
