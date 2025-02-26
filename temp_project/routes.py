from flask import Blueprint, jsonify, request
from flask_socketio import emit
import os
import subprocess
import json

from BluetoothController import *
from AudioMetadata import *
from utils import *


app_routes = Blueprint('app_routes', __name__)




# Audio Routes
@app_routes.route("/audio/play", methods=["POST"])
def play_audio():
    try:
        player = BluetoothController()
        player.play()
        return jsonify({"status": "success", "message": "Playback started"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/pause", methods=["POST"])
def pause_audio():
    try:
        player = BluetoothController()
        player.pause()
        return jsonify({"status": "success", "message": "Playback paused"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/skip", methods=["POST"])
def skip_audio():
    try:
        player = BluetoothController()
        player.next()
        return jsonify({"status": "success", "message": "Skipped to the next track"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/previous", methods=["POST"])
def previous_audio():
    try:
        player = BluetoothController()
        player.previous()
        return jsonify({"status": "success", "message": "Went to the previous track"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app_routes.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    """Flask route to get audio information."""
    try:
        metadata = getMeta()
        return jsonify({
            "status": "success",
            "information": metadata
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/player", methods=["GET"])
def getPlayer():
    try:
        name = getPlayerDeviceName()
        return jsonify({
            "status": "success",
            "player": name
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

"""Route to get Song-Process"""
@app_routes.route("/audio/progress", methods=["GET"])
def requestProgress():
    try:
        progress = getProgress()
        return jsonify({
            "status": "success",
            "progress": progress
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
@app_routes.route("/audio/isPlaying", methods=["GET"])
def requestSongPlaying():
    try:
        running = getIsRunning()
        return jsonify({
            "status": "success",
            "playStatus": running
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


# Bluetooth routes
@app_routes.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    result = enable_bluetooth()
    return jsonify(result)

@app_routes.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    result = disable_bluetooth()
    return jsonify(result)

@app_routes.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    result = enable_pairing_mode()
    return jsonify(result)

@app_routes.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    result = disable_pairing_mode()
    return jsonify(result)


# Wlan routes
@app_routes.route("/wlan/on", methods=["POST"])
def wlan_on():
    result = enable_wlan()
    return jsonify(result)

@app_routes.route("/wlan/off", methods=["POST"])
def wlan_off():
    result = disable_wlan()
    return jsonify(result)

@app_routes.route("/wlan/status", methods=["GET"])
def requestWlanStatus():
    result = getWlanStatus()
    return jsonify(result)


# Volume-Routen
@app_routes.route("/volume/get", methods=["GET"])
def get_volume_route():
    try:
        volume, is_muted = get_volume_with_alsa()
        return jsonify({"status": "success", "volume": volume, "is_muted": is_muted}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app_routes.route("/volume/set", methods=["POST"])
def set_volume_route():
    data = request.json
    if not data or "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400

    try:
        volume = int(data["volume"])
        if 0 <= volume <= 100:
            set_volume_with_alsa(volume)
            return jsonify({"status": "success", "message": f"Volume set to {volume}%"}), 200
        else:
            raise ValueError("Volume must be between 0 and 100.")
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app_routes.route("/balance/get", methods=["GET"])
def get_balance_route():
    try:
        balance = get_balance()
        return jsonify({"status": "success", "balance": balance}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app_routes.route("/balance/set", methods=["POST"])
def set_balance_route():
    data = request.json
    if not data or "balance" not in data:
        return jsonify({"status": "error", "message": "Please provide a balance value."}), 400

    try:
        balance = int(data["balance"])
        if -100 <= balance <= 100:
            set_balance(balance)
            return jsonify({"status": "success", "message": f"Balance set to {balance}"}), 200
        else:
            raise ValueError("Balance must be between -100 and 100.")
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# system and power routes

@app_routes.route("/powerOptions/reboot", methods=["POST"])
def reboot():
    try:
        result = reboot_system()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app_routes.route("/powerOptions/shutdown", methods=["POST"])
def shutdown():
    try:
        result = shutdown_system()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app_routes.route("/system/update", methods=["POST"])
def update():
    try:
        result = update_system()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app_routes.route("/system/version/current", methods=["GET"])
def requestVersion():
    result = getVersion()
    return jsonify(result)
@app_routes.route("/system/version/log", methods=["GET"])
def requestGitLog():
    result = getGitLog()
    return jsonify(result)

@app_routes.route("/system/powerOptions/trunkPower/enable", methods=["POST"])
def requestTrunkPowerOn():
    try:
        enableTrunkPower()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app_routes.route("/system/powerOptions/trunkPower/disable", methods=["POST"])
def requestTrunkPowerOff():
    try:
        disableTrunkPower()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app_routes.route("/system/config", methods=["GET"])
def requestConfig():
    try:
        json_file_path = os.path.expanduser("~/Documents/settings.json")
        
        if not os.path.exists(json_file_path):
            return jsonify({"status": "error", "message": "JSON file not found"}), 404
        
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)
        return jsonify(data)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/system/config", methods=["POST"])
def updateConfig():
    try:
        data = request.get_json()
        if "key" not in data or "value" not in data:
            return jsonify({"status": "error", "message": "Missing 'key' or 'value' in request"}), 400

        key = data["key"]
        value = data["value"]
        if update_config(key, value):
            return jsonify({"status": "success", "message": f"Updated {key} to {value}"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to update config"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app_routes.route("/features/adaptiveBrightness", methods=["GET"])
def requestadaptiveBrightness():
    try:
        result = getBrightness()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500




#Ab hier: Websockets
#########################################################################################
#########################################################################################
#########################################################################################
import pytz
import gps
import time
import datetime
from flask_sock import Sock


connected_clients = []


@sock.route('/climate_data')
def climate_data(ws):
    connected_clients.append(ws)
    try:
        while True:
            message = ws.receive()
    except Exception as e:
        print(f"Fehler bei der WebSocket-Verbindung: {e}")
    finally:
        connected_clients.remove(ws)

def climatedata_reader():
    global connected_clients
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
                for client in connected_clients:
                    client.send(data)

        except Exception as e:
            print(f"Fehler beim Lesen der Klimadaten: {e}")
        time.sleep(5)



from AudioMetadata import *

def metadata_reader():
    from app import socketio
    while True:
        try:
            metadata = getMeta()
            socketio.emit("metadata_update", metadata)
        except Exception as e:
            print(f"Metadata Fehler: {e}")
        time.sleep(2)

def gps_reader():
    from app import socketio
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

            time.sleep(1)

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