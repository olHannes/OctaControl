// code/api/bt_controller_widget.js

class BtSetupWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.loadStatus();
    this.shadowRoot.querySelector("#togglePower").addEventListener("click", () => this.togglePower());
  }

  async loadStatus() {
    const res = await fetch("/api/bluetooth/setup/status");
    const data = await res.json();
    const statusEl = this.shadowRoot.querySelector("#status");
    statusEl.textContent = `Bluetooth: ${data.powered === "yes" ? "An" : "Aus"}`;
  }

  async togglePower() {
    const res = await fetch("/api/bluetooth/setup/status");
    const data = await res.json();
    const newState = data.powered === "yes" ? "off" : "on";

    await fetch("/api/bluetooth/setup/power", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newState })
    });

    this.loadStatus();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .bt-widget {
          border: 1px solid #888;
          padding: 1em;
          border-radius: 0.5em;
          font-family: sans-serif;
          width: 250px;
          background: #f8f8f8;
        }
        .bt-widget h3 {
          margin-top: 0;
        }
        .bt-widget button {
          margin-top: 0.5em;
          padding: 0.3em 0.6em;
        }
      </style>
      <div class="bt-widget">
        <h3>Bluetooth Setup</h3>
        <div id="status">Lade...</div>
        <button id="togglePower">An/Aus</button>
      </div>
    `;
  }
}

customElements.define("bt-setup-widget", BtSetupWidget);
