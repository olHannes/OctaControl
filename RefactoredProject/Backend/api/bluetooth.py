from flask import Blueprint, jsonify, request
from utils.bluetooth_controller import BluetoothController
from utils.Logger import Logger
import subprocess
import re

bluetooth_api = Blueprint("bluetooth_api", __name__, url_prefix="/api/bluetooth")

blApiTag = "BtApi"
log = Logger()

#routes for music control
#############################################################################################
@bluetooth_api.route("/play", methods=["POST"])
def play():
    log.verbose(blApiTag, "POST /play received")
    try:
        player = BluetoothController()
        player.play()
        return jsonify({"status": "playing"})
    except Exception as e:
        log.error(blApiTag, f"Failed to play: {e}")
        return jsonify({"error": str(e)}), 500


@bluetooth_api.route("/pause", methods=["POST"])
def pause():
    log.verbose(blApiTag, "POST /pause received")
    try:
        player = BluetoothController()
        player.pause()
        return jsonify({"status": "paused"})
    except Exception as e:
        log.error(blApiTag, f"Failed to pause: {e}")
        return jsonify({"error": str(e)}), 500


@bluetooth_api.route("/stop", methods=["POST"])
def stop():
    log.verbose(blApiTag, "POST /stop received")
    try:
        player = BluetoothController()
        player.stop()
        return jsonify({"status": "stopped"})
    except Exception as e:
        log.error(blApiTag, f"Failed to stop: {e}")
        return jsonify({"error": str(e)}), 500


@bluetooth_api.route("/next", methods=["POST"])
def next_track():
    log.verbose(blApiTag, "POST /next received")
    try:
        player = BluetoothController()
        player.next()
        return jsonify({"status": "skipped to next"})
    except Exception as e:
        log.error(blApiTag, f"Failed to next: {e}")
        return jsonify({"error": str(e)}), 500


@bluetooth_api.route("/previous", methods=["POST"])
def previous_track():
    log.verbose(blApiTag, "POST /previous received")
    try:
        player = BluetoothController()
        player.previous()
        return jsonify({"status": "skipped to previous"})
    except Exception as e:
        log.error(blApiTag, f"Failed to previous: {e}")
        return jsonify({"error": str(e)}), 500


@bluetooth_api.route("/status", methods=["GET"])
def get_status():
    log.verbose(blApiTag, "GET /status received")
    try:
        player = BluetoothController()
        status = player.get_status()
        return jsonify({"status": status})
    except Exception as e:
        log.error(blApiTag, f"Failed to get playing status")
        return jsonify({"error", str(e)}), 500
    


#--- Bluetooth setting control ---
#############################################################################################
@bluetooth_api.route("/power", methods=["POST"])
def power():
    """
    Payload: {"state": "on"|"off"}
    turns bluetooth on or off via systemctl and rfkill
    """
    log.verbose(blApiTag, "POST /power received")
    data = request.json
    if not data or "state" not in data:
        log.error(blApiTag, f"Failed to toggle BT-Power: Missing Parameter")
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            subprocess.run(["rfkill", "unblock", "bluetooth"], check=True, timeout=5)
            subprocess.run(["systemctl", "start", "bluetooth"], check=True, timeout=5)
        elif state == "off":
            subprocess.run(["systemctl", "stop", "bluetooth"], check=True, timeout=5)
            subprocess.run(["rfkill", "block", "bluetooth"], check=True, timeout=5)
        else:
            log.error(blApiTag, f"Failed to toggle BT-Power: Invalid state")
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        return jsonify({"status": f"bluetooth turned {state}"})
    except subprocess.CalledProcessError as e:
        log.error(blApiTag, f"Failed to toggle BT-Power: {e}")
        return jsonify({"error": f"Failed to set bluetooth state: {e}"}), 500


@bluetooth_api.route("/paired_devices", methods=["GET"])
def paired_devices():
    """
    lists all paired Bluetooth devices
    """
    log.verbose(blApiTag, "GET /paired_devices received")
    try:
        output = subprocess.check_output(["bluetoothctl", "paired-devices"]).decode()
        devices = []
        for line in output.splitlines():
            parts = line.split(" ", 2)
            if len(parts) == 3:
                devices.append({"address": parts[1], "name": parts[2]})
        return jsonify({"paired_devices": devices})
    except Exception as e:
        log.error(blApiTag, f"failed to list all paired devices - {e}")
        return jsonify({"error": f"Failed to list all paired devices - {e}"}), 500


@bluetooth_api.route("/pair", methods=["POST"])
def pair_device():
    """
    Payload: {"address": "<device_mac_address>"}
    trying to pair with a device
    """
    log.verbose(blApiTag, "POST /pair received")
    data = request.json
    if not data or "address" not in data:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address' parameter"}), 400

    address = data["address"]
    if not re.match(r"^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$", address):
        log.error(blApiTag, "Invalid MAC address format")
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        process = subprocess.Popen(["bluetoothctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process.stdin.write(f"pair {address}\n".encode())
        process.stdin.write(b"quit\n")
        process.stdin.flush()
        stdout, stderr = process.communicate(timeout=10)

        if b"Pairing successful" in stdout:
            return jsonify({"status": f"Paired with {address}"})
        else:
            log.error(blApiTag, f"Failed to pair with '{address}'")
            return jsonify({"error": f"Failed to pair with {address}", "output": stdout.decode()}), 500

    except Exception as e:
        log.error(blApiTag, f"Failed to pair with device - {e}")
        return jsonify({"error": str(e)}), 500
