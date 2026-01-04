
import { systemService, wifiService, bluetoothService } from "../services/settings.service.js";
import { shutdownSystem, restartSystem, updateSystem } from "../pages/settings.page.js";

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
  const list = root.querySelector("#bluetoothPairedList");
  if(!list) return;
  list.innerHTML = "";
  if (!Array.isArray(devices) || devices.length === 0) {
    list.appendChild(createEmptyItem("No paired devices"));
    return;
  }
  devices.forEach(({address, name}) => {
    const li = document.createElement("li");
    li.className = "details-item";

    const label = document.createElement("span");
    label.className = "details-item__label";
    label.textContent = name ?? "<unknown>";

    const button = document.createElement("button");
    button.className = "details-btn";
    button.type = "button";

    const conBtn = document.createElement("button");
    conBtn.className = "details-btn";
    conBtn.type = "button";
    conBtn.textContent = "Connect";
    conBtn.dataset.action = "bluetooth-connect-paired";
    conBtn.dataset.address = address;
    conBtn.disabled = false;
    conBtn.classList.add("connect");

    if (address === connectedDevices) {
      button.textContent = "Disconnect";
      button.dataset.action = "bluetooth-disconnect";
      button.dataset.address = address;
      button.disabled = false;
      button.classList.add("disconnect");
    } else {
      button.textContent = "Not connected";
      button.disabled = true;
    }
    li.appendChild(label);
    li.appendChild(button);
    if(!connectedDevices) li.appendChild(conBtn);
    list.appendChild(li);
  });
}
export function renderScannedDevices(root, devices, connectedDevices) {
  const list = root.querySelector("#bluetoothScanList");
  if(!list) return;

  list.innerHTML = "";
  if(!Array.isArray(devices) || devices.length === 0) {
    list.appendChild(createEmptyItem("No Bluetooth devices available"));
    return;
  }
  devices.forEach(({address, name}) => {
    const li = document.createElement("li");
    li.className = "details-item";
    const label = document.createElement("span");
    label.className = "details-item__label";
    label.textContent = name ?? "<unknown>";
    const button = document.createElement("button");
    button.className = "details-btn";
    button.type = "button";
    button.textContent = "Pair";
    button.dataset.action = "bluetooth-pair-new";
    button.classList.add("connect");
    button.dataset.address = address;

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

  const bluetoothScanBtn = root.querySelector("#bluetoothScanBtn");
  bluetoothScanBtn?.addEventListener("click", () => scanBluetooth(store));

  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;

    const action = btn.dataset.action;
    const ssid = btn.dataset.ssid;
    const address = btn.dataset.address;
    
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
          openWifiKeyboard(root, store, ssid);
          //await wifiService.connectWifi(ssid);
          await refreshWifi(store);
          break;
        default:
          break;

        case "bluetooth-pair-new":
          if(!address) return;
          btn.disabled = true;
          await bluetoothService.pairDevice(address);
          await refreshBluetooth(store);
          break;
        case "bluetooth-connect-paired":
          if(!address) return;
          btn.disabled = true;
          await bluetoothService.connectDevice(address);
          await refreshBluetooth(store);
          break;
        case "bluetooth-disconnect":
          if(!address) return;
          btn.disabled = true;
          await bluetoothService.disconnectDevice(address);
          await refreshBluetooth(store);
          break;
      }
    } catch (err) {
      console.error("Wifi action failed:", err);
    } finally {
      btn.disabled = false;
    }
  });
}



//Keyboard functions
function ensureWifiKeyboard(root, store) {
  if (root.__wifiKeyboardInit) return;
  root.__wifiKeyboardInit = true;

  const overlay = root.querySelector(".keyboard-overlay");
  const input = root.querySelector("#wifiPasswordInput");
  const ssidLabel = root.querySelector("#keyboardSsid");
  const keyboard = root.querySelector("#wifiKeyboard");
  if (!overlay || !input || !ssidLabel || !keyboard) return;

  let isShift = false;

  const setShift = (on) => {
    isShift = on;
    const shiftKey = keyboard.querySelector(".key.shift");
    shiftKey?.classList.toggle("active", isShift);

    keyboard.querySelectorAll(".key").forEach((k) => {
      if (
        k.classList.contains("shift") ||
        k.classList.contains("backspace") ||
        k.classList.contains("space") ||
        k.classList.contains("symbol") ||
        k.classList.contains("action-connect") ||
        k.classList.contains("action-cancel")
      ) return;

      const t = k.textContent;
      k.textContent = on ? t.toUpperCase() : t.toLowerCase();
    });
  };

  const close = () => {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    input.value = "";
    root.__wifiKeyboardSsid = null;
    setShift(false);
  };

  const open = (ssid) => {
    root.__wifiKeyboardSsid = ssid;
    ssidLabel.textContent = `SSID: ${ssid ?? "—"}`;
    input.value = "";
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    input.focus();
    setShift(false);
  };

  root.__openWifiKeyboard = open;
  root.__closeWifiKeyboard = close;

  overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("keyboard-background")) close();
  });

  keyboard.addEventListener("click", async (e) => {
    const btn = e.target.closest("button.key");
    if (!btn) return;

    if (btn.classList.contains("shift")) {
      setShift(!isShift);
      return;
    }
    if (btn.classList.contains("backspace")) {
      input.value = input.value.slice(0, -1);
      return;
    }
    if (btn.classList.contains("space")) {
      input.value += " ";
      return;
    }
    if (btn.classList.contains("action-cancel")) {
      close();
      return;
    }
    if (btn.classList.contains("action-connect")) {
      const ssid = root.__wifiKeyboardSsid;
      const password = input.value;

      if (!ssid) return;
      //if (!password) return;

      try {
        await wifiService.connectWifi(ssid, password);
        await refreshWifi(store);
      } catch (err) {
        console.error("Wifi connect with password failed:", err);
      } finally {
        close();
      }
      return;
    }

    if (
      !btn.classList.contains("action-connect") &&
      !btn.classList.contains("action-cancel")
    ) {
      input.value += btn.textContent;
    }
  });
}

function openWifiKeyboard(root, store, ssid) {
  ensureWifiKeyboard(root, store);
  root.__openWifiKeyboard?.(ssid);
}