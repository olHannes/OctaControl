#!/bin/bash

PYTHON_COMMAND="python3 /home/hannes/Documents/OctaControl/temp_project/app.py"
BROWSER_COMMAND="chromium-browser http://127.0.0.1:5000 --start-fullscreen --disable-session-crashed-bubble --disable-infobars"
UNCLUTTER_COMMAND="unclutter -idle 0"

AUTOSTART_DIR="$HOME/.config/autostart"
DESKTOP_FILE="$AUTOSTART_DIR/octacontrol-app.desktop"
CHROMIUM_AUTOSTART_FILE="$AUTOSTART_DIR/chromium-browser.desktop"
UNCLUTTER_AUTOSTART_FILE="$AUTOSTART_DIR/unclutter.desktop"

if [ ! -d "$AUTOSTART_DIR" ]; then
    mkdir -p "$AUTOSTART_DIR"
else
    echo "Leere das Autostart-Verzeichnis..."
    rm -rf "$AUTOSTART_DIR"/*
fi

add_python_to_autostart() {
    echo "Füge Python-Programm zum Autostart hinzu..."
    echo -e "[Desktop Entry]\nName=OctaControl App\nComment=Start OctaControl App on startup\nExec=$PYTHON_COMMAND\nIcon=utilities-terminal\nTerminal=true\nType=Application\nX-GNOME-Autostart-enabled=true" > "$DESKTOP_FILE"
}

add_chromium_to_autostart() {
    echo "Füge Chromium-Browser im Vollbildmodus zum Autostart hinzu..."
    echo -e "[Desktop Entry]\nName=Chromium Fullscreen\nComment=Start Chromium in Fullscreen Mode\nExec=$BROWSER_COMMAND\nIcon=web-browser\nTerminal=false\nType=Application\nX-GNOME-Autostart-enabled=true" > "$CHROMIUM_AUTOSTART_FILE"
}

add_unclutter_to_autostart() {
    echo "Füge unclutter hinzu, um den Mauszeiger auszublenden..."
    echo -e "[Desktop Entry]\nName=Unclutter\nComment=Hide Mouse Cursor\nExec=$UNCLUTTER_COMMAND\nIcon=cursor\nTerminal=false\nType=Application\nX-GNOME-Autostart-enabled=true" > "$UNCLUTTER_AUTOSTART_FILE"
}

add_python_to_autostart
add_chromium_to_autostart
add_unclutter_to_autostart

echo "Autostart-Einträge wurden überprüft, geleert und hinzugefügt."
