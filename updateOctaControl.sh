cd /home/hannes/Documents/OctaControl/temp_project/ || { echo "error cd the directory"; }
git reset --hard || { echo "error while reset the repo"; }
git pull || { echo "error pulling repo"; }

python3 installDependencies.py || { echo "error installing dependencies"; }

cd /home/hannes/Documents/OctaControl/ || { echo "echo returning the directory"; }

chmod x addAutostart.sh || { echo "error chmod of addAutostart"; }
bash addAutostart.sh || { echo "error exeuting addAutostart"; }

exit 0;
