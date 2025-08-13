const items = {
    "audio": document.getElementById('audio-widget'),
    "map": document.getElementById('map-widget'),
    "time": document.getElementById('time-widget'),
    "clock": document.getElementById('clock-widget')
};

function toggleItemVisibility(elementKey, show = false) {
    if (!items[elementKey]) return;
    items[elementKey].style.display = show ? "flex" : "none";
}


function toggleSettings(){
    const panel = document.getElementById('settings');
    const container = document.getElementById('widget-container');

    const isVisible = panel.classList.contains('show');

    if (!isVisible) {
        panel.style.display = "flex";
        
        requestAnimationFrame(() => {
            panel.classList.add('show');

            setTimeout(() => {
                panel.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            }, 50);
        });
    } else {
        panel.classList.remove('show');

        setTimeout(() => {
            panel.style.display = "none";
            panel.removeEventListener('transitionend', handler);
        }, 400);
    }
}

