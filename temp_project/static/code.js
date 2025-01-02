/**function executed when the page is loaded -> initial loadings */
document.addEventListener ("DOMContentLoaded", () => {
	setVolumeSlider(getVolume());
});


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
        const response = await fetch("http://localhost:5000/volume/get");
        const data = await response.json();
        //data contains status, volume, is_muted
        if (data.status === "success") {
            return data.volume;
        } else {
            console.error("Error fetching volume:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function setVolume(volume) {
    console.log(volume+"%");
    try {
        const response = await fetch("http://localhost:5000/volume/set", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ volume })
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("Volume set successfully:", data.message);
        } else {
            console.error("Error setting volume:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


function setVolumeSlider(pValue){
    volumeSlider.value=pValue;
}

function getVolumeSlider(){
    return volumeSlider.value;
}

volumeSlider.addEventListener('input', () => setVolume(getVolumeSlider()));


/**audio music - Control: play, pause, skip, previous */

async function pauseAudio(){
    const buttons = document.querySelectorAll('#musicControl button');
    buttons.forEach(button => button.disabled = true);

    console.log("pause Audio.");
    try {
        const response = await fetch("http://localhost:5000/audio/pause", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("paused Audio");
        } else {
            console.error("Error pausing audio:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
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
        const response = await fetch("http://localhost:5000/audio/play", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("running Audio");
        } else {
            console.error("Error playing audio:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
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
        const response = await fetch("http://localhost:5000/audio/skip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("skipped Audio");
        } else {
            console.error("Error skipping audio:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
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
        const response = await fetch("http://localhost:5000/audio/previous", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log("previous Audio");
        } else {
            console.error("Error previous audio:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
    finally {
        buttons.forEach(button => button.disabled = false);
        setMetaData();
    }
}

async function getInfoAudio() {
    try {
        const response = await fetch("http://localhost:5000/audio/getinformation");
        const data = await response.json();
        if (data.status === "success") {
            console.log("Info Audio:", data.message);
            return data.message;
        } else {
            console.error("Error Info audio:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

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
        } else {
            console.error("Metadata konnte nicht geladen werden.");
        }
    } catch (error) {
        console.error("Error beim Setzen der Metadaten:", error);
    }
}

function setGenreColor(genre){
    const genreColors = {
        "Rock": "#ff0000",
        "Pop": "#00ff00",
        "Jazz": "#0000ff",
        "Classic": "#ff00ff",
        "Rap": "#ffff00",
        "Unknown Genre": "#ffffff"
    };
    const metaData = document.getElementById('metaData');
    const genreColor = genreColors[genre] || genreColors["Unknown Genre"];
    metaData.style.background = `radial-gradient(circle at top center, ${genreColor} 1%, rgb(2, 2, 2) 65%)`;
}

const genres = ["Rock", "Pop", "Jazz", "Classic", "Rap", "Unknown Genre"];

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
    bluetoothHeader.style.opacity="0.3";

    if (!isBluetoothOn) {
        await enableBt();
    } else {
        await disableBt();
    }
    bluetoothToggle.style.pointerEvents = 'auto';
    bluetoothHeader.style.opacity="1";
});

const pairingHeader = document.querySelector('#pairing-container');
pairingToggle.addEventListener('click', async () => {
    pairingToggle.style.pointerEvents = 'none';
    pairingHeader.style.opacity="0.3";
    if (!isPairingOn) {
        await enablePairingMode();
    } else {
        await disablePairingMode();
    }
    pairingToggle.style.pointerEvents = 'auto';
    pairingHeader.style.opacity="1";
});

async function enableBt() {
    console.log("Bluetooth eingeschaltet.");
    bluetoothToggle.style.pointerEvents = 'none';
    try {
        const response = await fetch("http://localhost:5000/bluetooth/on", {
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
            console.error("Error enable Bluetooth:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
    finally{
        bluetoothToggle.style.pointerEvents = 'auto';
    }
}

async function disableBt() {
    console.log("Bluetooth ausgeschaltet.");
    try {
        const response = await fetch("http://localhost:5000/bluetooth/off", {
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
            console.error("Error disable Bluetooth:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    pairingToggle.src = '../static/media/BTPairingOff.png';
    isPairingOn=false;
}

async function enablePairingMode() {
    console.log("Pairing-Modus aktiviert.");
    try {
        const response = await fetch("http://localhost:5000/pairingmode/on", {
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
            console.error("Error enable pairing mode:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function disablePairingMode() {
    console.log("Pairing-Modus deaktiviert.");
    try {
        const response = await fetch("http://localhost:5000/pairingmode/off", {
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
            console.error("Error disable pairing mode:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}








