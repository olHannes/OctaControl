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
1. Bluetooth steuern: <Ein | Aus>
2. Pairingmodus: <Ein | Aus>

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
3. **Neustarten**:
    ```bash
   sudo reboot
