from flask import Blueprint, jsonify, request
from utils.bluetooth_controller import BluetoothController
import subprocess

bluetooth_api = Blueprint("bluetooth_api", __name__, url_prefix="/api/bluetooth")

# --- Music Control ---
@bluetooth_api.route("/play", methods=["POST"])
def play():
    try:
        player = BluetoothController()
        player.play()
        return jsonify({"status": "playing"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bluetooth_api.route("/pause", methods=["POST"])
def pause():
    try:
        player = BluetoothController()
        player.pause()
        return jsonify({"status": "paused"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bluetooth_api.route("/stop", methods=["POST"])
def stop():
    try:
        player = BluetoothController()
        player.stop()
        return jsonify({"status": "stopped"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bluetooth_api.route("/next", methods=["POST"])
def next_track():
    try:
        player = BluetoothController()
        player.next()
        return jsonify({"status": "skipped to next"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bluetooth_api.route("/previous", methods=["POST"])
def previous_track():
    try:
        player = BluetoothController()
        player.previous()
        return jsonify({"status": "skipped to previous"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#--- Bluetooth setting control ---
@bluetooth_api.route("/power", methods=["POST"])
def power():
    """
    Payload: {"state": "on"|"off"}
    Schaltet Bluetooth ein oder aus via systemctl oder rfkill
    """
    data = request.json
    if not data or "state" not in data:
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            subprocess.run(["rfkill", "unblock", "bluetooth"], check=True)
            subprocess.run(["systemctl", "start", "bluetooth"], check=True)
        elif state == "off":
            subprocess.run(["systemctl", "stop", "bluetooth"], check=True)
            subprocess.run(["rfkill", "block", "bluetooth"], check=True)
        else:
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        return jsonify({"status": f"bluetooth turned {state}"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to set bluetooth state: {e}"}), 500


@bluetooth_api.route("/paired_devices", methods=["GET"])
def paired_devices():
    """
    Listet gepaarte Bluetooth-Geräte auf
    """
    try:
        output = subprocess.check_output(["bluetoothctl", "paired-devices"]).decode()
        devices = []
        for line in output.splitlines():
            parts = line.split(" ", 2)
            if len(parts) == 3:
                devices.append({"address": parts[1], "name": parts[2]})
        return jsonify({"paired_devices": devices})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bluetooth_api.route("/pair", methods=["POST"])
def pair_device():
    """
    Payload: {"address": "<device_mac_address>"}
    Versucht, mit einem Gerät zu pairen
    """
    data = request.json
    if not data or "address" not in data:
        return jsonify({"error": "Missing 'address' parameter"}), 400

    address = data["address"]

    try:
        process = subprocess.Popen(["bluetoothctl"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process.stdin.write(f"pair {address}\n".encode())
        process.stdin.write(b"quit\n")
        process.stdin.flush()
        stdout, stderr = process.communicate(timeout=10)

        if b"Pairing successful" in stdout:
            return jsonify({"status": f"Paired with {address}"})
        else:
            return jsonify({"error": f"Failed to pair with {address}", "output": stdout.decode()}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
