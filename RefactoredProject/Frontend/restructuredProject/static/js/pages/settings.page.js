// js/pages/settings.page.js
import {systemService, wifiService, bluetoothService} from "../services/settings.service.js";
import * as connectivity from "../features/connectivity.js";


export function updateSystem(root) {
  console.log("update System");
}

let restartTimer = null;
export function restartSystem(root) {
  const restartText = root.querySelector("#restartText");
  if(!restartText) return;

  if(restartTimer !== null) {
    clearTimeout(restartTimer);
    restartTimer = null;
    restartText.textContent = "Restart the infotainment system";
    return;
  }
  restartText.textContent = "Restarting in 3 seconds - click to cancle";
  restartTimer = setTimeout(async () => {
    restartTimer = null;
    restartText.textContent = "Restarting...";
    try {
      await systemService.restart();
    } catch (e) {
      restartText.textContent = "Restart the infotainment system";
    }
  }, 3000);
}

let shutdownTimer = null;
let shutdownCountdown = null;
let shutdownRemaining = 0;
export function shutdownSystem(root) {
  const shutdownText = root.querySelector(".power-off");
  if (!shutdownText) return;
  if (shutdownTimer !== null) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;

    clearInterval(shutdownCountdown);
    shutdownCountdown = null;

    shutdownText.textContent = "Power off the system";
    shutdownRemaining = 0;
    return;
  }
  shutdownRemaining = 5;
  shutdownText.textContent = `system will shut down in ${shutdownRemaining} seconds - click to cancel`;
  shutdownCountdown = setInterval(() => {
    shutdownRemaining -= 1;
    if (shutdownRemaining > 0) {
      shutdownText.textContent = `system will shut down in ${shutdownRemaining} seconds - click to cancel`;
    }
  }, 1000);

  shutdownTimer = setTimeout(async () => {
    shutdownTimer = null;
    clearInterval(shutdownCountdown);
    shutdownCountdown = null;
    shutdownText.textContent = "Shutting down…";

    try {
      await systemService.shutdown();
    } catch (e) {
      console.error(e);
      shutdownText.textContent = "Power off the system";
    }
  }, 5000);
}
export function cleanupShutdownUi() {
  if (shutdownTimer !== null) clearTimeout(shutdownTimer);
  shutdownTimer = null;
  if (shutdownCountdown !== null) clearInterval(shutdownCountdown);
  shutdownCountdown = null;
  shutdownRemaining = 0;
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
              <input type="checkbox" id="bluetoothToggle"/>
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

        <div class="panel panel-system" id="updateBtn">
          <div class="icon-wrapper">
            <span class="icon icon--update"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>System Update</h3>
            <span class="description">Check for Updates</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;" id="updateIcon"></span>
        </div>

        <div class="panel panel-system" id="restartBtn">
          <div class="icon-wrapper">
            <span class="icon icon--restart"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Restart</h3>
            <span class="description" id="restartText">Restart the infotainment system</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;"></span>
        </div>

        <div class="panel panel-system panel-shutdown" id="shutdownBtn">
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
  
  //startup -> event-listener and first store data
  connectivity.addAllEventListeners(root, store);
  connectivity.refreshSoftwareVersion(store);
  connectivity.refreshWifi(store);
  connectivity.refreshBluetooth(store);

  //System selections
  const versionName = root.querySelector("#version");
  const versionDate = root.querySelector("#update");
  const updateIcon = root.querySelector("#updateIcon");

  // Software Subscription
  store.subscribeSelector(s => s.software, (l) => {
    if(!l) return;
    if(versionName) {
      versionName.textContent = `${l.branch}:${l.commit}`;
    }
    if(l.date && versionDate) {
      versionDate.textContent = new Date(l.date)
        .toLocaleDateString("de-DE");
    }
    if(updateIcon) {
      const color = l.dirty
        ? "var(--system-shutdown)"
        : "var(--muted)";
      updateIcon.style.background = color;
      versionDate && (versionDate.style.color = color);
    }
  });

  // Network Subscription
  store.subscribeSelector(s => s.network, (l) => {
    if(!l) return;
    connectivity.renderKnownNetworks(root, l.knownNetworks, l.ssid);
    connectivity.renderScannedNetworks(root, l.scannedNetworks, l.ssid);

    const wifiToggle = root.querySelector("#wifiToggle");
    const wifiDetails = root.querySelector("#wifiDetails");
    if (!wifiToggle || !wifiDetails) return;
    const shouldBeOn = l.power === "on";
    if (wifiToggle.checked !== shouldBeOn) {
      wifiToggle.checked = shouldBeOn;
    }
    connectivity.syncDetails(wifiToggle, wifiDetails);
  });

  // Bluetooth Subscription
  store.subscribeSelector(s => s.bluetooth, (l) => {
    if(!l) return;
    connectivity.renderKnownBluetoothDevices(root, l.pairedDevices, l.connectedDeviceMac);
    connectivity.renderScannedDevices(root, l.scannedDevices, l.connectedDeviceMac);

    const bluetoothToggle = root.querySelector("#bluetoothToggle");
    const bluetoothDetails = root.querySelector("#bluetoothDetails");
    if(!bluetoothToggle || !bluetoothDetails) return;
    const btShouldBeOn = l.power === "yes";
    if(bluetoothToggle.checked !== btShouldBeOn) {
      bluetoothToggle.checked = btShouldBeOn;
    }
    connectivity.syncDetails(bluetoothToggle, bluetoothDetails);
  });
}
