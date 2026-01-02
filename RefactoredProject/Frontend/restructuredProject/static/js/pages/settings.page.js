// js/pages/settings.page.js
import {apiGet, apiPatch, apiPost } from "../api.js";

export const settingsService = {
  version() {
    return apiGet("/api/system/version");
  },
  get() {
    return apiGet("/api/settings");
  },
  patch(patch) {
    return apiPatch("/api/settings", patch);
  },
};


export async function loadSoftwareVersion(store) {
  const data = await settingsService.version();
  store.setSlice("software", data);
}

export function renderSettings(root, store) {
  root.innerHTML = `
    <section class="settings">
      <div class="vertical-container centered-panel">
        <h2 class="headline">Settings</h2>
        <p class="description">Manage system preferences and connectivity</p>

        <span class="subheading">Connectivity</span>

        <div class="panel-group">
          <div class="panel">
            <div class="icon-wrapper">
              <span class="icon icon--bluetooth"></span>
            </div>
            <div class="vertical-container align-left">
              <h3>Bluetooth</h3>
              <span class="description">Connect to audio devices</span>
            </div>
            <label class="switch" title="Bluetooth Toggle">
              <input type="checkbox" id="bluetoothToggle" checked />
              <span class="switch__track" aria-hidden="true"></span>
              <span class="switch__thumb" aria-hidden="true"></span>
            </label>
          </div>

          <div class="panel-details" id="bluetoothDetails" aria-hidden="false">
            <div class="panel-details__inner">
              <div class="details-grid">
                <div class="details-card">
                  <div class="details-title">Paired devices</div>
                  <ul class="details-list" id="bluetoothPairedList">
                    <li class="details-item">
                      <span class="details-item__label">—</span>
                      <button class="details-btn" type="button" data-action="bt-connect" disabled>Connect</button>
                    </li>
                  </ul>
                </div>

                <div class="details-card">
                  <div class="details-title">Available devices</div>
                  <div class="details-actions">
                    <button class="details-btn details-btn--primary" type="button" id="bluetoothScanBtn">Scan</button>
                  </div>
                  <ul class="details-list" id="bluetoothScanList">
                    <li class="details-item">
                      <span class="details-item__label">—</span>
                      <button class="details-btn" type="button" data-action="bt-pair" disabled>Pair</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-group">
          <div class="panel">
            <div class="icon-wrapper">
              <span class="icon icon--wlan-off"></span>
            </div>
            <div class="vertical-container align-left">
              <h3>Wi-Fi</h3>
              <span class="description">Connect to wireless networks</span>
            </div>
            <label class="switch" title="Wifi Toggle">
              <input type="checkbox" id="wifiToggle" />
              <span class="switch__track" aria-hidden="true"></span>
              <span class="switch__thumb" aria-hidden="true"></span>
            </label>
          </div>

          <div class="panel-details" id="wifiDetails" aria-hidden="true">
            <div class="panel-details__inner">
              <div class="details-grid">
                <div class="details-card">
                  <div class="details-title">Connected network</div>
                  <ul class="details-list" id="wifiConnectedList">
                    <li class="details-item">
                      <span class="details-item__label">—</span>
                      <button class="details-btn" type="button" data-action="wifi-disconnect" disabled>Disconnect</button>
                    </li>
                  </ul>
                </div>

                <div class="details-card">
                  <div class="details-title">Available networks</div>
                  <div class="details-actions">
                    <button class="details-btn details-btn--primary" type="button" id="wifiScanBtn">Scan</button>
                  </div>
                  <ul class="details-list" id="wifiScanList">
                    <li class="details-item">
                      <span class="details-item__label">—</span>
                      <button class="details-btn" type="button" data-action="wifi-connect" disabled>Connect</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span class="subheading">System</span>

        <div class="panel panel-system">
          <div class="icon-wrapper">
            <span class="icon icon--update"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>System Update</h3>
            <span class="description">Check for Updates</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;" id="updateIcon"></span>
        </div>

        <div class="panel panel-system">
          <div class="icon-wrapper">
            <span class="icon icon--restart"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Restart</h3>
            <span class="description">Restart the infotainment system</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;"></span>
        </div>

        <div class="panel panel-system panel-shutdown">
          <div class="icon-wrapper shutdown-background">
            <span class="icon icon--shutdown"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Shutdown</h3>
            <span class="power-off">Power off the system</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;"></span>
        </div>

        <div class="panel information">
          <span class="subheading">System Information</span>
          <div class="line">
            <span class="light-text">Model</span>
            <span id="model">Škoda Octavia 2</span>
          </div>
          <div class="line">
            <span class="light-text">Software Version</span>
            <span id="version">--</span>
          </div>
          <div class="line">
            <span class="light-text">Last Update</span>
            <span id="update">--</span>
          </div>
        </div>
      </div>
    </section>
  `;

  const btToggle = root.querySelector("#bluetoothToggle");
  const btDetails = root.querySelector("#bluetoothDetails");
  const wifiToggle = root.querySelector("#wifiToggle");
  const wifiDetails = root.querySelector("#wifiDetails");

  const syncDetails = (toggleEl, detailsEl) => {
    if (!toggleEl || !detailsEl) return;
    const open = !!toggleEl.checked;
    detailsEl.classList.toggle("is-open", open);
    detailsEl.setAttribute("aria-hidden", String(!open));
  };

  btToggle?.addEventListener("change", () => syncDetails(btToggle, btDetails));
  wifiToggle?.addEventListener("change", () => syncDetails(wifiToggle, wifiDetails));
  syncDetails(btToggle, btDetails);
  syncDetails(wifiToggle, wifiDetails);
  
  loadSoftwareVersion(store);

  const versionName = root.querySelector("#version");
  const versionDate = root.querySelector("#update");
  const updateIcon = root.querySelector("#updateIcon");

  store.subscribeSelector(s => s.software, (l) => {
    if(!l) return;

    const version = `${l.branch}:${l.commit}`;
    versionName.textContent = version;
    
    if(l.date) {
      const d = new Date(l.date);
      versionDate.textContent = d.toLocaleDateString("de-DE");
    }

    updateIcon.style.background = l.dirty ? "var(--system-shutdown)" : "var(--muted)";
    versionDate.style.color = l.dirty ? "var(--system-shutdown)" : "white";
  });

}
