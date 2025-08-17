#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/OctaControl/RefactoredProject"
VENV_DIR="$PROJECT_DIR/.venv"

echo "Systempakete installieren..."
sudo apt-get update
sudo apt-get install -y \
    python3-gi \
    python3-gi-cairo \
    gir1.2-glib-2.0 \
    libdbus-1-dev \
    libdbus-glib-1-dev \
    python3-venv \
    unclutter \
    libcairo2-dev \
    libgirepository1.0-dev \
    pkg-config \
    python3-dev


echo "Virtuelle Umgebung erstellen..."

if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv --system-site-packages "$VENV_DIR"
fi

echo "Python-Pakete installieren..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r "$PROJECT_DIR/Backend/setup/requirements.txt"

echo "Installation abgeschlossen!"
