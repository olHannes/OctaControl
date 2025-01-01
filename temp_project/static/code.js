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


/**audio Control */
function pauseAudio(){

}
function playAudio(){

}
function skipAudio(){

}
function prevAudio(){

}
function getInfoAudio(){

}


/**The following part represents the functions for the bluetooth control */

const bluetoothToggle = document.getElementById('bluetoothToggle');
const pairingToggle = document.getElementById('pairingToggle');

let isBluetoothOn = false;
let isPairingOn = false;

bluetoothToggle.addEventListener('click', () => {
    isBluetoothOn = !isBluetoothOn;
    if (isBluetoothOn) {
        bluetoothToggle.src = '../static/media/turnOn.png';
        enableBt();
    } else {
        bluetoothToggle.src = '../static/media/turnOff.png';
        disableBt();
    }
});

pairingToggle.addEventListener('click', () => {
    isPairingOn = !isPairingOn;
    if (isPairingOn) {
        pairingToggle.src = '../static/media/BTPairingOn.png';
        enablePairingMode();
    } else {
        pairingToggle.src = '../static/media/BTPairingOff.png';
        disablePairingMode();
    }
});

function enableBt() {
    console.log("Bluetooth eingeschaltet.");

}

function disableBt() {
    console.log("Bluetooth ausgeschaltet.");

    
    pairingToggle.src = '../static/media/BTPairingOff.png';
    isPairingOn=false;
}

function enablePairingMode() {
    console.log("Pairing-Modus aktiviert.");
}

function disablePairingMode() {
    console.log("Pairing-Modus deaktiviert.");
}








