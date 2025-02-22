#!/bin/bash

# Arbeitsverzeichnis auf das Projektverzeichnis setzen
PROJECT_DIR="/home/hannes/Documents/OctaControl/temp_project"
PYTHON_COMMAND="python3 $PROJECT_DIR/app.py"
BROWSER_COMMAND="chromium-browser --new-window http://127.0.0.1:5000 \
                 --start-fullscreen \
                 --disable-session-crashed-bubble \
                 --disable-infobars \
                 --disable-popup-blocking \
                 --disable-translate \
                 --noerrdialogs \
                 --overscroll-history-navigation=0 \
                 --incognito"
UNCLUTTER_COMMAND="unclutter -idle 0"

AUTOSTART_DIR="$HOME/.config/autostart"
DESKTOP_FILE="$AUTOSTART_DIR/octacontrol-app.desktop"
CHROMIUM_AUTOSTART_FILE="$AUTOSTART_DIR/chromium-browser.desktop"
UNCLUTTER_AUTOSTART_FILE="$AUTOSTART_DIR/unclutter.desktop"

# Sicherstellen, dass das Verzeichnis existiert
if [ ! -d "$AUTOSTART_DIR" ]; then
    mkdir -p "$AUTOSTART_DIR"
else
    echo "Leere das Autostart-Verzeichnis..."
    rm -rf "$AUTOSTART_DIR"/*
fi

add_python_to_autostart() {
    echo "Füge Python-Programm zum Autostart hinzu..."
    # Setze das Arbeitsverzeichnis vor dem Starten des Python-Skripts
    echo -e "[Desktop Entry]\nName=OctaControl App\nComment=Start OctaControl App on startup\nExec=bash -c 'cd $PROJECT_DIR && $PYTHON_COMMAND'\nIcon=utilities-terminal\nTerminal=true\nType=Application\nX-GNOME-Autostart-enabled=true" > "$DESKTOP_FILE"
}

add_chromium_to_autostart() {
    echo "Füge Chromium-Browser im Vollbildmodus zum Autostart hinzu..."
    echo -e "[Desktop Entry]\nName=Chromium Fullscreen\nComment=Start Chromium in Fullscreen Mode\nExec=bash -c 'sleep 5 && $BROWSER_COMMAND'\nIcon=web-browser\nTerminal=false\nType=Application\nX-GNOME-Autostart-enabled=true" > "$CHROMIUM_AUTOSTART_FILE"
}

add_unclutter_to_autostart() {
    echo "Füge unclutter hinzu, um den Mauszeiger auszublenden..."
    echo -e "[Desktop Entry]\nName=Unclutter\nComment=Hide Mouse Cursor\nExec=$UNCLUTTER_COMMAND\nIcon=cursor\nTerminal=false\nType=Application\nX-GNOME-Autostart-enabled=true" > "$UNCLUTTER_AUTOSTART_FILE"
}

disable_screen_blanking() {
    echo "Deaktiviere das automatische Ausschalten des Displays..."
    export DISPLAY=:0
    xset s off
    xset s noblank
    xset -dpms

    echo "Bildschirm bleibt dauerhaft an."
}

# Einträge zum Autostart hinzufügen
add_python_to_autostart
add_chromium_to_autostart
add_unclutter_to_autostart
disable_screen_blanking

echo "Autostart-Einträge wurden überprüft, geleert und hinzugefügt."
