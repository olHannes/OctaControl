#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/OctaControl/RefactoredProject"
VENV_DIR="$PROJECT_DIR/.venv"

echo "Systempakete installieren..."
sudo apt-get update && sudo apt upgrade -y

sudo apt-get install -y \
    python3-venv \
    python3-dev \
    python3-gi \
    python3-gi-cairo \
    gir1.2-glib-2.0 \
    libdbus-1-dev \
    libdbus-glib-1-dev \
    libcairo2-dev \
    libgirepository1.0-dev \
    python3-rpi.gpio \
    libgpiod2 \
    i2c-tools \
    python3-smbus \
    libasound2-dev \
    bluetooth \
    bluez \
    bluez-tools \
    libbluetooth-dev \
    unclutter \
    pkg-config


echo "Virtuelle Umgebung erstellen..."

if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv --system-site-packages "$VENV_DIR"
fi

echo "Python-Pakete installieren..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r "$PROJECT_DIR/Backend/setup/requirements.txt"

sudo apt-get autoremove -y
sudo apt-get clean

echo "Installation abgeschlossen!"
