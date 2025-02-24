#!/bin/bash

cd /home/hannes/Documents/OctaControl/temp_project/ || { echo "error cd the directory"; exit 1; }

git reset --hard || { echo "error while reset the repo"; exit 1; }
git pull || { echo "error pulling repo"; exit 1; }

cd /home/hannes/Documents/OctaControl/ || { echo "error returning the directory"; exit 1; }
chmod +x addAutostart.sh || { echo "error chmod of addAutostart"; exit 1; }
bash addAutostart.sh || { echo "error executing addAutostart"; exit 1; }


cd /home/hannes/Documents/OctaControl/temp_project/ || { echo "error cd the directory"; }

python3 installDependencies.py || { echo "error installing dependencies"; exit 1; }


exit 0
