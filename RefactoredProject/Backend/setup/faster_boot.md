# Raspberry Pi 4: Kiosk + Flask Boot Optimierung

## Hardwareseitige Optimierungen

1. **USB-SSD statt SD-Karte**

   * Nutze eine **gute SSD** (SATA oder NVMe mit USB3-Adapter).
   * Vorteile: schnellere Bootzeit, stabilere Performance, längere Lebensdauer.
   * Anschluss: **USB 3.0-Port (blau)** des Pi 4 für maximale Geschwindigkeit.

2. **Schnelle SD-Karte (falls SSD nicht möglich)**

   * UHS-I / A2-Karten, z. B. **SanDisk Extreme A2**.
   * Keine billigen NoName-Karten – die bremsen massiv.

3. **Power-Management / Auto-Start**

   * Optional: Power-HAT oder Relais, um Pi beim Zündung-Ein automatisch zu starten.
   * Vorteil: Pi kann Suspend/Resume nutzen statt kompletter Boot.

## Softwareseitige Optimierungen

### 1. Systemdienste prüfen & unnötige deaktivieren

Liste der aktivierten Dienste prüfen:

```bash
systemctl list-unit-files --state=enabled
```

Dienste deaktivieren, die nicht gebraucht werden:

```bash
sudo systemctl disable cups
sudo systemctl disable avahi-daemon
sudo systemctl disable triggerhappy
sudo systemctl disable bluetooth-wakealarm.timer  # nur falls nicht nötig
```

Bluetooth, WLAN und Audio behalten.

### 2. Schnellere Bootkonfiguration

`/boot/cmdline.txt` anpassen:

```text
console=serial0,115200 console=tty1 root=PARTUUID=xxxxxx-02 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait quiet splash
```

* `quiet splash` reduziert Boottext.
* `elevator=deadline` kann bei SD-Karten/SSD den I/O optimieren.

### 3. Flask / Backend optimieren

Gunicorn statt `flask run` nutzen:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Systemd-Unit erstellen `/etc/systemd/system/flask.service`:

```ini
[Unit]
Description=Flask Backend
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/yourapp
ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### 4. Chromium Kiosk schneller starten

Systemd-Unit für Chromium:

```ini
[Unit]
Description=Chromium Kiosk
After=network.target flask.service

[Service]
User=pi
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/usr/bin/chromium-browser --noerrdialogs --kiosk http://localhost:5000 --incognito --disable-translate --disable-features=TranslateUI
Restart=always

[Install]
WantedBy=graphical.target
```

* Chromium startet **erst nach Netzwerk und Flask**, spart Bootzeit-Probleme.

### 5. Optional: Suspend/Resume statt Shutdown

* Mit einem Power-HAT oder Relais kann der Pi in Suspend/Resume gehen, statt komplett herunterzufahren.
* Vorteil: Bootzeit reduziert auf wenige Sekunden, ideal für Auto-Infotainment.

---

Mit diesen Optimierungen sollte dein Pi 4 mit Flask + Chromium Kiosk deutlich schneller starten, ohne dass Bluetooth, WLAN oder Audio verloren gehen.
