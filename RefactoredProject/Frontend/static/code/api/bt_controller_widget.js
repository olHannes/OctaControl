// code/api/bt_controller_widget.js

class BtSetupWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.loadStatus();
    this.shadowRoot.getElementById('togglePower').addEventListener("click", () => this.togglePower());
    this.shadowRoot.getElementById('startScan').addEventListener("click", () => this.scan());
    this.shadowRoot.getElementById('toggleVisibility').addEventListener("click", () => this.toggleVisibility());
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;

          --color-bg-start: #757882ff;
          --color-bg-end: #111827;
          --color-border: rgba(97, 218, 251, 0.15);
          --color-text: #ffffffff;
          --color-heading: #c2c3d2ff;
          --color-button-bg: linear-gradient(145deg, #1B2A40, #152233);
          --color-button-hover: #24344E;
          --color-button-border: #2C3E50;
          --color-button-border-hover: #075270ff;
          --color-button-shadow: rgba(97, 218, 251, 0.2);
          --color-device-bg: rgba(25, 34, 50, 0.9);
          --color-device-hover: rgba(40, 55, 80, 0.9);
          --color-device-button: #2B3E59;
          --color-device-button-hover: #3C577A;
          --color-scrollbar-thumb: #3C4A5A;
        }

        .bt-widget {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, var(--color-bg-start), var(--color-bg-end));
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: 16px;
          padding: 1.5em;
          width: 320px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 0.7em;
          font-size: 1.3em;
          color: var(--color-heading);
          letter-spacing: 0.5px;
          text-align: left;
        }

        .status-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2em;
          gap: 0.6em;
        }

        .actions {
          display: flex;
          gap: 0.6em;
          margin-bottom: 1.2em;
        }

        button {
          flex: 1;
          background: var(--color-button-bg);
          color: var(--color-text);
          border: 1px solid var(--color-button-border);
          padding: 0.55em 0.9em;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 0.95em;
        }

        button:hover {
          background: var(--color-button-hover);
          border-color: var(--color-button-border-hover);
          box-shadow: 0 0 8px var(--color-button-shadow);
        }

        button:active {
          transform: scale(0.97);
        }

        .device-section h4 {
          margin-bottom: 0.5em;
          color: var(--color-heading);
          font-size: 1.1em;
        }

        .device-list {
          max-height: 200px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.7em;
        }

        .device-entry {
          background: var(--color-device-bg);
          padding: 0.7em;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95em;
          border: 1px solid var(--color-border);
          transition: background 0.3s;
        }

        .device-entry:hover {
          background: var(--color-device-hover);
        }

        .device-entry button {
          margin-left: 0.6em;
          padding: 0.35em 0.7em;
          font-size: 0.85em;
          background: var(--color-device-button);
          border: none;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .device-entry button:hover {
          background: var(--color-device-button-hover);
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-scrollbar-thumb);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }
      </style>

      <div class="bt-widget">
        <header>
          <h3>Bluetooth Einstellungen</h3>
          <div class="status-controls">
            <button id="togglePower">An/Aus</button>
            <div id="btStatus">Lade...</div>
          </div>
        </header>

        <section class="actions">
          <button id="startScan">🔍 Scan</button>
          <button id="toggleVisibility">👁 Sichtbarkeit</button>
        </section>

        <section class="device-section">
          <h4 id="deviceListTitle">Gekoppelte Geräte</h4>
          <div class="device-list" id="deviceList">
            <!-- Geräte -->
          </div>
        </section>
      </div>
    `;
  }
}

customElements.define("bt-setup-widget", BtSetupWidget);
