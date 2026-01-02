export function renderSettings(root) {
  root.innerHTML = `
    <section class="settings">
      <div class="vertical-container centered-panel">
        <h2 class="headline">Settings</h2>
        <p class="description">Manage system preferences and connectivity</p>

        <span class="subheading">Connectivity</span>
        
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

        <span class="subheading">System</span>

        <div class="panel panel-system">
          <div class="icon-wrapper">
            <span class="icon icon--update"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>System Update</h3>
            <span class="description">Check for Updates</span>
          </div>
          <span class="icon icon--arrow" style="height: 50%;"></span>
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
            <span id="model">--</span>
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
}
