#!/bin/bash

# Definiere die Befehle für den Autostart
PYTHON_COMMAND="python3 /home/hannes/Documents/OctaControl/temp_project/app.py"
BROWSER_COMMAND="chromium-browser http://127.0.0.1:5000"

# Definiere den Pfad zum Autostart-Verzeichnis
AUTOSTART_DIR="$HOME/.config/autostart"
DESKTOP_FILE="$AUTOSTART_DIR/octacontrol-app.desktop"
CRON_JOB="@reboot $PYTHON_COMMAND"
CHROMIUM_AUTOSTART_FILE="$AUTOSTART_DIR/chromium-browser.desktop"

# Erstelle das Autostart-Verzeichnis, wenn es noch nicht existiert
if [ ! -d "$AUTOSTART_DIR" ]; then
    mkdir -p "$AUTOSTART_DIR"
fi

# Funktion, um Python-Programm zum Autostart hinzuzufügen
add_python_to_autostart() {
    if [ ! -f "$DESKTOP_FILE" ]; then
        echo "Füge Python-Programm zum Autostart hinzu..."
        echo -e "[Desktop Entry]\nName=OctaControl App\nComment=Start OctaControl App on startup\nExec=$PYTHON_COMMAND\nIcon=utilities-terminal\nTerminal=true\nType=Application\nX-GNOME-Autostart-enabled=true" > "$DESKTOP_FILE"
    else
        echo "Python-Programm ist bereits im Autostart."
    fi
}

# Funktion, um Chromium im Vollbildmodus zum Autostart hinzuzufügen
add_chromium_to_autostart() {
    if [ ! -f "$CHROMIUM_AUTOSTART_FILE" ]; then
        echo "Füge Chromium-Browser zum Autostart hinzu..."
        echo -e "[Desktop Entry]\nName=Chromium Fullscreen\nComment=Start Chromium in Kiosk Mode\nExec=$BROWSER_COMMAND\nIcon=web-browser\nTerminal=false\nType=Application\nX-GNOME-Autostart-enabled=true" > "$CHROMIUM_AUTOSTART_FILE"
    else
        echo "Chromium-Browser ist bereits im Autostart."
    fi
}

# Funktion, um den Cron-Job für das Python-Programm hinzuzufügen
add_to_cron() {
    if ! crontab -l | grep -q "$PYTHON_COMMAND"; then
        echo "Füge Cron-Job zum Autostart hinzu..."
        (crontab -l; echo "$CRON_JOB") | crontab -
    else
        echo "Cron-Job für Python-Programm existiert bereits."
    fi
}

# Füge das Python-Programm zum Autostart hinzu
add_python_to_autostart

# Füge Chromium-Browser zum Autostart hinzu
add_chromium_to_autostart

# Füge Cron-Job für das Python-Programm hinzu
add_to_cron

echo "Autostart-Einträge wurden überprüft und hinzugefügt, falls erforderlich."
