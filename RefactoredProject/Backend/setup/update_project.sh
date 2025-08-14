#!/bin/bash

set -e

PROJECT_DIR="$HOME/Documents/OctaControl/RefactoredProject"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Fehler: Verzeichnis $PROJECT_DIR existiert nicht."
  exit 1
fi

echo "Wechsle in Verzeichnis $PROJECT_DIR"
cd "$PROJECT_DIR"

echo "Git Reset Hard durchführen..."
git reset --hard

echo "Git Pull durchführen..."
git pull

echo "Update abgeschlossen."
