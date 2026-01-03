
import { systemService, wifiService } from "../services/settings.service.js";

//Mapping functions
function mapVersion(apiData) {
  return {
    commit: apiData.commit ?? null,
    date: apiData.date ?? null,
    branch: apiData.branch ?? null,
    dirty: apiData.dirty ?? false,
  };
}
function mapWifiStatus(apiData) {
  return {
    power: apiData.power,
    state: apiData.state,
    ip: apiData.ip ?? null,
    ssid: apiData.ssid ?? null,
    signal: apiData.signal ?? null,
  }
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



//Wifi Rendering functions
export function renderScannedNetworks(root, networks) {
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
    button.dataset.action = "wifi-connect";
    if(ssid) button.dataset.ssid = ssid;
    button.disabled = !ssid;

    li.appendChild(label);
    li.appendChild(button);
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

    if (ssid === connectedSsid) {
      button.textContent = "Disconnect";
      button.dataset.action = "wifi-disconnect";
      button.dataset.ssid = ssid;
      button.disabled = false;
    } else {
      button.textContent = "Not connected";
      button.disabled = true;
    }
    li.appendChild(label);
    li.appendChild(button);
    list.appendChild(li);
  });
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
  addDetailsEventListener(root);
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
function addDetailsEventListener(root) {
  const btToggle    = root.querySelector("#bluetoothToggle");
  const btDetails   = root.querySelector("#bluetoothDetails");
  const wifiToggle  = root.querySelector("#wifiToggle");
  const wifiDetails = root.querySelector("#wifiDetails");
  btToggle?.addEventListener("change", () => syncDetails(btToggle, btDetails));
  wifiToggle?.addEventListener("change", () => syncDetails(wifiToggle, wifiDetails));
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
}