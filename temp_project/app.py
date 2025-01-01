import subprocess
from flask import Flask, jsonify, request

app = Flask(__name__)

def run_bluetoothctl_command(command):
    """Helper function to run bluetoothctl commands and capture output."""
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
    """Helper function to run playerctl commands for audio control."""
    try:
        result = subprocess.run(
            ["playerctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

# functions for bluetooth-settings
@app.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    """Turn on Bluetooth."""
    output = run_bluetoothctl_command("power on")
    return jsonify({"status": "success", "message": output})

@app.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    """Turn off Bluetooth."""
    output = run_bluetoothctl_command("power off")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    """Enable Bluetooth pairing mode (discoverable)."""
    run_bluetoothctl_command("discoverable on")
    output = run_bluetoothctl_command("pairable on")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    """Disable Bluetooth pairing mode."""
    run_bluetoothctl_command("discoverable off")
    output = run_bluetoothctl_command("pairable off")
    return jsonify({"status": "success", "message": output})

@app.route("/devices/connected", methods=["GET"])
def connected_devices():
    """List connected Bluetooth devices."""
    output = run_bluetoothctl_command("info")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@app.route("/devices/available", methods=["GET"])
def available_devices():
    """List available (paired but not connected) devices."""
    output = run_bluetoothctl_command("paired-devices")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@app.route("/disconnect", methods=["POST"])
def disconnect_device():
    """Disconnect a connected Bluetooth device."""
    data = request.json
    if "mac" not in data:
        return jsonify({"status": "error", "message": "Please provide a MAC address."}), 400
    mac_address = data["mac"]
    output = run_bluetoothctl_command(f"disconnect {mac_address}")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/play", methods=["POST"])
def play_audio():
    """Play audio on the current media player."""
    output = run_playerctl_command("play")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/pause", methods=["POST"])
def pause_audio():
    """Pause audio on the current media player."""
    output = run_playerctl_command("pause")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/skip", methods=["POST"])
def skip_audio():
    """Skip to the next track on the current media player."""
    output = run_playerctl_command("next")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/previous", methods=["POST"])
def previous_audio():
    """Go to the previous track on the current media player."""
    output = run_playerctl_command("previous")
    return jsonify({"status": "success", "message": output})

@app.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    """Retrieve song information such as artist, title, and album."""
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


def run_amixer_command(command):
    """Helper function to run amixer commands."""
    try:
        result = subprocess.run(
            ["amixer"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

@app.route("/volume/get", methods=["GET"])
def get_volume():
    """Get the current system volume."""
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
    """Set the system volume."""
    data = request.json
    if "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400
    volume = data["volume"]
    if not (0 <= volume <= 100):
        return jsonify({"status": "error", "message": "Volume must be between 0 and 100."}), 400
    output = run_amixer_command(f"set Master {volume}%")
    return jsonify({"status": "success", "message": output})



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
