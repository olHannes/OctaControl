from flask import Blueprint, jsonify, request
import os
import json

from BluetoothController import *
from AudioMetadata import *
from utils import *

#define global Fields
app_routes = Blueprint('app_routes', __name__)





#General Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################  
  
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
    


#Audio Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

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





#Bluetooth Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

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

@app_routes.route("/bluetooth/connection/getName", methods=["GET"])
def requestBluetoothName():
    result = getConnBluetoothName()
    return jsonify({"name": result})



#Wlan Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

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


@app_routes.route("/wlan/connection/getAccess", methods=["GET"])
def requestInternetAccess():
    result= getInternetAccess()
    return jsonify(result)

@app_routes.route("/wlan/connection/getName", methods=["GET"])
def requestWlanName():
    result = getConnWlanName()
    return jsonify({"name": result})


#System Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

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
    




#Feature Routes
####################################################################################################################################
####################################################################################################################################
####################################################################################################################################

@app_routes.route("/adaptiveBrightness/get", methods=["GET"])
def requestadaptiveBrightness():
    pBrightnessValues = getBrightnessValues()
    if not pBrightnessValues:
        return jsonify({"status": "error", "message": "No data available"}), 500
    
    avg_brightness = sum(pBrightnessValues) / len(pBrightnessValues)
    return jsonify({"brightness": avg_brightness})


@app_routes.route("/climate/get", methods=["GET"])
def getClimateData():
    try:
        data = load_climate_data()
        return jsonify({
            "status": "success",
            "data": data
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app_routes.route("/gps/get", methods=["GET"])
def getGPSData():
    try:
        data = get_gps_data()
        return jsonify({
            "status": "success",
            "data": data
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

