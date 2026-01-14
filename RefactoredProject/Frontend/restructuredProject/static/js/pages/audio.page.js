// js/pages/audio.page.js
import { audioService, bluetoothAudioService, fmAudioService } from "../services/audio.service.js";
import { withBusy } from "../features/panelLock.js";

export async function loadInitialBt(store) {
  const data = await bluetoothAudioService.state();
  store.setSlice("bt_audio", data);
}
export async function loadInitialFm(store) {
  const data = await fmAudioService.state();
  store.setSlice("fm_audio", data);
}

export async function loadInitialData(store) {
  const data = await audioService.get();
  console.log(data.activeSource);
  if(data && data.activeSource === "bluetooth") {
    loadInitialBt(store);
  }else if(data && data.activeSource === "radio") {
    loadInitialFm(store);
  }
}



export function addBtEventListener(root, store) {
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



function formatMs(ms) {
  if (ms == null || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  if(hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function renderBluetooth(root, data) {
  const btTab = document.querySelector(".audio .tab--bt");
  const fmTab = document.querySelector(".audio .tab--fm");
  const btTitle = root.querySelector(".song-title");
  const btArtist = root.querySelector(".song-artist");
  const btDevice = root.querySelector(".song-device");
  const btPositionSlider = root.querySelector(".bluetooth--position");
  const btPositionCurrent = root.querySelector(".bluetooth--position-current");
  const btPositionDuration = root.querySelector(".bluetooth--position-duration");
  const btAudioToggle = root.querySelector(".bluetooth--toggle");
  const btAudioToggleWrapper = root.querySelector(".bluetooth--toggle-wrapper");
  const btVolumeIcon = root.querySelector(".loudness");
  const btVolumeSlider = root.querySelector(".volume--slider");
  const btVolumeDisplay = root.querySelector(".volume--display");

  btTitle && (btTitle.innerText = data.title ?? "Not provided");
  btArtist && (btArtist.innerText = data.artist ?? "Not provided");
  btDevice && (btDevice.innerText = data.device ?? "Not provided");
  btPositionCurrent && (btPositionCurrent.innerText = data.positionMs ?? 0);
  btPositionDuration && (btPositionDuration.innerText = data.durationMs ?? 0);
  btVolumeDisplay && (btVolumeDisplay.innerText = (data.volume ?? 0) + "%");
  btVolumeSlider && (btVolumeSlider.value = data.volume ?? 30);

  if (btPositionCurrent) {
    btPositionCurrent.innerText = formatMs(data.positionMs);
  }
  if (btPositionDuration) {
    btPositionDuration.innerText = formatMs(data.durationMs);
  }

  if (btPositionSlider) {
    const pos = data.positionMs ?? 0;
    const dur = data.durationMs ?? 0;

    const percent = dur > 0
      ? Math.min(100, Math.max(0, Math.round((pos / dur) * 100)))
      : 0;
    
    btPositionSlider.value = percent;
  }

  if(btVolumeIcon) {
    if(data.volume === 0) {
      btVolumeIcon.classList.toggle("volume--icon-muted", true);
      btVolumeIcon.classList.toggle("volume--icon-on", false);
    } else {
      btVolumeIcon.classList.toggle("volume--icon-muted", false);
      btVolumeIcon.classList.toggle("volume--icon-on", true);
    }
  }
  if (btAudioToggle) {
    if (data.playing === true) {
      btAudioToggle.classList.add("is-playing");
      btAudioToggle.classList.remove("is-paused");
    } else {
      btAudioToggle.classList.add("is-paused");
      btAudioToggle.classList.remove("is-playing");
    }
  }
  if (btAudioToggleWrapper) {
    if (data.playing === true) {
      btAudioToggleWrapper.classList.add("is-playing");
      btAudioToggleWrapper.classList.remove("is-paused");
    } else {
      btAudioToggleWrapper.classList.add("is-paused");
      btAudioToggleWrapper.classList.remove("is-playing");
    }
  }
  if(btTab && fmTab) {
    btTab.classList.toggle("is-active", true);
    fmTab.classList.toggle("is-active", false);
  }
}


function renderFmRadio(root, data) {
  const btTab = document.querySelector(".audio .tab--bt");
  const fmTab = document.querySelector(".audio .tab--fm");

  if(btTab && fmTab) {
    fmTab.classList.toggle("is-active", true);
    btTab.classList.toggle("is-active", false);
  }
}


export function renderAudio(root, store) {
  root.innerHTML = `
    <section class="audio">
      <div class="card">
        <header class="audio__tabs" role="tablist" aria-label="Audio Quellen">
          <button class="tab tab--bt" role="tab" data-tab="bt" aria-selected="true">
            <span class="icon icon--bluetooth"></span>
            <span>Bluetooth</span>
          </button>

          <button class="tab--fm tab" role="tab" data-tab="fm" aria-selected="false">
            <span class="icon icon--radio"></span>
            <span>FM Radio</span>
          </button>
        </header>

        <div class="audio__body">
          <section class="panel panel--bt" role="tabpanel" data-panel="bt">
            <div class="current--song">
            
            <div class="song-image-box is-placeholder">
              <div class="placeholder-icon">♪</div>
            </div>

              <div class="vertical-container">
                <h3 class="song-title">Title Placeholder</h3>
                <p class="song-artist">Artist Placeholder</p>
                <p class="song-device">Device Placeholder</p>
              </div>
            </div>
            <div class="position--marker">
              <input type="range" class="range bluetooth--position" min=0 max=100 step=1></input>
              <div class="position--description">
                <span class="bluetooth--position-current">0:00</span>
                <span class="bluetooth--position-duration">0:00</span>
              </div>
            </div>
            <div class="bluetooth--controller">
              <button class="icon bluetooth--previous" type="button" aria-label="Previous"></button>
              <div class="bluetooth--toggle-wrapper">
                <button class="icon bluetooth--toggle" type="button" aria-label="Play/Pause"></button>
              </div>
              <button class="icon bluetooth--skip" type="button" aria-label="Skip"></button>
            </div>
            <div class="volume--container">
              <span class="loudness icon volume--icon-on"></span>
              <input type="range" class="range volume--slider" min=0 max=100 step=2></input>
              <span class="volume--display">0%</span>
            </div>
          </section>
          <section class="panel panel--fm" role="tabpanel" data-panel="fm" hidden></section>
        </div>
      </div>
    </section>
  `;
  
  addBtEventListener(root, store);

  const btPanel = root.querySelector('[data-panel="bt"]');
  const fmPanel = root.querySelector('[data-panel="fm"]');

  root.querySelector(".audio__tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    btn.classList.toggle("is-active");
    //store.dispatch({ type: "AUDIO_SET_TAB", tab: btn.dataset.tab });
  });

  store.subscribeSelector(s => s.bt_audio, (l) => {
    if(!l) return;
    renderBluetooth(btPanel, l);
  });
  store.subscribeSelector(s => s.fm_audio, (l) => {
    if(!l) return;
    renderFmRadio(fmPanel, l);
  });

  loadInitialData(store).catch(console.error);

}
