/**function executed when the page is loaded -> initial loadings */
document.addEventListener ("DOMContentLoaded", () => {
	    
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
    preloadConfig();
});



// initial config-settings
//#########################################################################################################################################
//#########################################################################################################################################
//#########################################################################################################################################

//preload images
function preloadImages(imageArray) {
    imageArray.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
    showMessage("Bild Daten geladen", "Alle Bilddateien wurden erfolgreich geladen.");
}

// load and apply the config data
async function preloadConfig() {
    try {
        const response = await fetch('http://127.0.0.1:5000/system/config');

        if (!response.ok) {
            console.warn('Failed to load config, falling back to defaults.');
            fallbackFunctions();
            showErrorMessage("Failed while loading Config.", "Response was not ok.");
            return;
        }

        const json = await response.json();
        console.log(json);

        setVolumeSlider(getVolume());
        setBalanceSlider(getBalance());
        setVersion();

        if (json.isTouchSoundEnabled !== undefined) {
            if (json.isTouchSoundEnabled) {
                togglePlayClickSound();
            }
        }

        if (json.isBluetoothEnabled !== undefined) {
            if (json.isBluetoothEnabled) {
                enableBt();
            } else {
                disableBt();
            }
        } else {
            enableBt();
        }

        if (json.isPairingmodeEnabled !== undefined) {
            if(json.isPairingmodeEnabled) {
                enablePairingMode();
            } else {
                disablePairingMode();
            }
        } else {
            disablePairingMode();
        }

        document.getElementById('colorSlider').value = json.colorSliderValue !== undefined ? json.colorSliderValue : 39;
        updateBackgroundColor();
        document.getElementById('brightnessSlider').value = json.brightnessSliderValue !== undefined ? json.brightnessSliderValue : 100;

        if (json.isTrunkPowerEnabled !== undefined) {
            if (json.isTrunkPowerEnabled) {
                toggleTrunkPower();
            }
        }

        if (json.isAdaptiveBrightnessEnabled !== undefined) {
            if (json.isAdaptiveBrightnessEnabled) {
                toggleAdaptiveBrightness();
            }
        }

        if (json.isClimateDataEnabled !== undefined) {
            if (json.isClimateDataEnabled) {
                toggleClimateData();
            }
        }

        if (json.isPosDisplayEnabled !== undefined) {
            if (json.isPosDisplayEnabled) {
                togglePosDisplay();
            }
        }

        if (json.touchSoundValue !== undefined) {
            lastClickVolume = json.touchSoundValue;
            audio.volume = lastClickVolume;
            updateVolumeDisplay(json.touchSoundValue);
        }

        if (json.isClockEnabled !== undefined) {
            if (json.isClockEnabled) {
                toggleClock();
            }
        }

        if (json.sleepTimerIndex !== undefined) {
            lastSleepTimerIndex = currentSleepTimerIndex = json.sleepTimerIndex;
            updateTimeIndicator();
        }
        if (json.sleepTimerActive !== undefined) {
            sleepTimerActive = json.sleepTimerActive;
        
            if (sleepTimerActive) {
                sleepTimerToggle.textContent = "SleepTimer: An";
                sleepTimerToggle.style.color = "green";
                startSleepTimer();
            } else {
                sleepTimerToggle.textContent = "SleepTimer: Aus";
                sleepTimerToggle.style.color = "red";
                clearTimeout(sleepTimerTimeout);
            }
        }       
    } catch (error) {
        showErrorMessage('Error fetching config:', error);
        fallbackFunctions();
    }
}


function fallbackFunctions() {
    setVolumeSlider(getVolume());
    setBalanceSlider(getBalance());
    togglePlayClickSound();
    enableBt();  
    document.getElementById('colorSlider').value = 39;
    document.getElementById('brightnessSlider').value = 100;
    updateBrightness();
    updateBackgroundColor();
    setVersion();
    toggleTrunkPower();
    toggleAdaptiveBrightness();
    toggleClimateData();
    toggleSongDisplay();
    togglePosDisplay();
    toggleClock();

    sleepTimerActive = true;
    currentSleepTimerIndex = 1;
    lastSleepTimerIndex = currentSleepTimerIndex;
    updateTimeIndicator();
    sleepTimerToggle.textContent = "SleepTimer: An";
    sleepTimerToggle.style.color = "green";
    startSleepTimer();
}


function updateConfig(key, value) {
    fetch("http://127.0.0.1:5000/system/config", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key: key,
            value: value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log(`Erfolgreich: ${data.message}`);
        } else {
            console.error(`Fehler: ${data.message}`);
        }
    })
    .catch(error => {
        console.error("Netzwerkfehler:", error);
    });
}




// global functions
//#########################################################################################################################################
//#########################################################################################################################################
//#########################################################################################################################################


// Codeblock to handle Error Messages
var logging = false;

function showErrorMessage(title, message) {
    if (!logging) return;

    var container = document.getElementById("errorContainer");
    var errorDiv = document.createElement("div");
    errorDiv.classList.add("errorMessage");

    var titleElement = document.createElement("h6");
    titleElement.textContent = title;

    var messageElement = document.createElement("p");
    messageElement.textContent = message;

    errorDiv.appendChild(titleElement);
    errorDiv.appendChild(messageElement);
    container.appendChild(errorDiv);

    setTimeout(() => errorDiv.style.display = "block", 10);
    setTimeout(() => removeError(errorDiv), 3500);
    addSwipeToRemove(errorDiv);
}

function removeError(element) {
    element.style.opacity = "0";
    setTimeout(() => element.remove(), 300);
}
function addSwipeToRemove(element) {
    let startX = 0;

    element.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    element.addEventListener("touchmove", (e) => {
        let moveX = e.touches[0].clientX - startX;
        element.style.transform = `translateX(${moveX}px)`;
        element.style.opacity = `${1 - Math.abs(moveX) / 200}`;
    });

    element.addEventListener("touchend", (e) => {
        let moveX = e.changedTouches[0].clientX - startX;
        if (Math.abs(moveX) > 100) {
            element.style.transition = "transform 0.3s ease-out, opacity 0.3s";
            element.style.transform = `translateX(${moveX > 0 ? "100vw" : "-100vw"})`;
            element.style.opacity = "0";
            setTimeout(() => element.remove(), 300);
        } else {
            element.style.transition = "transform 0.3s ease-out";
            element.style.transform = "translateX(0)";
            element.style.opacity = "1";
        }
    });
}


// Codeblock to handle Messages
const container = document.getElementById("messageContainer");
function showMessage(title, message) {
    var msgDiv = document.createElement("div");
    msgDiv.classList.add("messageNotification");

    var titleElement = document.createElement("h6");
    titleElement.textContent = title;

    var msgElement = document.createElement("p");
    msgElement.textContent = message;

    msgDiv.appendChild(titleElement);
    msgDiv.appendChild(msgElement);
    container.appendChild(msgDiv);

    setTimeout(() => msgDiv.style.display = "block", 10);

    setTimeout(() => removeMessage(msgDiv), 3500);
    addSwipeToRemove(msgDiv);
}

function removeMessage(element) {
    element.style.opacity = "0";
    setTimeout(() => element.remove(), 300);
}

function addSwipeToRemove(element) {
    let startX = 0;

    element.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    element.addEventListener("touchmove", (e) => {
        let moveX = e.touches[0].clientX - startX;
        element.style.transform = `translateX(${moveX}px)`;
        element.style.opacity = `${1 - Math.abs(moveX) / 200}`;
    });

    element.addEventListener("touchend", (e) => {
        let moveX = e.changedTouches[0].clientX - startX;
        if (Math.abs(moveX) > 100) {
            element.style.transition = "transform 0.3s ease-out, opacity 0.3s";
            element.style.transform = `translateX(${moveX > 0 ? "100vw" : "-100vw"})`;
            element.style.opacity = "0";
            setTimeout(() => element.remove(), 300);
        } else {
            element.style.transition = "transform 0.3s ease-out";
            element.style.transform = "translateX(0)";
            element.style.opacity = "1";
        }
    });
}


/*this function controlls the toggle mechanism of the logging status*/
function toggleLogging() {
    playClickSound();
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
    playClickSound();
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


// Codeblock for backgoundcolor adjustments
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
    updateConfig("colorSliderValue", colorSlider.value);
}

colorSlider.addEventListener('input', updateBackgroundColor);

// Code for Brightness Adjustments
function updateBrightness() {
    const sliderValue = brightnessSlider.value;
    const brightness = sliderValue / 100;
    document.body.style.filter = `brightness(${brightness})`;
    updateConfig("brightnessSliderValue", sliderValue);
}

brightnessSlider.addEventListener('input', updateBrightness);




// Codeblock to switch between pages
function switchToSection(section){
    playClickSound();
    switch (section){
        case 'home':
            document.getElementById('settings').style.display = 'none';
            document.getElementById('audioControl').style.display = 'none';
            document.getElementById('mapSection').style.display="none";
            document.getElementById('home').style.display = 'block';
            break;
        case 'settings':
            document.getElementById('audioControl').style.display = 'none';
            document.getElementById('home').style.display = 'none';
            document.getElementById('mapSection').style.display="none";
            document.getElementById('settings').style.display = 'block';
            break;
        case 'audioControl':
            document.getElementById('settings').style.display = 'none';
            document.getElementById('home').style.display = 'none';
            document.getElementById('mapSection').style.display="none";
            document.getElementById('audioControl').style.display = 'block';
            break;
        case 'mapSection':
            document.getElementById('settings').style.display = 'none';
            document.getElementById('home').style.display = 'none';
            document.getElementById('audioControl').style.display = 'none';
            document.getElementById('mapSection').style.display="block";
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
    playClickSound();
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



// Audio Control
//#########################################################################################################################################
//#########################################################################################################################################
//#########################################################################################################################################

// Debounce-Funktion 
const volumeSlider = document.getElementById('volumeSlider');
const balanceSlider = document.getElementById('balanceSlider');

function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}


// set / get Volume from Route
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


// set / get Balance from Route
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


// Function to set Slider Value (Volume | Balance)
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




// Codeblock for Audio Control functions
async function pauseAudio(){
    playClickSound();
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
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Pausieren des Audios: " + error);    }
}

async function playAudio(){
    playClickSound();
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
        } else {
            showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + data.message);        }
    } catch (error) {
        showErrorMessage("Audio Fehler", "Fehler beim Starten des Audios: " + error);    }
}

async function skipAudio(){
    playClickSound();
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
        } else {
            showErrorMessage("Fehler beim Überspringen des Titels", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Überspringen des Titels", error);    }
}

async function prevAudio(){
    playClickSound();
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
        } else {
            showErrorMessage("Fehler beim Zurückspulen", data.message);        }
    } catch (error) {
        showErrorMessage("Fehler beim Zurückspulen", error);    }
}

// Route for Audio-metadata
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

// Function to get Device-name
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


// Codeblock for set metadata
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

let pTitle = "default";
let pArtist = "default";
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
            
            if (pTitle != message.title){
                pTitle = message.title || "Unknown Title";
                pArtist = message.artist || "Unknown Artist";
                document.getElementById('songDisplayText').innerText = pTitle + " | " + pArtist;
            }
        } else {
            console.error("Metadata konnte nicht geladen werden.");
        }
    } catch (error) {
        console.error("Error beim Setzen der Metadaten:", error);
    }
}

// Progress update function
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

// Progress and Device Polling
setInterval(() => {
    updateProgress();
    getPlayerDevice();
    setMetaData();
}, 1000);

// Button Animation for audio control
function animateButton(button) {
    button.classList.remove("clicked"); 
    void button.offsetWidth;
    button.classList.add("clicked");

    setTimeout(() => {
        button.classList.remove("clicked");
    }, 1000);
}



// Settings
//#########################################################################################################################################
//#########################################################################################################################################
//#########################################################################################################################################



// System Settings for Update and Power Control
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
    playClickSound();
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
    playClickSound();
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
    playClickSound();
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


// Codeblock for git version and log
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
    playClickSound();
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


// Codeblock for toggle the relais for trunk-power
let trunkPower = false;
const trunkPowerBtn = document.getElementById('trunkPowerBtn');
const trunkPowerToggle = document.getElementById('trunkPowerToggle');

async function toggleTrunkPower() {
    trunkPowerBtn.disabled = true;
    trunkPowerBtn.style.opacity="0.1";
    trunkPowerToggle.style.opacity="0.1";
    
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
        trunkPowerToggle.style.opacity="1";
        trunkPowerBtn.style.opacity="1";
    }
}
function updateButtonIcon() {
    if (trunkPower){
        trunkPowerBtn.style.backgroundImage="url('../static/media/trunkPowerOn_img.png')";
        trunkPowerToggle.innerHTML="Anlage / Sternenhimmel: An"; 
        trunkPowerToggle.style.color="green";
    }
    else {
        trunkPowerBtn.style.backgroundImage="url('../static/media/trunkPowerOff_img.png')";
        trunkPowerToggle.innerHTML="Anlage / Sternenhimmel: Aus";
        trunkPowerToggle.style.color="red"; 
    }
}

async function enableTrunkPower() {
    playClickSound();
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
    playClickSound();
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



// System Settings
//#########################################################################################################################################
const bluetoothToggle = document.getElementById('bluetoothToggle');
const pairingToggle = document.getElementById('pairingToggle');
const wlanToggle = document.getElementById('wlanToggle');

let isBluetoothOn = false;
let isPairingOn = false;
let isWlanOn = false;

// click Events for Bluetooth and Wlan
const bluetoothHeader = document.querySelector('#bluetooth-container');
bluetoothToggle.addEventListener('click', async () => {
    playClickSound();
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
    playClickSound();
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
    playClickSound();
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

// Bluetooth control functions

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
            updateConfig("isBluetoothEnabled", true);
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
            updateConfig("isBluetoothEnabled", false);

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
            updateConfig("isPairingmodeEnabled", true);
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
            updateConfig("isPairingmodeEnabled", false);
        } else {
            pairingToggle.src = '../static/media/BTPairingOn.png';
            showErrorMessage("Bluetooth Fehler", "Fehler beim Deaktivieren des Pairing-Modus: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Bluetooth Fehler", "Fehler beim Deaktivieren des Pairing-Modus: " + error);
    }
}


// Wlan control functions
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
            updateConfig("isWlanEnabled", true);
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
            updateConfig("isWlanEnabled", false);
        } else {
            showErrorMessage("Wlan Fehler", "Fehler beim Ausschalten von Wlan: " + data.message);
        }
    } catch (error) {
        showErrorMessage("Wlan Fehler", "Fehler beim Ausschalten von Wlan: " + error);
    } finally {
        wlanToggle.style.pointerEvents = 'auto';
    }
}


// Feature Settings
//#########################################################################################################################################

// Codeblock for Clock
function updateClock() {
    const now = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    const dateString = now.toLocaleDateString('de-DE', options);
    const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('date').textContent = dateString;
    document.getElementById('time').textContent = timeString;
    
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = (minutes * 6) + (seconds * 0.1);
    const secondAngle = seconds * 6;

    document.getElementById("widgetHour").style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    document.getElementById("widgetMinute").style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    document.getElementById("widgetSecond").style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
}

updateClock();
setInterval(updateClock, 1000);

let showClock = false;
function toggleClock() {
    playClickSound();
    showClock = !showClock;

    if(showClock){
        document.getElementById('clockToggle').innerText = "Uhr: An";
        document.getElementById('clockToggle').style.color = "green";
        document.getElementById('clock-container').style.display="block";
    } else {
        document.getElementById('clockToggle').innerText = "Uhr: Aus";
        document.getElementById('clockToggle').style.color = "red";
        document.getElementById('clock-container').style.display="none";
    }
    updateConfig('isClockEnabled', showClock);
}



// Codeblock for Adaptive Brightness
const adaptiveBrightnessToggle = document.getElementById('adaptiveBrightness');
let adaptiveBrightnessEnabled = true;
let adaptBrightnessInvervalId = null;

async function fetchBrightness() {
    try {
        const response = await fetch("http://127.0.0.1:5000/adaptiveBrightness/get");
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Helligkeit');
        }
        const data = await response.json();
        if (data && typeof data.brightness === "number" && !isNaN(data.brightness)) {
            brightnessSlider.value = data.brightness;
            updateBrightness();
        }
    } catch (error) {
        showErrorMessage("Fehler beim Abrufen der Helligkeit", error);
    }
}

function toggleAdaptiveBrightness() {
    playClickSound();
    adaptiveBrightnessEnabled = !adaptiveBrightnessEnabled;
    
    if (adaptiveBrightnessEnabled) {
        fetchBrightness();
        adaptiveBrightnessToggle.innerHTML="Adaptive Helligkeit: An";
        adaptiveBrightnessToggle.style.color = "green";
        if (!adaptBrightnessIntervalId) {
            adaptBrightnessIntervalId = setInterval(fetchBrightness, 5000);
        }
    } else {
        clearInterval(adaptBrightnessInvervalId);
        adaptBrightnessIntervalId = null;
        adaptiveBrightnessToggle.innerHTML="Adaptive Helligkeit: Aus";
        adaptiveBrightnessToggle.style.color = "red";
    }
    updateConfig("isAdaptiveBrightnessEnabled", adaptiveBrightnessEnabled);
}


// Codeblock for climate data
const climateToggle = document.getElementById('climateData');
const tempDisplay = document.getElementById('tempValue');
const humidityDisplay = document.getElementById('humidityValue');
let climateDataEnabled = false;
let climateIntervalId = null;

function updateClimateData(temp, hum){
    console.log("getClimateData: " + `${temp}°C`+ " " + `${hum}%`);
    tempDisplay.innerText=`${temp}°C`;
    humidityDisplay.innerText = `${hum}%`;
}

function toggleClimateData() {
    playClickSound();
    climateDataEnabled = !climateDataEnabled;
    
    if (climateDataEnabled) {
        climateToggle.innerHTML = "Raumklima: An";
        climateToggle.style.color = "green";
        document.getElementById('climateDisplay').style.display="block";
        climateIntervalId = setInterval(() => {
            fetch("/climate/get")
                .then(response => response.json())
                .then(result => {
                    if (result.status === "success" && result.data) {
                        const { temperature, humidity } = result.data;
                        updateClimateData(temperature, humidity);
                    } else {
                        showErrorMessage("Fehler beim Abrufen der Klima", result.message);
                    }
                })
                .catch(error => console.error("Fetch-Fehler:", error));
        }, 1000);
    } else {
        clearInterval(climateIntervalId);
        climateToggle.innerHTML = "Raumklima: Aus";
        climateToggle.style.color = "red";
        document.getElementById('climateDisplay').style.display="none";
    }
    updateConfig("isClimateDataEnabled", climateDataEnabled);
}


// Codeblock to toggle Display of Song-Data
let songDisplay = false;
function toggleSongDisplay() {
    playClickSound();
    songDisplay = !songDisplay;

    if(songDisplay){
        document.getElementById('songDisplay').style.display="block"
        document.getElementById('showSong').innerText="Musik Informationen: An";
        document.getElementById('showSong').style.color="green";
    } else {
        document.getElementById('songDisplay').style.display="none";
        document.getElementById('showSong').innerText="Musik Informationen: Aus";
        document.getElementById('showSong').style.color="red";
    }
    updateConfig("isSongDisplayEnabled", songDisplay);
}

// Codeblock to toggle Position and GPS Data
let posDisplay = false;

async function fetchGPSData(){
    try {
        const response = await fetch("http://127.0.0.1:5000/gps/get");
        const result = await response.json();

        if (result.status === "success" && result.data) {
            const { latitude, longitude, altitude, speed, direction, satellites, local_time } = result.data;
            
            if(posDisplay){
                updatePosition(direction, speed, altitude, satellites);
            }
            updateMapPage(latitude, logging, altitude, speed, direction, satellites);
        } else {
            showErrorMessage("GPS Fehler", result.message);
            return;
        }
    } catch (error) {
        showErrorMessage("GPS Fehler", error.message);
        return;
    }
}

function updatePosition(directionDeg, speed, altitude, numSatellit) {
    const directionText = getDirectionText(directionDeg);
    const compass = document.getElementById("compass");
    const speedElement = document.getElementById("speed");
    const altitudeElement = document.getElementById("altitude");
    const altArrow = document.getElementById("altArrow");
    const satellitElement = document.getElementById('numSatellit');

    document.getElementById("direction").textContent = directionText;
    compass.style.transform = `rotate(${directionDeg}deg)`;

    speedElement.textContent = `${Math.floor(speed)}`;
    altitudeElement.textContent = `${Math.round(altitude)}`;
    altArrow.textContent = altitude > 0 ? "⬆" : altitude < 0 ? "⬇" : "⏤";
    satellitElement.textContent = numSatellit;
}

function getDirectionText(deg) {
    const directions = ["N", "NO", "O", "SO", "S", "SW", "W", "NW", "N"];
    const index = Math.round(deg / 45);
    return directions[index];
}

function togglePosDisplay() {
    playClickSound();
    posDisplay = !posDisplay;

    if (posDisplay) {
        document.getElementById('positionDisplay').style.display = "flex";
        document.getElementById('showPos').innerText = "GPS Daten: An";
        document.getElementById('showPos').style.color = "green";
    } else {
        document.getElementById('positionDisplay').style.display = "none";
        document.getElementById('showPos').innerText = "GPS Daten: Aus";
        document.getElementById('showPos').style.color = "red";
    }
    updateConfig("isPosDisplayEnabled", posDisplay);
}

setTimeout(() => {
    fetchGPSData();
}, 1000);


// Codeblock for touch-sound (toggle and Volume)
const clickSoundPath = '../static/media/sounds/clickSound.mp3';
let isPlayClickSound = true;
let lastClickVolume = 1;
const audio = new Audio(clickSoundPath);
audio.volume = lastClickVolume;

function playClickSound() {
    if (isPlayClickSound && audio.volume > 0) {
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
}

function togglePlayClickSound() {
    isPlayClickSound = !isPlayClickSound;
    
    if (isPlayClickSound) {
        audio.volume = lastClickVolume;
        playClickSound();
        document.getElementById('clickSoundToggle').innerText = "Touch Sound: An";
        document.getElementById('clickSoundToggle').style.color = "green";
    } else {
        lastClickVolume = audio.volume;
        audio.volume = 0;
        document.getElementById('clickSoundToggle').innerText = "Touch Sound: Aus";
        document.getElementById('clickSoundToggle').style.color = "red";
    }
    updateVolumeDisplay(audio.volume);
    updateConfig("isTouchSoundEnabled", isPlayClickSound);
}

function updateVolumeDisplay(volume) {
    const bars = document.querySelectorAll('.volumeBar');
    bars.forEach((bar, index) => {
        bar.classList.toggle('active', index < volume / 0.25);
    });
}

function setClickSoundVolume(louder) {
    let newVolume = louder ? Math.min(audio.volume + 0.25, 1) : Math.max(audio.volume - 0.25, 0);
    
    if (!isPlayClickSound && newVolume > 0) {
        isPlayClickSound = true;
        document.getElementById('clickSoundToggle').innerText = "Touch Sound: An";
        document.getElementById('clickSoundToggle').style.color = "green";
    }
    audio.volume = newVolume;
    playClickSound();
    lastClickVolume = newVolume;
    updateVolumeDisplay(newVolume);
    updateConfig("touchSoundValue", newVolume);
}

document.addEventListener("DOMContentLoaded", () => {
    updateVolumeDisplay(audio.volume);
});


// Codeblock for sleepTimer (toggle and duration)
let sleepTimerActive = false;
let sleepTimerTimeout;

const sleepTimerToggle = document.getElementById('sleepTImerToggle');
const sleepTimerDiv = document.getElementById('sleepTimer');
const timeIndicator = document.getElementById('timeIndicator');

const timeOptions = [60000, 300000, 600000, 3600000, 10800000, 0];
const timeTexts = ["1 Min.", "5 Min.", "10 Min.", "1 Std.", "3 Std.", "Nie"];
let currentSleepTimerIndex = 0;
let lastSleepTimerIndex = currentSleepTimerIndex;

function startSleepTimer() {
    clearTimeout(sleepTimerTimeout);
    if (sleepTimerActive && timeOptions[currentSleepTimerIndex] > 0) {
        sleepTimerTimeout = setTimeout(() => {
            sleepTimerDiv.style.display = 'block';
        }, timeOptions[currentSleepTimerIndex]);
    }
}

function toggleSleepTimer() {
    sleepTimerActive = !sleepTimerActive;

    if (sleepTimerActive) {
        currentSleepTimerIndex = lastSleepTimerIndex;
        sleepTimerToggle.textContent = "SleepTimer: An";
        sleepTimerToggle.style.color = "green";
        startSleepTimer();
    } else {
        lastSleepTimerIndex = currentSleepTimerIndex;
        currentSleepTimerIndex = 5;
        clearTimeout(sleepTimerTimeout);
        sleepTimerDiv.style.display = 'none';
        sleepTimerToggle.textContent = "SleepTimer: Aus";
        sleepTimerToggle.style.color = "red";
        updateConfig("sleepTimerActive", false);
    }
    updateTimeIndicator();
    updateConfig("sleepTimerActive", sleepTimerActive);
}

function changeSleepTimer(increase) {
    if (!sleepTimerActive) {
        toggleSleepTimer();
    }

    if (increase) {
        currentSleepTimerIndex = Math.min(currentSleepTimerIndex + 1, timeOptions.length - 1);
    } else {
        currentSleepTimerIndex = Math.max(currentSleepTimerIndex - 1, 0);
    }
    
    if (currentSleepTimerIndex === 5) {
        sleepTimerActive = false;
        toggleSleepTimer();
    } else {
        startSleepTimer();
    }
    updateTimeIndicator();
    updateConfig("sleepTimerIndex", currentSleepTimerIndex);
}
function updateTimeIndicator() {
    timeIndicator.textContent = timeTexts[currentSleepTimerIndex];
}
sleepTimerDiv.addEventListener("pointerdown", function () {
    if (sleepTimerActive) {
        sleepTimerDiv.style.display = "none";
    }
    startSleepTimer();
});










// MAP
//#########################################################################################################################################
//#########################################################################################################################################
//#########################################################################################################################################

function updateMapPage(latitude, longitude, altitude, speed, direction, satellites){
    updateGPSView(latitude, longitude, altitude, speed, direction, satellites);
    updateMap(latitude, longitude);
}

const latView = document.getElementById("latView");
const lonView = document.getElementById("lonView");
const altView = document.getElementById("altView");
const speView = document.getElementById("speView");
const traView = document.getElementById("traView");
const satView = document.getElementById("satView");
function updateGPSView(latitude, longitude, altitude, speed, direction, satellites){
    latView.innerText = latitude;
    lonView.innerText = longitude;
    altView.innerText = altitude;
    speView.innerText = speed;
    traView.innerText = direction+"°";
    satView.innerText = satellites;
}

async function updateMap(lat, long) {
    //set the new Position in the Map
}
