#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/OctaControl/RefactoredProject"
VENV_DIR="$PROJECT_DIR/.venv"

# Virtuelle Umgebung aktivieren
if [ ! -d "$VENV_DIR" ]; then
    echo "Fehler: Virtuelle Umgebung nicht gefunden in $VENV_DIR"
    echo "Bitte zuerst ./install_dependencies.sh ausführen."
    exit 1
fi

source "$VENV_DIR/bin/activate"

# App starten (Ausgaben erscheinen direkt im Terminal)
python "$PROJECT_DIR/Backend/app.py"
