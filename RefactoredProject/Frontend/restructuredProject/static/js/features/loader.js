let counter = 0;
let loaderEl = null;

function getLoader() {
    if(!loaderEl) {
        loaderEl = document.getElementById("globalLoader");
    }
    return loaderEl;
}

function update() {
    const el = getLoader();
    if(!el) return;
    el.classList.toggle("is-visible", counter > 0);
}

export function showLoader() {
    counter++;
    update();
}

export function hideLoader() {
    counter = Math.max(0, counter - 1);
    update();
}