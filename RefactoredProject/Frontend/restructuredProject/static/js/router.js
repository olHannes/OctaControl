// js/router.js
export function initRouter() {
  const buttons = document.querySelectorAll(".nav-btn");
  const views = {
    dashboard: document.querySelector("#view-dashboard"),
    audio: document.querySelector("#view-audio"),
    navi: document.querySelector("#view-navi"),
    sensors: document.querySelector("#view-sensors"),
    settings: document.querySelector("#view-settings"),
  };

  function show(name) {
    for (const [k, el] of Object.entries(views)) {
      el.classList.toggle("active", k === name);
    }
    buttons.forEach(b => b.classList.toggle("active", b.dataset.view === name));

    window.dispatchEvent(new CustomEvent("view:shown", { detail: { view: name }}));
  }

  buttons.forEach(btn => btn.addEventListener("click", () => show(btn.dataset.view)));

  return { show, views };
}
