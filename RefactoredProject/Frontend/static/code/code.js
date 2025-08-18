
export const socket = io();
socket.on("connect", () => {
    console.log("Connected with Server");
});

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
};

/**
 * toggles the visibility of an widget
 * @param elementKey: name of the item <items-member>
 * @param show: display of hide the widget
 */
function toggleItemVisibility(elementKey, show = false) {
    if (!items[elementKey]) return;
    items[elementKey].style.display = show ? "flex" : "none";
}


/**
 * toggles the settings-container
 */
function toggleSettings() {
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
            clearSubPanel();
        }, 400);
        Object.values(widgets).forEach(widget => {
            if(widget) widget.style.display="none";
        });
        document.getElementById("settingsHeadline").innerText = "Einstellungsmenü:";
    }
}


/**
 * opens a subpanel (makes a specific list of items visible)
 */
function openSubPanel(type, pItem) {
    const headline = document.getElementById('settingsHeadline');

    Object.values(widgets).forEach(widget => {
        if(widget) widget.style.display = "none";
    });
    
    if(type === "System"){
        if(widgets.system) widgets.system.style.display="block";
        if(widgets.display) widgets.display.style.display="block";
    } else if (type === "Verbindungen"){
        if(widgets.wifi) widgets.wifi.style.display="block";
        if(widgets.bt) widgets.bt.style.display="block";
    } else if (type === "Widgets"){
        if(widgets.vsettings) widgets.vsettings.style.display="block";
    }
    headline.innerText = type;

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    if(pItem) pItem.classList.add('active');
}






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
