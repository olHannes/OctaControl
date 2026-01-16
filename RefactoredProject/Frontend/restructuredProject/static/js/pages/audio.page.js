// js/pages/audio.page.js
import { audioService, bluetoothAudioService, fmAudioService } from "../services/audio.service.js";
import * as audioHandler from "../features/audio-page-handling.js";








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
}


function renderFmRadio(root, data) {
  console.log("data in render fm", data);
}


export async function renderAudio(root, store) {
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


          <section class="panel panel--fm" role="tabpanel" data-panel="fm" hidden>
            <header>
              <div>
                <span class="fm-freq">95.7</span>
                <p class="fm-unit">MHZ</p>
                <button type="button" class="icon icon--favorite fm-favorite" aria-pressed="false"></button>
              </div>
              <span class="fm-name">Scanning...</span>
            </header>

            <div class="fm-freq-view">
              <input type="range" class="range fm-range" disabled=true min=0 max=100></input>
              <div class="fm-freq-bounds">
                <p class="freq-min">00.0</p>
                <p class="freq-max">000.0</p>
              </div>
            </div>

            <div class="fm-control">
            </div>

            <div class="fm-favorites-container">
              <div class="fm-favorites-title-block">
                <span class="icon icon--favorite"></span>
                <p class="fm-favorites-title">Favorites</p>
              </div>
              <div class="fm-favorites">
              
              </div>
            </div>

            <div class="fm-presets-container">
              <p class="fm-presets-title">Quick Presets</p>
              <div class="fm-presets">
                
              </div>
            </div>
          
            <div class="volume--container">
              <span class="loudness icon volume--icon-on"></span>
              <input type="range" class="range volume--slider" min=0 max=100 step=2></input>
              <span class="volume--display">0%</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  `;
  
  audioHandler.addAudioEventListener(root, store);
  
  const fmPanel = root.querySelector('[data-panel="fm"]');
  const btPanel = root.querySelector('[data-panel="bt"]');
  
  store.subscribeSelector(s => s.bt_audio, (l) => {
    if(!l) return;
    renderBluetooth(btPanel, l);
  });

  store.subscribeSelector(s => s.fm_audio, (l) => {
    if(!l) return;
    renderFmRadio(fmPanel, l);
  });
  
  await audioHandler.loadInitialData(store).catch(console.error);
  audioHandler.applyActiveSourceUI(root, store);
}
