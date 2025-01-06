#!/bin/bash

# Absoluten Pfad des aktuellen Skripts bestimmen
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# 1. Git Pull
git pull || { echo "error: git pull failed"; exit 1; }

# 2. Rechte setzen (nur auf das Skript selbst)
chmod +x "$SCRIPT_DIR/update.sh" || { echo "error: chmod +x update.sh failed"; exit 1; }

# 3. Wechsel in das temp_project-Verzeichnis
cd "$SCRIPT_DIR/temp_project" || { echo "error: cd temp_project failed"; exit 1; }

# 4. Abhängigkeiten installieren
python3 installDependencies.py || { echo "error: installDependencies.py failed"; }

# 5. Neustart des Systems
sudo reboot || { echo "error: reboot failed"; exit 1; }
