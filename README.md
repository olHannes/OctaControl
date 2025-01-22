# OctaControl

OctaControl ist ein einfaches Infotainmentsystem für den Einsatz in meinem Auto. Die Oberfläche ist sehr intuitiv und die Funktionen beschränken sich derzeit auf die Audiokontrolle.

## Pages
- Home
- Music
- Settings


## Home
- navigation zwischen Music- und Settingspage

## Musik & Audiokontrolle

- **Metadaten**: <Titel | Artist | Album | Genre> werden automatisch vom aktiven Bluetoothgerät empfangen und angezeigt.
- **Audiocontrol**: es stehen die folgenden Funktionen zur Verfügung: <Play | Pause | Previous | Skip>.
- **Volumecontrol**: Über einen Regler lässt sich Lautstärke des RaspberryPi's einstellen [0-100].


## Settings

- ### Bluetooth 
1. **Bluetooth steuern**: <Ein | Aus>
2. **Pairingmodus**: <Ein | Aus>

- ### Style
1. **Farbschema**: Die Hintergrundfarbe lässt sich über einen Regler anpassen.
2. **Helligkeit**: Die Helligkeit der Website lässt sich über einen Regler anpassen.

- ### System
1. **Shutdown**: Der RaspberryPi lässt sich direkt von der Seite aus herunterfahren.
2. **Reboot**: Der Pi kann direkt neugestartet werden -> nach einem Update notwendig.
3. **Update**: über 'Update' werden Änderungen aus dem Repo geladen, die Autostartkonfigurationen erneut geladen und alle Abhängigkeiten installiert.


## Installation

1. **Repository klonen**:
   ```bash
   git clone https://github.com/olHannes/OctaControl

2. **Installation durchführen**:
    ```bash
   cd OctaControl
   chmod +x updateOctaControl.sh
   .\updateOctaControl.sh

3. **System anpassen**:
   ```bash
   sudo raspi-config
   -> advanced Options
   change from 'Wayland' to 'X11'

3. **Neustarten**:
    ```bash
   sudo reboot


## Hardware
1. **Computer**
The System is testet on a **Raspberry Pi 3 b+** and on a **Raspberry Pi 4**. The testet Operating System is the Linux Distribution ***Raspberry Pi OS***.

2. **Touchscreen**
For my Project I'm using a 10.1 inch Touchscreen which is connected via HDMI for Video and USB for Power and Touch-function.

3. **Relays**
In my Setup the whole System is powered on, when the car is unlocked. For that i took a signal out of the interior light, which toggles a 12V Relay. This turn on a 12V -> 5V converter which powers the Raspberry Pi.