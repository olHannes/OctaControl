from flask import Blueprint, jsonify, request
from utils.Logger import Logger
import subprocess
import re

bt_setup_api = Blueprint("bt_setup_api", __name__, url_prefix="/api/bluetooth/setup")
blApiTag = "BtSetup"
log = Logger()

@bt_setup_api.route("/power", methods=["POST"])
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


@bt_setup_api.route("/scan", methods=["GET"])
def scan_devices():
    """
    Scans for available Bluetooth devices
    """
    log.verbose(blApiTag, "GET /scan received")
    try:
        output = subprocess.check_output(["bluetoothctl", "scan", "on"], timeout=5)
        output = subprocess.check_output(["bluetoothctl", "devices"]).decode()
        devices = []
        for line in output.strip().split("\n"):
            parts = line.strip().split(" ", 2)
            if len(parts) == 3:
                devices.append({"address": parts[1], "name": parts[2]})
        return jsonify({"devices": devices})
    except Exception as e:
        log.error(blApiTag, f"Failed to scan devices - {e}")
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/paired_devices", methods=["GET"])
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


@bt_setup_api.route("/pair", methods=["POST"])
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


@bt_setup_api.route("/connect", methods=["POST"])
def connect_device():
    """
    Payload: {"address": "<device_mac_address>"}
    Tries to connect to a paired device
    """
    log.verbose(blApiTag, "POST /connect received")
    address = request.json.get("address")
    if not address:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        subprocess.run(["bluetoothctl", "connect", address], check=True, timeout=5)
        return jsonify({"status": f"Connected to {address}"})
    except subprocess.CalledProcessError as e:
        log.error(blApiTag, f"Failed to connect - {e}")
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/disconnect", methods=["POST"])
def disconnect_device():
    """
    Payload: {"address": "<device_mac_address>"}
    """
    log.verbose(blApiTag, "POST /disconnect received")
    address = request.json.get("address")
    if not address:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        subprocess.run(["bluetoothctl", "disconnect", address], check=True, timeout=5)
        return jsonify({"status": f"Disconnected from {address}"})
    except subprocess.CalledProcessError as e:
        log.error(blApiTag, f"Failed to disconnect - {e}")
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/remove", methods=["POST"])
def remove_device():
    """
    Payload: {"address": "<device_mac_address>"}
    """
    log.verbose(blApiTag, "POST /remove received")
    address = request.json.get("address")
    if not address:
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        subprocess.run(["bluetoothctl", "remove", address], check=True, timeout=5)
        return jsonify({"status": f"Removed device {address}"})
    except subprocess.CalledProcessError as e:
        log.error(blApiTag, f"Failed to remove device - {e}")
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/status", methods=["GET"])
def bt_status():
    log.verbose(blApiTag, "GET /status received")
    try:
        output = subprocess.check_output(["bluetoothctl", "show"]).decode()
        powered = "yes" if "Powered: yes" in output else "no"
        discoverable = "yes" if "Discoverable: yes" in output else "no"

        connected_device = None
        devices_output = subprocess.check_output(["bluetoothctl", "info"]).decode()
        match = re.search(r"Name: (.+)", devices_output)
        if match:
            connected_device = match.group(1)

        return jsonify({
            "powered": powered,
            "discoverable": discoverable,
            "connected_device": connected_device
        })
    except Exception as e:
        log.error(blApiTag, f"Failed to get BT status - {e}")
        return jsonify({"error": str(e)}), 500
