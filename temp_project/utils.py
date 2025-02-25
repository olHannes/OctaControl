import os
import subprocess
import time
import datetime
import json
import threading
import pytz
import gps
import eventlet

import RPi.GPIO as GPIO
import board
import serial
import alsaaudio
import adafruit_dht

from flask_socketio import emit
from flask import jsonify

from app import socketio

trunkPowerPin = 23
climatePin = 25
dht_device = adafruit_dht.DHT11(board.D25)

FILE_PATH = "climateData.txt"
climateLock = threading.Lock()

def save_climate_data(temperature, humidity):
    data = {"temperature": temperature, "humidity": humidity}
    with climateLock:
        with open(FILE_PATH, "w") as file:
            json.dump(data, file)

def load_climate_data():
    try:
        with climateLock:
            with open(FILE_PATH, "r") as file:
                return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"temperature": 0, "humidity": 0}



def update_config(key, value, file_path=os.path.expanduser("~/Documents/settings.json")):
    try:
        if not os.path.exists(file_path):
            with open(file_path, 'w') as file:
                json.dump({}, file)

        with open(file_path, 'r') as file:
            try:
                config = json.load(file)
            except json.JSONDecodeError:
                config = {}

        config[key] = value

        with open(file_path, 'w') as file:
            json.dump(config, file, indent=4)

        print(f"Updated {key} to {value} in {file_path}")
        return True

    except Exception as e:
        print(f"Error updating config: {e}")
        return False




@socketio.on("connect")
def handle_connect():
    print("Client verbunden")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client getrennt")




def run_bluetoothctl_command(command):
    try:
        result = subprocess.run(
            ["bluetoothctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_playerctl_command(command):
    try:
        result = subprocess.run(
            ["playerctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_amixer_command(command):
    try:
        result = subprocess.run(
            ["amixer"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)


# ---------------------- ALSA HELPER ----------------------
master_volume = 100 

def set_volume_with_alsa(volume):
    global master_volume
    try:
        mixer = alsaaudio.Mixer()
        master_volume = max(0, min(100, int(volume)))
        mixer.setvolume(master_volume)
        print(f"Master-Volume set to {master_volume}%")
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")

def get_volume_with_alsa():
    try:
        mixer = alsaaudio.Mixer()
        volume = mixer.getvolume()[0]
        is_muted = mixer.getmute()[0] == 1
        return volume, is_muted
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")


def set_balance(balance):
    global master_volume
    try:
        mixer = alsaaudio.Mixer()
        balance = max(-100, min(100, balance))

        if balance < 0:
            left = master_volume
            right = int(master_volume * (1 + balance / 100))
        elif balance > 0:
            right = master_volume
            left = int(master_volume * (1 - balance / 100))
        else:
            left = right = master_volume

        mixer.setvolume(left, 0)
        mixer.setvolume(right, 1)

        print(f"Balance set: Left = {left}%, Right = {right}%")
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")

def get_balance():
    try:
        mixer = alsaaudio.Mixer()
        left, right = mixer.getvolume()

        if left == right:
            return 0
        elif left > right:
            return -int(100 * (1 - (right / left)))
        else:
            return int(100 * (1 - (left / right)))
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")



def enable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "on"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "on"], check=True)
        return {"status": "success", "message": "Pairing mode enabled. Raspberry Pi is now discoverable and pairable."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "off"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "off"], check=True)
        return {"status": "success", "message": "Pairing mode disabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
    
def enable_bluetooth():
    try:
        subprocess.run(["rfkill", "unblock", "bluetooth"], check=True)
        return {"status": "success", "message": "Bluetooth enabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_bluetooth():
    try:
        subprocess.run(["rfkill", "block", "bluetooth"], check=True)
        return {"status": "success", "message": "Bluetooth disabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
    


def reboot_system():
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return {"status": "success", "message": "Reboot initiated successfully"}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"Reboot command failed: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}

def shutdown_system():
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return {"status": "success", "message": "Shutdown initiated successfully"}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"Shutdown command failed: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}


def update_system():
    script_absolute_path = "/home/hannes/Documents/OctaControl/updateOctaControl.sh"

    try:
        subprocess.run(["bash", script_absolute_path], check=True)
        print(f"{script_absolute_path} erfolgreich ausgeführt.")
    except subprocess.CalledProcessError as e:
        print(f"Fehler beim Ausführen des Skripts: {e}")
    except FileNotFoundError:
        print("Das angegebene .sh-Skript wurde nicht gefunden.")

def getVersion():
    project_dir = "/home/hannes/Documents/OctaControl/temp_project"
    try:
        commit_hash = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=project_dir).decode("utf-8").strip()
        commit_date = subprocess.check_output(["git", "log", "-1", "--format=%cd", "--date=short"], cwd=project_dir).decode("utf-8").strip()
        return {"commit": commit_hash, "date": commit_date}
    except subprocess.CalledProcessError:
        return {"commit": "unknown", "date": "unknown"}


def getGitLog():
    project_dir = "/home/hannes/Documents/OctaControl/temp_project"
    try:
        log_output = subprocess.check_output(
            ["git", "log", "-10", "--format=%cd|%h|%s", "--date=short"], cwd=project_dir
        ).decode("utf-8").strip()
        
        commits = []
        for line in log_output.split("\n"):
            date, commit_hash, message = line.split("|", 2)
            commits.append({"date": date, "commit": commit_hash, "message": message})
        
        return commits
    except subprocess.CalledProcessError:
        return []
    

def enable_wlan():
    try:
        subprocess.run(["rfkill", "unblock", "wifi"], check=True)
        return {"status": "success", "message": "WLAN wurde eingeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_wlan():
    try:
        subprocess.run(["rfkill", "block", "wifi"], check=True)
        return {"status": "success", "message": "WLAN wurde ausgeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def getWlanStatus():
    try:
        result = subprocess.run(["rfkill", "list", "wifi"], capture_output=True, text=True, check=True)
        output = result.stdout.lower()
        
        if "soft blocked: yes" in output or "hard blocked: yes" in output:
            return {"status": "disabled", "message": "WLAN ist deaktiviert."}
        else:
            return {"status": "enabled", "message": "WLAN ist aktiviert."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def initializeGPIO():
    if not GPIO.getmode():
        GPIO.setmode(GPIO.BCM)
    try:
        GPIO.cleanup(trunkPowerPin)
        GPIO.setup(trunkPowerPin, GPIO.OUT)
    except RuntimeError:
        pass
    print(f"GPIO trunkPowerPin '{trunkPowerPin}' wurde aktualisiert")

def enableTrunkPower():
    initializeGPIO()
    GPIO.output(trunkPowerPin, GPIO.HIGH)

def disableTrunkPower():
    initializeGPIO()
    GPIO.output(trunkPowerPin, GPIO.LOW)


def getBrightness():
    return {
        "brightness": 0
    }




def climatedata_reader():
    while True:
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            data = {
                "temperature": temperature,
                "humidity": humidity
            }

            if temperature is not None and humidity is not None:
                print(f"temp: {temperature}, hum: {humidity}")
                #save_climate_data(temperature, humidity)
                socketio.emit("climatedata_update", data)
        except Exception as e:
            print(f"Fehler beim Lesen der Klimadaten: {e}")
        eventlet.sleep(5)


from AudioMetadata import *

def metadata_reader():
    while True:
        try:
            metadata = getMeta()
            socketio.emit("metadata_update", metadata)
        except Exception as e:
            print(f"Metadata Fehler: {e}")
        eventlet.sleep(1)

def gps_reader():
    session = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)
    
    while True:
        try:
            report = session.next()

            if report['class'] == 'TPV':  
                latitude = round(getattr(report, 'lat', 0.0), 5)
                longitude = round(getattr(report, 'lon', 0.0), 5)

                altitude = getattr(report, 'alt', 0.0)

                speed = round(getattr(report, 'speed', 0.0) * 3.6, 2)

                track = getattr(report, 'track', 0.0)

                satellites = session.satellites_used if hasattr(session, 'satellites_used') else "N/A"

                utc_time = getattr(report, 'time', None)
                local_time = "N/A"
                if utc_time:
                    utc_dt = datetime.datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%S.%fZ")
                    utc_dt = utc_dt.replace(tzinfo=pytz.utc)
                    local_tz = pytz.timezone("Europe/Berlin")
                    local_time = utc_dt.astimezone(local_tz).strftime("%Y-%m-%d %H:%M:%S")

                gps_data = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "altitude": altitude,
                    "speed": speed,
                    "direction": track,
                    "satellites": satellites,
                    "local_time": local_time,
                }
                
                socketio.emit("gps_update", gps_data)

            eventlet.sleep(1)

        except Exception as e:
            print(f"Error while reading gps Data: {e}")
            time.sleep(5)


def setSystemTime():
    session = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)
    print("Warte auf gültige GPS-Zeit...")
    
    while True:
        try:
            report = session.next()
            
            if report['class'] == 'TPV':
                utc_time = getattr(report, 'time', None)
                
                if utc_time:
                    utc_dt = datetime.datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%S.%fZ")
                    
                    formatted_time = utc_dt.strftime("%Y-%m-%d %H:%M:%S")
                    subprocess.run(["sudo", "timedatectl", "set-time", formatted_time])
                    
                    print(f"Systemzeit auf {formatted_time} gesetzt.")
                    break
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Fehler beim Lesen der GPS-Zeit: {e}")
            time.sleep(5)