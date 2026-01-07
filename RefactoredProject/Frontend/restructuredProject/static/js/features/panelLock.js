
function lockPanel(panel) {
  if (!panel) return;
  panel.classList.add("is-busy");
  panel.setAttribute("aria-busy", "true");
}

function unlockPanel(panel) {
  if (!panel) return;
  panel.classList.remove("is-busy");
  panel.removeAttribute("aria-busy");
}

export async function withBusy(panelEl, fn) {
    lockPanel(panelEl);
    try {
        return await fn();
    } finally {
        unlockPanel(panelEl);
    }
}