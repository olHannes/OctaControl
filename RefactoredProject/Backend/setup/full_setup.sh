#!/bin/bash

set -e

chmod +x update_project.sh add_autostart.sh install_dependencies.sh

echo "Starte Projekt-Update..."
./update_project.sh

echo "Starte Autostart-Konfiguration..."
./add_autostart.sh

echo "Starte Installation der Abhängigkeiten..."
./install_dependencies.sh

echo "Alle Schritte abgeschlossen!"

echo "Neustarten in 3 Sekunden..."
sleep 3
sudo reboot