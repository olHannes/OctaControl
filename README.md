# OctaControl

OctaControl is a simple infotainment system designed for use in my car. The interface is highly intuitive, and the current features are focused on audio control.

## Pages
- Home
- Map
- Music
- Settings

## Home
- Navigate between the Map, Music and Settings pages.
- Display of several information <GPS Data | Climate Data | Song Information | Clock>

## Music & Audio Control

- **Metadata:** Displays <Title | Artist | Album | Genre> automatically received from the active Bluetooth device.
- **Device:** Shows the current connected Bluetooth Device.
- **Progress Bar:** Shows the current progress of the song as a percentage.
- **Audio Control:** Provides the following functions: <Play | Pause | Previous | Skip>.
- **Volume Control:** Adjust the Raspberry Pi's volume using a slider [0-100].


## Map
- Leaflet Map with Marker for current Position <The card currently requires internet (hotspot) access>
- Map Buttons: <Zoom In | Zoom Out | Return to current Position | Toggle Dark-Mode>
- Information: <Speed | Direction | Latitude | Longitude | Altitude | Satellites>

## Settings
### Connections
#### Bluetooth
1. **Bluetooth Control:** <On | Off>
2. **Pairing Mode:** <On | Off>

#### Wi-Fi
1. **Wi-Fi Control:** <On | Off>

### Style
1. **Color Scheme:** Adjust the background color using a slider.
2. **Brightness:** Adjust the website's brightness using a slider.

### System
1. **Log:** Enable or disable error logging and viewing.
2. **Full-Screen Mode:** Exit full-screen mode if needed.
3. **Sleep Timer:** Enable or disable a 'screensaver' after a specified time.
4. **Shutdown:** Shut down the Raspberry Pi directly from the interface.
5. **Reboot:** Restart the Raspberry Pi directly, necessary after updates.
6. **Update:** Load changes from the repository, reload autostart configurations, and install all dependencies.
7. **Reload:** Reload the browser-page <If the update only contains frontend changes the Reload whould be enough>.

### Trunk-Power
1. **Power toggle:** Toggle the Relais for the trunk-power (stars + amplifier).

### General-Settings
1. **Audio Control:** Opens the Audio-Page to manipulate audio settings <Balance |>.
2. **Touch Sound:** Toggle for touch soundFx <On | Off> + Loudness of these soundFx <0, 0.25, 0.5, 0.75, 1>.
#### Widgets
1. **Clock toggle:** Toggle the Clock Widget on the home-screen <enable | disable>.
2. **Climate Data:** Toggle the Climate Widget on the home-screen <enable | disable>. It contains: <Temperature | Humidity>.
3. **Music Information:** Toggle the Display of Song-Data <Title | Artist> on the home-screen.
4. **GPS Data:** Toggle the Display of GPS-Data <Direction, Height, Speed, Satellites> on the home-page.

#### Features
1. **Power toggle:** Toggle the Relais for the trunk-power (stars + amplifier).
2. **Adaptive Brightness:** Toggle the automatic adjusted brightness of the webpage <Sensor: BH1750>.
3. **Sleep Timer:** Toggle the appearence of the sleepTimer-Window and adjust the time-period after it appears.

**Version:** View the current version <Date + Commit>, including the history of the last 10 commits.

## Installation

1. **Clone the Repository into Documents:**
   ```bash
   cd Documents
   git clone https://github.com/olHannes/OctaControl
   ```

2. **Run the Installation:**
   ```bash
   cd OctaControl
   chmod +x updateOctaControl.sh
   ./updateOctaControl.sh
   ```

3. **Adjust System Settings:**
   ```bash
   sudo raspi-config
   # Navigate to Advanced Options
   # Change display server from 'Wayland' to 'X11'

   # Navigate to Interface Options
   # Turn On: I2C and Serial Port
   ```

4. **Reboot:**
   ```bash
   sudo reboot
   ```

## Hardware

1. **Computer:**
   The system has been tested on a **Raspberry Pi 3 B+** and a **Raspberry Pi 4**. The tested operating system is the Linux distribution ***Raspberry Pi OS***.

2. **Touchscreen:**
   For this project, a 10.1-inch touchscreen is used, connected via HDMI for video and USB for power and touch functionality. Some styles may need to be adjusted for larger or smaller screens.

3. **Relays:**
   In this setup, the entire system powers on when the car is unlocked. A signal from the interior light toggles a 12V relay, which activates a 12V to 5V converter that powers the Raspberry Pi.

   Another relay is used to enable power delivery in the trunk, controlling the sound system and the starlight ceiling.

4. **Sensors:**
   - BH1750: Lightness Sensor
   - DHT11: Temperature and Humidity Sensor
   - GT-U7: GPS Modul