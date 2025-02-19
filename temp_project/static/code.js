/**function executed when the page is loaded -> initial loadings */
document.addEventListener ("DOMContentLoaded", () => {
	
    setVolumeSlider(getVolume());
    setBalanceSlider(getBalance());
    enableBt();  
    document.getElementById('colorSlider').value=39;
    updateBackgroundColor();
    setVersion();
    toggleTrunkPower();
    
    preloadImages([
        '../static/media/trunkPowerOn_img.png'
        ,'../static/media/trunkPowerOff_img.png'
        ,'../static/media/home_img.png'
        ,'../static/media/audioControl_img.png'
        ,'../static/media/settings_img.png'
        ,'../static/media/turnOn.png'
        ,'../static/media/turnOff.png'
        ,'../static/media/BTPairingOn.png'
        ,'../static/media/BTPairingOff.png'
        ,'../static/media/wlanOn.png'
        ,'../static/media/wlanOff.png'
        ,'../static/media/featureSettings.png'
    ]);
});


/**Function to load images*/
function preloadImages(imageArray) {
    imageArray.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
    showMessage("Bild Daten geladen", "Alle Bilddateien wurden erfolgreich geladen.");
}

/**function for sleepTimer*/
let sleepTimerTime = 0;
const sleepTimerDiv = document.getElementById('sleepTimer');
const sleepTimerSelect = document.getElementById('sleepTimerSelect');

function showSleepTimer() {
    if (sleepTimerTime > 0) {
        setTimeout(() => {
            sleepTimerDiv.style.display = 'block';
            sleepTimerDiv.addEventListener('pointerdown', hideSleepTimer);
        }, sleepTimerTime);
    }
}

function hideSleepTimer() {
    sleepTimerDiv.style.display = 'none';
    showSleepTimer();
}
document.getElementById('sleepTimer').addEventListener('pointerdown', hideSleepTimer);
showSleepTimer();

sleepTimerSelect.addEventListener('change', function () {
    sleepTimerTime = parseInt(sleepTimerSelect.value);

    if (sleepTimerTime === 0) {
        sleepTimerDiv.style.display = 'none';
        clearTimeout();
    } else {
        showSleepTimer();
    }
});


var logging=false;

/*function to show errors on the page*/
function showErrorMessage(title, message) {
    if(logging){
        var errorDiv = document.getElementById('errorMessage');
        var titleElement = errorDiv.querySelector('h6');
        var messageElement = errorDiv.querySelector('p');

        titleElement.textContent = title;
        messageElement.textContent = message;

        errorDiv.style.display = 'block';

        setTimeout(function() {
            errorDiv.style.display = 'none';
        }, 3500);
    }
}

/*function to show message on the page*/
function showMessage(title, message){
    var msgDiv = document.getElementById('messageNotification');
    var titleElement = msgDiv.querySelector('h6');
    var msgElement = msgDiv.querySelector('p');

    titleElement.textContent = title;
    msgElement.textContent = message;

    msgDiv.style.display = 'block';

    setTimeout(function() {
        msgDiv.style.display = 'none';
    }, 3500);
}

/*this function controlls the toggle mechanism of the logging status*/
function toggleLogging() {
    var loggingDiv = document.getElementById('logging-toggle');
    var button = document.getElementById('toggleButton');

    if (loggingDiv.classList.contains('inactive')) {
        loggingDiv.classList.remove('inactive');
        loggingDiv.classList.add('active');
        button.innerHTML = "<s>log</s>";
        logging=true;
    } else {
        loggingDiv.classList.remove('active');
        loggingDiv.classList.add('inactive');
        button.innerText = "log";
        logging=false;
    }
}

/**function to customize fullscreen status */
const fScreenBtn = document.getElementById('toggleFullscreen');
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        fScreenBtn.innerHTML = "<s>fScreen</s>";
        fScreenBtn.style.backgroundColor = "red";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        fScreenBtn.innerHTML = "fScreen";
        fScreenBtn.style.backgroundColor = "#4CAF50";
    }
}


/**function to use power and system Settings*/
const systemSettings = document.getElementById('powerOptions');

function disableSystemSettings(){
    systemSettings.style.pointerEvents = 'none';
    systemSettings.style.opacity = '0.3';
}

function enableSystemSettings(){
    systemSettings.style.pointerEvents = 'auto';
    systemSettings.style.opacity = '1';
}

async function shutdown(){
    disableSystemSettings();
    try {
        const response = await fetch("http://127.0.0.1:5000/powerOptions/shutdown", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            showErrorMessage("System Fehler", "Fehler beim Herunterfahren: " + errorData.message);
        }
    } catch (error) {
        showErrorMessage("System Fehler", "Fehler beim Herunterfahren: " + error);
    } finally {
        enableSystemSettings();
    }
}

async function reboot(){
    disableSystemSettings();
    try {
        const response = await fetch("http://127.0.0.1:5000/powerOptions/reboot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            showErrorMessage("System Fehler", "Fehler beim Neustart: " + errorData.message);
        }
    } catch (error) {
        showErrorMessage("System Fehler", "Fehler beim Neustart: " + error);
    } finally {
        enableSystemSettings();
    }
}

async function update() {
    try {
        showMessage("Update", "Versuche, das System zu aktualisieren...");

        const wlanResponse = await fetch("http://127.0.0.1:5000/wlan/status");
        if (!wlanResponse.ok) {
            throw new Error("WLAN-Status konnte nicht abgerufen werden");
        }

        const wlanStatus = await wlanResponse.json();
        showErrorMessage("Wlan", "WLAN-Status: " + wlanStatus.status);

        if (wlanStatus.status !== "enabled") {
            showErrorMessage('Netzwerkfehler', 'WLAN nicht verfügbar. Bitte in den Verbindungseinstellungen aktivieren!');
            enableSystemSettings();
            return;
        }
        
        disableSystemSettings();

        try {
            const response = await fetch("http://127.0.0.1:5000/system/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                showErrorMessage("System Fehler", "Fehler beim Update: " + errorData.message);
            } else {
                showMessage("Update erfolgreich", "Das System wird jetzt aktualisiert.");
                document.getElementById('rebootBtn').style.animation = "suggestion 2s ease-in infinite";
            }
        } catch (error) {
            showErrorMessage("System Fehler", "Fehler beim Update: " + error.message);
        } finally {
            enableSystemSettings();
        }

    } catch (error) {
        showErrorMessage("Fehler", "Fehler beim Abrufen des WLAN-Status: " + error.message);
    }
}


async function setVersion() {
    showMessage("Version", "try to set Version number");
    const versionLabel = document.getElementById('version');
    const label = versionLabel.querySelector('p');

    try {
        const response = await fetch("http://127.0.0.1:5000/system/version/current");
        if (!response.ok) {
            throw new Error('Die Netzwerkantwort war nicht erfolgreich.');
        }
        const data = await response.json();
        if (data.commit && data.date) {
            label.textContent = `v:${data.date}, ${data.commit}`;
        } else {
            showErrorMessage("Version Fehler", "Es gab ein Problem beim Abrufen der Version: Daten fehlen.");
        }
    } catch (error) {
        showErrorMessage("Verbindungsfehler", "Fehler beim Abrufen der Version: " + error.message);
    }
}

async function openGitLog() {
    try {
        let response = await fetch('http://127.0.0.1:5000/system/version/log');
        let logs = await response.json();
        
        let logContainer = document.getElementById("git-log-container");
        logContainer.innerHTML = `
            <div id="backConn" class="backButton" onclick="closePanel('gitLog')" style='position: relative; top: 0; left: 0; width: 30px; height: 30px;'> 
                <img src="../static/media/back.png" alt="goBack img">
            </div>
        `;
        
        logs.forEach(log => {
            let logEntry = document.createElement("div");
            logEntry.classList.add("log-entry");

            let commitInfo = document.createElement("div");
            commitInfo.classList.add("commit-info");
            commitInfo.innerHTML = `<strong>${log.date}</strong> - <code>${log.commit}</code>`;

            let commitMessage = document.createElement("div");
            commitMessage.classList.add("commit-message");
            commitMessage.textContent = log.message;

            let separator = document.createElement("div");
            separator.classList.add("git_separator");

            logEntry.appendChild(commitInfo);
            logEntry.appendChild(commitMessage);
            logContainer.appendChild(logEntry);
            logContainer.appendChild(separator);
        });
    logContainer.style.display="block";
    } catch (error) {
        showErrorMessage("Git-Log", "Fehler beim Abrufen der Git-Logs:"+ error);
    }
}



/* Script for trunkPower options */
let trunkPower = false;
const trunkPowerBtn = document.getElementById('trunkPowerBtn');

async function toggleTrunkPower() {
    trunkPowerBtn.disabled = true;
    trunkPowerBtn.style.opacity="0.1";
    
    try {
        if (trunkPower) {
            await disableTrunkPower();
        } else {
            await enableTrunkPower();
        }
        trunkPower = !trunkPower;
        updateButtonIcon();
    } catch (error) {
        showErrorMessage("System Fehler", error.message);
    } finally {
        trunkPowerBtn.disabled = false;
        trunkPowerBtn.style.opacity="1";
    }
}
function updateButtonIcon() {
    trunkPowerBtn.style.backgroundImage = trunkPower
        ? "url('../static/media/trunkPowerOn_img.png')"
        : "url('../static/media/trunkPowerOff_img.png')";
}

async function enableTrunkPower() {
    try {
        const response = await fetch("http://127.0.0.1:5000/system/powerOptions/trunkPower/enable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error("Fehler beim Anschalten der Stromversorgung: " + errorData.message);
        }
    } catch (error) {
        throw new Error("Fehler beim Anschalten der Stromversorgung: " + error);
    }
}

async function disableTrunkPower() {
    try {
        const response = await fetch("http://127.0.0.1:5000/system/powerOptions/trunkPower/disable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error("Fehler beim Ausschalten der Stromversorgung: " + errorData.message);
        }
    } catch (error) {
        throw new Error("Fehler beim Ausschalten der Stromversorgung: " + error);
    }
}


/*Script for Color Settings*/
const colorSlider = document.getElementById('colorSlider');
const colorValue = document.getElementById('colorValue');
const background = document.querySelector('.background');

const colorGradient = [
    'rgb(48, 48, 48)',
    'rgb(79, 48, 79)',
    'rgb(48, 48, 79)',
    'rgb(48, 79, 48)',
    'rgb(79, 79, 48)',
    'rgb(79, 58, 48)',
    'rgb(79, 48, 48)',
    'rgb(48, 48, 48)'
];


function interpolateColor(value, colors) {
    const index = Math.floor(value / (100 / (colors.length - 1)));
    const remainder = (value % (100 / (colors.length - 1))) / (100 / (colors.length - 1));
    
    const startColor = colors[index];
    const endColor = colors[index + 1];
    
    const [r1, g1, b1] = startColor.match(/\d+/g).map(Number);
    const [r2, g2, b2] = endColor.match(/\d+/g).map(Number);
    
    const r = Math.round(r1 + remainder * (r2 - r1));
    const g = Math.round(g1 + remainder * (g2 - g1));
    const b = Math.round(b1 + remainder * (b2 - b1));
    
    return `rgb(${r}, ${g}, ${b})`;
}

function updateBackgroundColor() {
    const sliderValue = colorSlider.value;
    const newColor = interpolateColor(sliderValue, colorGradient);
    background.style.setProperty('--main-color', newColor);
}

colorSlider.addEventListener('input', updateBackgroundColor);

/*Code for Brightness Adjustments*/

function updateBrightness() {
    const sliderValue = brightnessSlider.value;
    const brightness = sliderValue / 100;
    document.body.style.filter = `brightness(${brightness})`;
}

brightnessSlider.addEventListener('input', updateBrightness);

/**Function to switch between pages/sections */

function switchToSection(section){
    switch (section){
        case 'home':
            document.getElementById('settings').style.display = 'none';
            document.getElementById('audioControl').style.display = 'none';
            document.getElementById('home').style.display = 'block';
            break;
        case 'settings':
            document.getElementById('audioControl').style.display = 'none';
            document.getElementById('home').style.display = 'none';
            document.getElementById('settings').style.display = 'block';
            break;
        case 'audioControl':
            document.getElementById('settings').style.display = 'none';
            document.getElementById('home').style.display = 'none';
            document.getElementById('audioControl').style.display = 'block';
            break;
        case 'connections':
            document.getElementById('connPanel').style.display='block';
            setTimeout(() => {
                document.getElementById('connPanel').classList.add('show');
            }, 10);
            break;
        case 'expert':
            document.getElementById('expPanel').style.display = 'block';
            setTimeout(() => {
                document.getElementById('expPanel').classList.add('show');
            }, 10);
            break;
        case 'feature':
            document.getElementById('featurePanel').style.display='block';
            setTimeout(() => {
                document.getElementById('featurePanel').classList.add('show');
            }, 10);
            break;
        case 'soundSettings':
            document.getElementById('soundSettingsPanel').style.display='block';
            setTimeout(() => {
                document.getElementById('soundSettingsPanel').classList.add('show');
            }, 10);
            break;
    }
}

function closePanel(panel) {
    switch (panel){
        case 'connPanel':
            document.getElementById('connPanel').classList.remove('show');
            setTimeout(() => {
                document.getElementById('connPanel').style.display = 'none';
            }, 500);
            break;
        case 'expPanel':
            document.getElementById('expPanel').classList.remove('show');
            setTimeout(() => {
                document.getElementById('expPanel').style.display = 'none';
            }, 500);
            break;
        case 'gitLog':
            document.getElementById('git-log-container').style.display="none";
            break;
        case 'soundSettingsPanel':
            document.getElementById('soundSettingsPanel').classList.remove('show');
            setTimeout(() => {
                document.getElementById('soundSettingsPanel').style.display = 'none';
            }, 500);
            break;
        case 'featurePanel':
        document.getElementById('featurePanel').classList.remove('show');
        setTimeout(() => {
            document.getElementById('featurePanel').style.display = 'none';
        }, 500);
        break;
    }
}


/**The following part represents the functions for the audio control */
/**Volume Control -> Slider and RaspberryPI */
const volumeSlider = document.getElementById('volumeSlider');
const balanceSlider = document.getElementById('balanceSlider');

// Debounce-Funktion, um API-Calls zu reduzieren
function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// ---------------------- VOLUME ----------------------

async function getVolume() {
    try {
        const response = await fetch("/volume/get");
        const data = await response.json();

        if (data.status === "success") {
            return data.volume;
        } else {
            showErrorMessage("Volumen Fehler", data.message);
            return null;
        }
    } catch (error) {
        showErrorMessage("Volumen Fehler", error.message);
        return null;
    }
}

async function setVolume(volume) {
    try {
        const response = await fetch("/volume/set", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ volume })
        });

        const data = await response.json();
        if (data.status === "success") {
            const metaData = document.getElementById('metaData');
            metaData.style.borderColor = volume > 80 ? 'red' : 'white';
        } else {
            showErrorMessage("Volumen Fehler", data.message);
        }
    } catch (error) {
        showErrorMessage("Volumen Fehler", error.message);
    }
}

// ---------------------- BALANCE ----------------------

async function getBalance() {
    try {
        const response = await fetch("/balance/get");
        const data = await response.json();

        if (data.status === "success") {
            return data.balance;
        } else {
            showErrorMessage("Balance Fehler", data.message);
            return null;
        }
    } catch (error) {
        showErrorMessage("Balance Fehler", error.message);
        return null;
    }
}

async function setBalance(balance) {
    try {
        const response = await fetch("/balance/set", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ balance })
        });

        const data = await response.json();
        if (data.status !== "success") {
            showErrorMessage("Balance Fehler", data.message);
        }
    } catch (error) {
        showErrorMessage("Balance Fehler", error.message);
    }
}

// ---------------------- SLIDER ----------------------

function setVolumeSlider(promise) {
    promise.then(value => {
        if (value !== null) {
            volumeSlider.value = value;
        }
    }).catch(console.error);
}

function setBalanceSlider(promise) {
    promise.then(value => {
        if (value !== null) {
            balanceSlider.value = value;
        }
    }).catch(console.error);
}

volumeSlider.addEventListener('input', debounce(() => setVolume(volumeSlider.value), 200));
balanceSlider.addEventListener('input', debounce(() => setBalance(balanceSlider.value), 200));



/**audio music - Control: play, pause, skip, previous */

async function pauseAudio(){
    const buttons = document.querySelectorAll('#musicControl button');
    buttons.forEach(button => button.disabled = true);

    console.log("pause Audio.");
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/pause", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("paused Audio");
            buttons.forEach(button => button.disabled = false);
            setMetaData();
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + error);    }
}

async function playAudio(){
    const buttons = document.querySelectorAll('#musicControl button');
    buttons.forEach(button => button.disabled = true);
    
    console.log("pause Audio.");
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/play", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("running Audio");
            buttons.forEach(button => button.disabled = false);
            setMetaData();
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + error);    }
}

async function skipAudio(){
    const buttons = document.querySelectorAll('#musicControl button');
    buttons.forEach(button => button.disabled = true);

    console.log("skip Audio.");
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/skip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("skipped Audio");
            buttons.forEach(button => button.disabled = false);
            setMetaData();
        } else {
            showErrorMessage("Fehler beim Überspringen des Titels", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Überspringen des Titels", error);    }
}

async function prevAudio(){
    const buttons = document.querySelectorAll('#musicControl button');
    buttons.forEach(button => button.disabled = true);

    console.log("previous Audio.");
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/previous", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("previous Audio");
            buttons.forEach(button => button.disabled = false);
            setMetaData();
        } else {
            showErrorMessage("Fehler beim Zurückspulen", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Zurückspulen", error);    }
}

async function getInfoAudio() {
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/getinformation");
        const data = await response.json();
        if (data.status === "success") {
            console.log("Info Audio:", data.information);
            return data.information;
        } else {
            console.error("Error Info audio:", data.message);
            showErrorMessage("Fehler beim abrufen der Metadaten", data.message);
            return null;
        }
    } catch (error) {
        console.log(error);
        showErrorMessage("Fehler bei den Metadaten", error);
        return null;
    }
}

const DeviceName = document.getElementById('DeviceName');
async function getPlayerDevice() {
    try {
        const response = await fetch("http://127.0.0.1:5000/audio/player");
        const data = await response.json();
        if(data.status === "success"){
            console.log("PlayerDevice:", data.player);
            DeviceName.innerHTML=data.player;
            return data.player;
        }
        else {
            showErrorMessage("Fehler beim abrufen des Player-Device", data.message);
            DeviceName.innerHTML="";
            return null;
        }
    } catch (error) {
        console.log(error);
        showErrorMessage("Fehler beim Player-Device", error);
        return null;
    }
}


function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

async function setMetaData() {
    const title = document.getElementById('songTitle');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const genre = document.getElementById('genre');
    const maxLength=30;

    try {
        const message = await getInfoAudio();
        if (message) {
            title.innerHTML = truncateText(message.title || "Unknown Title", maxLength);
            artist.innerHTML = truncateText(message.artist || "Unknown Artist", maxLength);
            album.innerHTML = truncateText(message.album || "Unknown Album", maxLength);
            genre.innerHTML = truncateText(message.genre || "Unknown Genre", maxLength);
        } else {
            console.error("Metadata konnte nicht geladen werden.");
        }
    } catch (error) {
        console.error("Error beim Setzen der Metadaten:", error);
    }
}


const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
let lastProgress = 0;

async function updateProgress() {
    try {
        var response = await fetch("http://127.0.0.1:5000/audio/progress");
        var progress = await response.json();

        const percentage = Math.min(100, Math.max(0, progress.progress));
        document.getElementById("progress-bar").style.width = percentage + "%";

        
        response = await fetch("http://127.0.0.1:5000/audio/isPlaying");
        result = await response.json();

        if(result.playStatus == true){
            pauseBtn.style.opacity="1";
            playBtn.style.opacity="0.1";
        } else{
            playBtn.style.opacity="1";
            pauseBtn.style.opacity="0.1";
        }

        lastProgress = percentage;
    } catch (error) {
        showErrorMessage("Progress-Error", "Fehler beim Abrufen des Fortschritts: " + error);
    }
}

/*check for new metaData*/
setInterval(() => {
    updateProgress();
    setMetaData();
    getPlayerDevice();
}, 1500);

function animateButton(button) {
    button.classList.remove("clicked"); 
    void button.offsetWidth;
    button.classList.add("clicked");

    setTimeout(() => {
        button.classList.remove("clicked");
    }, 1000);
}


/**The following part represents the functions for the bluetooth control and wlan functions*/
const bluetoothToggle = document.getElementById('bluetoothToggle');
const pairingToggle = document.getElementById('pairingToggle');
const wlanToggle = document.getElementById('wlanToggle');

let isBluetoothOn = false;
let isPairingOn = false;
let isWlanOn = false;

const bluetoothHeader = document.querySelector('#bluetooth-container');
bluetoothToggle.addEventListener('click', async () => {
    bluetoothToggle.style.pointerEvents = 'none';
    pairingToggle.style.pointerEvents = 'none';
    bluetoothHeader.style.opacity="0.3";
    pairingHeader.style.opacity="0.3";

    if (!isBluetoothOn) {
        await enableBt();
    } else {
        await disableBt();
    }
    bluetoothToggle.style.pointerEvents = 'auto';
    pairingToggle.style.pointerEvents = 'auto';
    bluetoothHeader.style.opacity="1";
    pairingHeader.style.opacity="1";
});

const pairingHeader = document.querySelector('#pairing-container');
pairingToggle.addEventListener('click', async () => {
    bluetoothToggle.style.pointerEvents = 'none';
    pairingToggle.style.pointerEvents = 'none';
    bluetoothHeader.style.opacity="0.3";
    pairingHeader.style.opacity="0.3";

    if (!isPairingOn) {
        await enablePairingMode();
    } else {
        await disablePairingMode();
    }
    bluetoothToggle.style.pointerEvents = 'auto';
    pairingToggle.style.pointerEvents = 'auto';
    bluetoothHeader.style.opacity="1";
    pairingHeader.style.opacity="1";
});

const wlanHeader = document.querySelector('#wlan-container');
wlanHeader.addEventListener('click', async () => {
    wlanToggle.style.pointerEvents = 'none';
    wlanHeader.style.opacity="0.3";

    if (!isWlanOn) {
        await enableWlan();
    } else {
        await disableWlan();
    }
    wlanToggle.style.pointerEvents = 'auto';
    wlanHeader.style.opacity="1";
});

async function enableBt() {
    console.log("Bluetooth eingeschaltet.");
    bluetoothToggle.style.pointerEvents = 'none';
    try {
        const response = await fetch("http://127.0.0.1:5000/bluetooth/on", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("turned Bluetooth on");
            bluetoothToggle.src = '../static/media/turnOn.png';
            isBluetoothOn = !isBluetoothOn;
        } else {
            bluetoothToggle.src = '../static/media/turnOff.png';
            showErrorMessage("Bluetooth Fehler", "Fehler beim Einschalten von Bluetooth: " + data.message);        }
    } catch (error) {
        showErrorMessage("Bluetooth Fehler", "Fehler beim Einschalten von Bluetooth: " + error);    }
    finally{
        bluetoothToggle.style.pointerEvents = 'auto';
    }
}

async function disableBt() {
    console.log("Bluetooth ausgeschaltet.");
    try {
        const response = await fetch("http://127.0.0.1:5000/bluetooth/off", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("turned Bluetooth off");
            bluetoothToggle.src = '../static/media/turnOff.png';
            isBluetoothOn = !isBluetoothOn;
        } else {
            bluetoothToggle.src = '../static/media/turnOn.png';
            showErrorMessage("Bluetooth Fehler", "Fehler beim Ausschalten von Bluetooth: " + data.message);        }
    } catch (error) {
        showErrorMessage("Bluetooth Fehler", "Fehler beim Ausschalten von Bluetooth: " + error);    }

    pairingToggle.src = '../static/media/BTPairingOff.png';
    isPairingOn=false;
}

async function enablePairingMode() {
    console.log("Pairing-Modus aktiviert.");
    try {
        const response = await fetch("http://127.0.0.1:5000/pairingmode/on", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("turned pairing mode on");
            isPairingOn = !isPairingOn;
            pairingToggle.src = '../static/media/BTPairingOn.png';
        } else {
            pairingToggle.src = '../static/media/BTPairingOff.png';
             showErrorMessage("Bluetooth Fehler", "Fehler beim Aktivieren des Pairing-Modus: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Bluetooth Fehler", "Fehler beim Aktivieren des Pairing-Modus: " + error);
    }
}

async function disablePairingMode() {
    console.log("Pairing-Modus deaktiviert.");
    try {
        const response = await fetch("http://127.0.0.1:5000/pairingmode/off", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("turned pairing mode off");
            isPairingOn = !isPairingOn;
            pairingToggle.src = '../static/media/BTPairingOff.png';
        } else {
            pairingToggle.src = '../static/media/BTPairingOn.png';
            showErrorMessage("Bluetooth Fehler", "Fehler beim Deaktivieren des Pairing-Modus: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Bluetooth Fehler", "Fehler beim Deaktivieren des Pairing-Modus: " + error);
    }
}


async function enableWlan() {
    console.log("Wlan eingeschaltet.");
    wlanToggle.style.pointerEvents = 'none';
    
    try {
        const response = await fetch("http://127.0.0.1:5000/wlan/on", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        
        if (data.status === "success") {
            console.log("Wlan wurde erfolgreich eingeschaltet.");
            wlanToggle.src = '../static/media/wlanOn.png';
            isWlanOn = true;
        } else {
            showErrorMessage("Wlan Fehler", "Fehler beim Einschalten von Wlan: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Wlan Fehler", "Fehler beim Einschalten von Wlan: " + error);
    } finally {
        wlanToggle.style.pointerEvents = 'auto';
    }
}

async function disableWlan() {
    console.log("Wlan ausgeschaltet.");
    wlanToggle.style.pointerEvents = 'none';
    
    try {
        const response = await fetch("http://127.0.0.1:5000/wlan/off", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        
        if (data.status === "success") {
            console.log("Wlan wurde erfolgreich ausgeschaltet.");
            wlanToggle.src = '../static/media/wlanOff.png';
            isWlanOn = false;
        } else {
            showErrorMessage("Wlan Fehler", "Fehler beim Ausschalten von Wlan: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Wlan Fehler", "Fehler beim Ausschalten von Wlan: " + error);
    } finally {
        wlanToggle.style.pointerEvents = 'auto';
    }
}
