#!/bin/bash

git pull || { echo "error: git pull failed"; exit 1; }

chmod +x update.sh || { echo "error: chmod +x update.sh failed"; exit 1; }

cd temp_project || { echo "error: cd temp_project failed"; exit 1; }

python3 installDependencies.py || { echo "error: installDependencies.py failed"; }

sudo reboot || { echo "error: reboot failed"; exit 1; }
