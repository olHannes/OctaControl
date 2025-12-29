// js/pages/audio.page.js
export function renderAudio(root, store, wsHub) {
  root.innerHTML = `
    <div class="card">
      <div class="card-title">Now Playing</div>
      <div class="big" id="title">--</div>
      <div id="artist" style="color: var(--muted); margin-bottom: 12px;">--</div>

      <div style="display:flex; gap:10px;">
        <button class="nav-btn" id="prev">⏮</button>
        <button class="nav-btn" id="play">⏯</button>
        <button class="nav-btn" id="next">⏭</button>
      </div>
    </div>
  `;

  root.querySelector("#prev").addEventListener("click", () => wsHub.send("audio:control", { action: "prev" }));
  root.querySelector("#play").addEventListener("click", () => wsHub.send("audio:control", { action: "toggle" }));
  root.querySelector("#next").addEventListener("click", () => wsHub.send("audio:control", { action: "next" }));

  store.subscribe((s) => {
    const t = s.audio?.title ?? "--";
    const a = s.audio?.artist ?? "--";
    root.querySelector("#title").textContent = t;
    root.querySelector("#artist").textContent = a;
  });
}
