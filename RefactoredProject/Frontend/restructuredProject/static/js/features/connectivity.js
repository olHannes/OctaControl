
//Wifi Section 
//#######################################################################################
/**Rendering of Network lists */
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
    label.textContent = ssid;
    const button = document.createElement("button");
    button.className = "details-btn";
    button.type = "button";
    button.textContent = "Connect";
    button.dataset.ssid = ssid;
    button.dataset.action = "wifi-connect";
    button.disabled = false;

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