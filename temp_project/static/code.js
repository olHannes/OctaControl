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

function updateBrightness() {
    const sliderValue = brightnessSlider.value;
    const brightness = sliderValue / 100;
    document.body.style.filter = `brightness(${brightness})`;
}

colorSlider.addEventListener('input', updateBackgroundColor);
brightnessSlider.addEventListener('input', updateBrightness);


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

