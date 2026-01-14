import { audioService, bluetoothAudioService, fmAudioService } from "../services/audio.service.js";
import { withBusy } from "../features/panelLock.js";

/*
* initial loading
*/
export async function loadInitialData(store) {
  await loadInitialSource(store);
  loadInitialBt(store);
  loadInitialFm(store);
}
async function loadInitialBt(store) {
  const data = await bluetoothAudioService.state();
  store.setSlice("bt_audio", data);
}
async function loadInitialFm(store) {
  const data = await fmAudioService.state();
  store.setSlice("fm_audio", data);
}
async function loadInitialSource(store) {
  const data = await audioService.get();
  store.setSlice("system", {audioSource: data.activeSource});
}



// apply tab ui
export function applyActiveSourceUI(root, store) {
  const btTab = root.querySelector(".audio .tab--bt");
  const fmTab = root.querySelector(".audio .tab--fm");
  const btPanel = root.querySelector('[data-panel="bt"]');
  const fmPanel = root.querySelector('[data-panel="fm"]');

  const storedSource = store?.getState().system;

  const isBt = storedSource?.audioSource === "bluetooth";
  btTab?.classList.toggle("is-active", isBt);
  fmTab?.classList.toggle("is-active", !isBt);

  btPanel && (btPanel.hidden = !isBt);
  fmPanel && (fmPanel.hidden = isBt);

  btTab?.setAttribute("aria-selected", String(isBt));
  fmTab?.setAttribute("aria-selected", String(!isBt));
}



/*
* Event Listener Handling
*/
export function addAudioEventListener(root, store) {
  addAudioTabSwitchListeners(root, store);
  addBtEventListener(root, store);
  addFmEventListener(root, store);
}

//Audio Tab Switch
function uiToBackendSource(tab) {
  if (tab === "bt") return "bluetooth";
  if (tab === "fm") return "radio";
  return null;
}
function addAudioTabSwitchListeners(root, store) {
  const tabsEl = root.querySelector(".audio__tabs");
  const cardEl = root.querySelector(".audio .card");
  if(!tabsEl) return;

  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    
    const target = uiToBackendSource(btn.dataset.tab);
    if(!target) return;

    withBusy(cardEl, async () => {
      const status = store.getState().system;
      const current = status?.audioSource;
      if(!current || current === target) return;

      await audioService.switchSource(current, target);
      const freshStatus = await audioService.get();
      store.setSlice("system", {audioSource: freshStatus.activeSource});

      if(freshStatus.activeSource === "bluetooth") {
        const bt = await bluetoothAudioService.state();
        store.setSlice("bt_audio", bt);
      } else if (freshStatus.activeSource === "radio") {
        const fm = await fmAudioService.state();
        store.setSlice("fm_audio", fm);
      }
      applyActiveSourceUI(root, store);
    }).catch(console.error);
  });
}

// Bluetooth Page
function addBtEventListener(root, store) {
  const btPanel = root.querySelector('[data-panel="bt"]');
  if (!btPanel) return;

  const playToggle = btPanel.querySelector(".bluetooth--toggle");
  const btnPrev = btPanel.querySelector(".bluetooth--previous");
  const btnSkip = btPanel.querySelector(".bluetooth--skip");
  const posSlider = btPanel.querySelector(".bluetooth--position");
  const volSlider = btPanel.querySelector(".volume--slider");

    // --- Play / Pause ---
  playToggle?.addEventListener("click", () => {
    withBusy(btPanel, async () => {
      const state = store.getState().bt_audio;
      if(!state) return;
      if(state.playing) {
        await bluetoothAudioService.pause();
      } else {
        await bluetoothAudioService.play();
      }

      const fresh = await bluetoothAudioService.state();
      store.setSlice("bt_audio", fresh);
    }).catch(console.error);
  });

  // --- Previous ---
  btnPrev?.addEventListener("click", () => {
    withBusy(btPanel, async () => {
      await bluetoothAudioService.previous();
      const fresh = await bluetoothAudioService.state();
      store.setSlice("bt_audio", fresh);
    }).catch(console.error);
  });

  // --- Skip ---
  btnSkip?.addEventListener("click", () => {
    withBusy(btPanel, async () => {
      await bluetoothAudioService.skip();
      const fresh = await bluetoothAudioService.state();
      store.setSlice(fresh);
    }).catch(console.error);
  });

  // --- Position Slider (SEEK) ---
  posSlider?.addEventListener("change", (e) => {
    withBusy(btPanel, async () => {
      const state = store.getState().bt_audio;
      if (!state?.durationMs) return;

      const percent = Number(e.target.value);
      const positionMs = Math.round(
        (percent/100)*state.durationMs
      );
      
      await bluetoothAudioService.updatePosition({positionMs});
      const fresh = bluetoothAudioService.state();
      store.setSlice("bt_audio", fresh);
    }).catch(console.error);
  });

  // --- Volume ---
  volSlider?.addEventListener("change", async (e) => {
    const volume = Number(e.target.value);

    try {
      await bluetoothAudioService.updateVolume({ volume });
      const fresh = await bluetoothAudioService.state();
      store.setSlice("bt_audio", fresh);
    } catch (err) {
      console.error("BT volume failed", err);
    }
  });
}

function addFmEventListener(root, store) {

}