from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

import subprocess

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



app = Flask(__name__)


#audio routes
@app.route("/audio/play", methods=["POST"])
def play_audio():
    print("trying to play audio")
    output = run_playerctl_command("play")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/pause", methods=["POST"])
def pause_audio():
    print("trying to pause audio")
    output = run_playerctl_command("pause")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/skip", methods=["POST"])
def skip_audio():
    print("trying to skip audio")
    output = run_playerctl_command("next")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/previous", methods=["POST"])
def previous_audio():
    print("trying to previous audio")
    output = run_playerctl_command("previous")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    print("trying to get audio information")
    try:
        title = run_playerctl_command("metadata xesam:title")
        artist = run_playerctl_command("metadata xesam:artist")
        album = run_playerctl_command("metadata xesam:album")
        genre = run_playerctl_command("metadata xesam:genre")
        return jsonify({
            "status": "success",
            "information": {
                "title": title,
                "artist": artist,
                "album": album,
                "genre": genre
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})



# Bluetooth routes

@app.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    print("try to turn on bluetooth")
    output = run_bluetoothctl_command("power on")
    return jsonify({"status": "success", "message": output})

@app.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    print("try to turn off bluetooth")
    output = run_bluetoothctl_command("power off")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    print("try to turn on pairing mode")
    run_bluetoothctl_command("discoverable on")
    output = run_bluetoothctl_command("pairable on")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    print("try to turn off pairing mode")
    run_bluetoothctl_command("discoverable off")
    output = run_bluetoothctl_command("pairable off")
    return jsonify({"status": "success", "message": output})


#the following can be ignored for now
@app.route("/devices/connected", methods=["GET"])
def connected_devices():
    output = run_bluetoothctl_command("info")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@app.route("/devices/available", methods=["GET"])
def available_devices():
    output = run_bluetoothctl_command("paired-devices")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@app.route("/disconnect", methods=["POST"])
def disconnect_device():
    data = request.json
    if "mac" not in data:
        return jsonify({"status": "error", "message": "Please provide a MAC address."}), 400
    mac_address = data["mac"]
    output = run_bluetoothctl_command(f"disconnect {mac_address}")
    return jsonify({"status": "success", "message": output})

#volume routes

@app.route("/volume/get", methods=["GET"])
def get_volume():
    print("try to get Volume")
    output = run_amixer_command("get Master")
    for line in output.split("\n"):
        if "%" in line:
            volume = line.split("[")[1].split("%")[0]
            is_muted = "off" in line
            return jsonify({
                "status": "success",
                "volume": int(volume),
                "is_muted": is_muted
            })
    return jsonify({"status": "error", "message": "Could not retrieve volume."})


@app.route("/volume/set", methods=["POST"])
def set_volume():
    print("try to set Volume")
    data = request.json
    if "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400
    volume = data["volume"]
    if not (0 <= volume <= 100):
        return jsonify({"status": "error", "message": "Volume must be between 0 and 100."}), 400
    output = run_amixer_command(f"set Master {volume}%")
    return jsonify({"status": "success", "message": output})




@app.route("/")
def index():
    return render_template("index.html")

# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
