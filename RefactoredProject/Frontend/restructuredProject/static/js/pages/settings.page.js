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
            <span>Connect to audio devices</span>
          </div>
          <input type="checkbox" id="bluetoothToggle" checked />
        </div>

        <div class="panel">
          <div class="icon-wrapper">
            <span class="icon icon--network"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Wi-Fi</h3>
            <span>Connect to wireless networks</span>
          </div>
          <input type="checkbox" id="wifiToggle"/>
        </div>

        <span class="subheading">System</span>

        <div class="panel">
          <div class="icon-wrapper">
            <span class="icon icon--network"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>System Update</h3>
            <span>Check for Updates</span>
          </div>
          <span>\></span>
        </div>

        <div class="panel">
          <div class="icon-wrapper">
            <span class="icon icon--network"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Restart</h3>
            <span>Restart the infotainment system</span>
          </div>
          <span>\></span>
        </div>

        <div class="panel">
          <div class="icon-wrapper">
            <span class="icon icon--network"></span>
          </div>
          <div class="vertical-container align-left">
            <h3>Shutdown</h3>
            <span>Power off the system</span>
          </div>
          <span>\></span>
        </div>
      </div>
    </section>
  `;
}
