import { load, save } from "./utils/storage_handler.js";

const items = {
    "audio": document.getElementById('audio-widget'),
    "map": document.getElementById('map-widget'),
    "time": document.getElementById('time-widget'),
    "clock": document.getElementById('clock-widget'),
    "relais": document.getElementById('relais-widget')
};

const widgets = {
        system: subPanel.querySelector('system-widget'),
        wifi: subPanel.querySelector('wifi-setup-widget'),
        bt: subPanel.querySelector('bt-setup-widget'),
        vsettings: subPanel.querySelector('vsettings-widget'),
        display: subPanel.querySelector('display-widget'),
        audio: subPanel.querySelector('audio-widget'),
        color: subPanel.querySelector('color-widget'),
};


/**
 * toggles the visibility of an widget
 * @param elementKey: name of the item <items-member>
 * @param show: display of hide the widget
 */
export function toggleItemVisibility(elementKey, show = false) {
    if (!items[elementKey]) return;
    items[elementKey].style.display = show ? "flex" : "none";
}
window.toggleItemVisibility = toggleItemVisibility;



/**
 * toggles the settings-container
 */
export function toggleSettings() {
    const panel = document.getElementById('settings');
    const isVisible = panel.classList.contains('show');

    if (!isVisible) {
        panel.style.display = 'flex';
        requestAnimationFrame(() => {
            panel.classList.add('show');
            setTimeout(() => {
                panel.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            }, 50);
        });
    } else {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.style.display = 'none';
        }, 400);
        Object.values(widgets).forEach(widget => {
            if(widget) widget.style.display="none";
        });
        document.getElementById("settingsHeadline").innerText = "Einstellungsmenü:";
    }
}
window.toggleSettings = toggleSettings;



/**
 * opens a subpanel (makes a specific list of items visible)
 */
export function openSubPanel(type, pItem) {
    const headline = document.getElementById('settingsHeadline');

    Object.values(widgets).forEach(widget => {
        if(widget) widget.style.display = "none";
    });
    
    if(type === "System"){
        if(widgets.system) widgets.system.style.display="block";
        if(widgets.color) widgets.color.style.display="block";
        if(widgets.display) widgets.display.style.display="block";
    } else if (type === "Verbindungen"){
        if(widgets.wifi) widgets.wifi.style.display="block";
        if(widgets.bt) widgets.bt.style.display="block";
    } else if (type === "Widgets"){
        if(widgets.vsettings) widgets.vsettings.style.display="block";
    } else if (type === "Audio"){
        if(widgets.audio) widgets.audio.style.display="block";
    }

    headline.innerText = type;

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    if(pItem) pItem.classList.add('active');
}
window.openSubPanel = openSubPanel;



/**
 * updates the Internet Icon
 */
function updateInternetIcon(isOnline) {
    const icon = document.getElementById("internetStatus");
    if (!icon) return;

    if(isOnline){
        icon.classList.remove("offline");
    }else{
        icon.classList.add("offline");
    }
}

async function checkInternetConnection() {
    try {
        const response = await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            cache: "no-store",
            mode: "no-cors"
        });
        updateInternetIcon(true);
    } catch (err) {
        updateInternetIcon(false);
    }
}
setInterval(checkInternetConnection, 5000);
checkInternetConnection();



/**
 * handles touch gestures and opens / closes the sidebar
 */

function openSidebar() {
    document.getElementById("leftSidebar").classList.add("active");
    document.getElementById("widget-container").style.filter = "blur(5px)";
}

function closeSidebar() {
    document.getElementById("leftSidebar").classList.remove("active");
    document.getElementById("widget-container").style.filter = "blur(0px)";
}

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("leftSidebar");
    let startX = 0;
    let currentX = 0;
    let endX = 0;
    let isSwipingSidebar = false;

    document.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;

        if (sidebar.classList.contains("active")) {
            isSwipingSidebar = true;
        }
    });
    document.addEventListener("touchmove", (e) => {
        if (isSwipingSidebar) {
            currentX = e.touches[0].clientX;

            if (currentX < startX) {
                e.preventDefault();
            }
        }
    }, { passive: false });
    document.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        isSwipingSidebar = false;
    });

    function handleSwipe() {
        let diffX = endX - startX;

        if (startX < 50 && diffX > 80) {
            openSidebar();
        }

        if (diffX < -80 && sidebar.classList.contains("active")) {
            closeSidebar();
        }
    }


    //setup inner sidebar listeners
    const wifiIcon = document.getElementById('internetStatus');
    if(wifiIcon) 
        wifiIcon.addEventListener("click", () => {
            toggleSettings(); 
            openSubPanel('Verbindungen'); 
            closeSidebar();
        });
    const btIcon = document.getElementById('bt_indicator');
    if(btIcon)
        btIcon.addEventListener("click", () => {
            toggleSettings();
            openSubPanel('Verbindungen');
            closeSidebar();
        });
});



/**
 * setup of time / clock toggle 
 */
document.addEventListener("DOMContentLoaded", () => {
    const clock = document.getElementById("clock-widget");
    const time = document.getElementById("time-widget");

    let expanded = load("TIMER_WIDGET");

    if(!expanded){
        clock.style.height = "96%";
        time.classList.remove("visible");
    } else {
        clock.style.height = "51%";
        time.classList.add("visible");
    }

    clock.addEventListener("click", () => {
        expanded = !expanded;
        save("TIMER_WIDGET", expanded);
        if (expanded) {
            clock.style.height = "51%";
            time.classList.add("visible");
        } else {
            clock.style.height = "96%";
            time.classList.remove("visible");
        }
    });
});


/**
 * play touch audio
 */
let touchAudioBuffer = [];

document.addEventListener("DOMContentLoaded", () => {
    const soundFiles = ["touch_1.mp3", "touch_2.mp3", "touch_3.mp3"];
    soundFiles.forEach(file => {
        const audio = new Audio(`../static/sounds/${file}`);
        audio.preload = "auto";
        touchAudioBuffer.push(audio);
    });
});


document.addEventListener("click", () => {
    const index = load("TOUCH_SOUND") ?? 0;
    const systemVolume = load("SYSTEM_VOLUME") ?? 50;

    if (touchAudioBuffer[index]) {
        const touchAudio = touchAudioBuffer[index].cloneNode(true);
        touchAudio.volume = systemVolume / 100;
        touchAudio.play().catch(err => console.log("Touch-Sound blockiert:", err));
    }
});