/**function executed when the page is loaded -> initial loadings */
document.addEventListener ("DOMContentLoaded", () => {
	setVolumeSlider(getVolume());
    disableBt();
    setTimeout(() => {
        enableBt();
        setVolumeSlider(20);
    }, 3000);
});

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

async function update(){
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
        }
        else{
            document.getElementById('rebootBtn').style.animation = "suggestion 2s ease-in infinite";
        }
    } catch (error) {
        showErrorMessage("System Fehler", "Fehler beim Update: " + error);
    } finally {
        enableSystemSettings();
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
    }
}



/**The following part represents the functions for the audio control */
/**Volume Control -> Slider and RaspberryPI */
const volumeSlider = document.getElementById('volumeSlider');

async function getVolume() {
    try {
        const response = await fetch("http://127.0.0.1:5000/volume/get");
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        const data = await response.json();
        if (data.status === "success") {
            return data.volume;
        } else {
            showErrorMessage("Volumen Fehler", "Fehler beim Abrufen der Lautstärke: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Volumen Fehler", "Fehler beim Abrufen der Lautstärke: " + error);
    }
}


async function setVolume(volume) {
    console.log(volume+"%");
    try {
        const response = await fetch("http://127.0.0.1:5000/volume/set", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ volume })
        });
        const textResponse = await response.text(); 
        console.log("Raw response:", textResponse);  // Ausgabe der Antwort ohne Parsing
    
        const data = JSON.parse(textResponse);
        if (data.status === "success") {
            console.log("Volume set successfully:", data.message);
        } else {
            showErrorMessage("Volumen Fehler", "Fehler beim Setzen der Lautstärke: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        showErrorMessage("Volumen Fehler", "Fehler beim Setzen der Lautstärke: " + error);
    }
}

function setVolumeSlider(pValuePromise) {
    pValuePromise.then(pValue => {
        console.log(pValue);
        volumeSlider.value = pValue;
    }).catch(error => {
        console.error("Fehler beim Abrufen des Volume-Werts:", error);
    });
}

function getVolumeSlider(){
    return volumeSlider.value;
}

volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value));



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
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + error);    }
    finally {
        buttons.forEach(button => button.disabled = false);
        setMetaData();
    }
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
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + error);    }
    finally {
        buttons.forEach(button => button.disabled = false);
        setMetaData();
    }
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
        } else {
            showErrorMessage("Fehler beim Überspringen des Titels", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Überspringen des Titels", error);    }
    finally {
        buttons.forEach(button => button.disabled = false);
        setMetaData();
    }
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
        } else {
            showErrorMessage("Fehler beim Zurückspulen", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Zurückspulen", error);    }
    finally {
        buttons.forEach(button => button.disabled = false);
        setMetaData();
    }
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
        return null;
    }
}

let colorMode = false;
const genreColors = {
    "Rock": "#ff0000",
    "Pop": "#00ff00",
    "Jazz": "#0000ff",
    "Classic": "#ff00ff",
    "Rap": "#ffff00",
    "Unknown Genre": "#ffffff"
};

async function setMetaData() {
    const title = document.getElementById('songTitle');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const genre = document.getElementById('genre');

    try {
        const message = await getInfoAudio();
        if (message) {
            title.innerHTML = message.title || "Unknown Title";
            artist.innerHTML = message.artist || "Unknown Artist";
            album.innerHTML = message.album || "Unknown Album";
            genre.innerHTML = message.genre || "Unknown Genre";
            
            if(colorMode){
                setGenreColor(message.genre);
            }
        } else {
            console.error("Metadata konnte nicht geladen werden.");
        }
    } catch (error) {
        console.error("Error beim Setzen der Metadaten:", error);
    }
}

function setGenreColor(genre){
    console.log("setGenreColor");
    const metaData = document.getElementById('metaData');
    const genreColor = genreColors[genre] || genreColors["Unknown Genre"];
    metaData.style.background = `radial-gradient(circle at top center, ${genreColor} 1%, rgb(2, 2, 2) 65%)`;
}

const colorModeToggle = document.getElementById("genreColorToggle");

colorModeToggle.addEventListener("change", function() {
    if (colorModeToggle.checked) {
        colorMode=true;
        console.log("colorMode is ON");
    } else {
        colorMode=false;
        console.log("colorMode is OFF");
        metaData.style.background = `radial-gradient(circle at top center, var(--accent-color) 1%, rgb(2, 2, 2) 65%)`;    }
});

/*check for new metaData*/
setInterval(() => {
    setMetaData();
}, 5000);


/**The following part represents the functions for the bluetooth control */
const bluetoothToggle = document.getElementById('bluetoothToggle');
const pairingToggle = document.getElementById('pairingToggle');

let isBluetoothOn = false;
let isPairingOn = false;

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







