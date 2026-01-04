
import { systemService, wifiService, bluetoothService } from "../services/settings.service.js";

//Mapping functions -> settings
function mapVersion(apiData) {
  return {
    commit: apiData.commit ?? null,
    date: apiData.date ?? null,
    branch: apiData.branch ?? null,
    dirty: apiData.dirty ?? false,
  };
}
//Mapping functions -> wifi
function mapWifiStatus(apiData) {
  return {
    power: apiData.power,
    state: apiData.state,
    ip: apiData.ip ?? null,
    ssid: apiData.ssid ?? null,
    signal: apiData.signal ?? null,
  };
}
function mapKnownNetworks(apiData) {
  return {
    knownNetworks: apiData.knownNetworks ?? [],
  };
}
function mapScannedNetworks(apiData) {
  return {
    scannedNetworks: apiData.scannedNetworks ?? [],
  };
}
//Mapping functions -> bluetooth
function mapBluetoothStatus(apiData) {
  return {
    power: apiData.powered,
    visibility: apiData.discoverable,
    connectedDeviceName: apiData.connectedDeviceName ?? null,
    connectedDeviceMac: apiData.connectedDeviceMac ?? null,

  };
}
function mapKnownBluetoothDevices(apiData) {
  return {
    pairedDevices: apiData.pairedDevices ?? [],
  };
}
function mapScannedBluetoothDevices(apiData) {
  return {
    scannedDevices: apiData.scannedDevices ?? [],
  };
}


//Settings functions
export async function refreshSoftwareVersion(store) {
  const version = await systemService.version();
  store.setSlice("software", mapVersion(version));
}


//Wifi functions
export async function refreshWifi(store) {
  const [status, known] = await Promise.all([
    wifiService.getWifiStatus(),
    wifiService.getKnownWifi(),
  ]);
  store.setSlice("network", mapWifiStatus(status));
  store.setSlice("network", mapKnownNetworks(known));
}
export async function scanWifi(store) {
  const scan = await wifiService.scanWifi();
  store.setSlice("network", mapScannedNetworks(scan));
}

//Bluetooth functions
export async function refreshBluetooth(store) {
  const [status, known] = await Promise.all([
    bluetoothService.getBluetoothStatus(),
    bluetoothService.getKnownDevices(),
  ]);
  store.setSlice("bluetooth", mapBluetoothStatus(status));
  store.setSlice("bluetooth", mapKnownBluetoothDevices(known));
}
export async function scanBluetooth(store) {
  const scan = await bluetoothService.scanBluetooth();
  store.setSlice("bluetooth", mapScannedBluetoothDevices(scan));
}



//Wifi Rendering functions
export function renderScannedNetworks(root, networks, connectedSsid) {
  const list = root.querySelector("#wifiScanList");
  if(!list) return;

  list.innerHTML = "";
  if(!Array.isArray(networks) || networks.length === 0) {
    list.appendChild(createEmptyItem("No networks available"));
    return;
  }
  networks.forEach(({ ssid, signal }) => {
    const li = document.createElement("li");
    li.className = "details-item";
    const label = document.createElement("span");
    label.className = "details-item__label";
    const safeSsid = ssid || "<hidden>";
    label.textContent = safeSsid;
    const button = document.createElement("button");
    button.className = "details-btn";
    button.type = "button";
    button.textContent = "Connect";
    button.dataset.action = "wifi-connect-new";
    button.classList.add("connect");
    if(ssid) button.dataset.ssid = ssid;
    button.disabled = !ssid;

    li.appendChild(label);
    if(ssid != connectedSsid) li.appendChild(button);
    list.appendChild(li);
  })
}

export function renderKnownNetworks(root, networks, connectedSsid) {
  const list = root.querySelector("#wifiConnectedList");
  if (!list) return;
  list.innerHTML = "";
  if (!Array.isArray(networks) || networks.length === 0) {
    list.appendChild(createEmptyItem("No known networks"));
    return;
  }
  networks.forEach(({ ssid }) => {
    const li = document.createElement("li");
    li.className = "details-item";

    const label = document.createElement("span");
    label.className = "details-item__label";
    label.textContent = ssid;

    const button = document.createElement("button");
    button.className = "details-btn";
    button.type = "button";

    const conBtn = document.createElement("button");
    conBtn.className = "details-btn";
    conBtn.type = "button";
    conBtn.textContent = "Connect";
    conBtn.dataset.action = "wifi-connect-known";
    conBtn.dataset.ssid = ssid;
    conBtn.disabled = false;
    conBtn.classList.add("connect");

    if (ssid === connectedSsid) {
      button.textContent = "Disconnect";
      button.dataset.action = "wifi-disconnect";
      button.dataset.ssid = ssid;
      button.disabled = false;
      button.classList.add("disconnect");
    } else {
      button.textContent = "Not connected";
      button.disabled = true;
    }
    li.appendChild(label);
    li.appendChild(button);
    if(!connectedSsid) li.appendChild(conBtn);
    list.appendChild(li);
  });
}

export function renderKnownBluetoothDevices(root, devices, connectedDevices) {
  console.log("known devices: ", devices);
}
export function renderScannedDevices(root, devices, connectedDevices) {
  console.log("scanned devices: ", devices);
}

function createEmptyItem(text) {
  const li = document.createElement("li");
  li.className = "details-item";

  const label = document.createElement("span");
  label.className = "details-item__label";
  label.textContent = text;

  li.appendChild(label);
  return li;
}


//add Event Listener
export function addAllEventListeners(root, store) {
  addDetailsEventListener(root, store);
  addSystemEventListener(root);
  addFunctionalEventListener(root, store);
}

function addSystemEventListener(root){
  const powerBtn    = root.querySelector("#shutdownBtn");
  const restartBtn  = root.querySelector("#restartBtn");
  const updateBtn   = root.querySelector("#updateBtn");
  powerBtn?.addEventListener("click", () => shutdownSystem(root));
  restartBtn?.addEventListener("click", () => restartSystem(root));
  updateBtn?.addEventListener("click", () => updateSystem(root));
}
function addDetailsEventListener(root, store) {
  const btToggle    = root.querySelector("#bluetoothToggle");
  const btDetails   = root.querySelector("#bluetoothDetails");
  const wifiToggle  = root.querySelector("#wifiToggle");
  const wifiDetails = root.querySelector("#wifiDetails");
  btToggle?.addEventListener("change", () => syncDetails(btToggle, btDetails));
  wifiToggle?.addEventListener("change", async () => {
    if(!wifiToggle) return;
    const enabled = wifiToggle.checked;
    syncDetails(wifiToggle, wifiDetails);
    wifiToggle.disabled = true;

    try {
      await wifiService.toggleWifi(enabled);
      await refreshWifi(store);
    } catch (e) {
      console.error("Failed to toggle Wifi power:", e);
      wifiToggle.checked = !enabled;
      syncDetails(wifiToggle, wifiDetails);
    } finally {
      wifiToggle.disabled = false;
    }
  });
  syncDetails(btToggle, btDetails);
  syncDetails(wifiToggle, wifiDetails);
}
export const syncDetails = (toggleEl, detailsEl) => {
    if (!toggleEl || !detailsEl) return;
    const open = !!toggleEl.checked;
    detailsEl.classList.toggle("is-open", open);
    detailsEl.setAttribute("aria-hidden", String(!open));
  };
function addFunctionalEventListener(root, store) {
  const wifiScanBtn = root.querySelector("#wifiScanBtn");
  wifiScanBtn?.addEventListener("click", () => scanWifi(store));

  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;

    const action = btn.dataset.action;
    const ssid = btn.dataset.ssid;
    
    try {
      switch (action) {
        case "wifi-disconnect":
          if(!ssid) return;
          btn.disabled = true;
          await wifiService.disconnectWifi(ssid);
          await refreshWifi(store);
          break;
        case "wifi-connect-known":
          if(!ssid) return;
          btn.disabled = true;
          await wifiService.connectWifi(ssid);
          await refreshWifi(store);
          break;
        case "wifi-connect-new":
          if(!ssid) return;
          btn.disabled = true;
          //request password
          await wifiService.connectWifi(ssid);
          await refreshWifi(store);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Wifi action failed:", err);
    } finally {
      btn.disabled = false;
    }
  });
}