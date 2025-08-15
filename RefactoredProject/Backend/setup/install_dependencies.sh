#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/OctaControl/RefactoredProject"
VENV_DIR="$PROJECT_DIR/venv"

echo "Systempakete installieren..."
sudo apt-get update
sudo apt-get install -y \
    python3-venv \
    python3-dev \
    python3-gi \
    python3-gi-cairo \
    gir1.2-glib-2.0 \
    libdbus-1-dev \
    libdbus-glib-1-dev \
    python3-rpi.gpio \
    unclutter

echo "Virtuelle Umgebung anlegen..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi

echo "Aktiviere virtuelle Umgebung und installiere Python-Pakete..."
"$VENV_DIR/bin/pip" install --upgrade pip setuptools wheel

"$VENV_DIR/bin/pip" install \
    flask \
    flask-cors \
    adafruit-circuitpython-dht \
    adafruit-blinka \
    pyalsaaudio \
    pydbus \
    pillow \
    RPi.GPIO

echo "Installation in virtueller Umgebung abgeschlossen!"
