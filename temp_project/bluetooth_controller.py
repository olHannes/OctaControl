from flask import Blueprint, jsonify, request
from helpers import run_bluetoothctl_command

bluetooth_routes = Blueprint('bluetooth', __name__)

@bluetooth_routes.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    output = run_bluetoothctl_command("power on")
    return jsonify({"status": "success", "message": output})

@bluetooth_routes.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    output = run_bluetoothctl_command("power off")
    return jsonify({"status": "success", "message": output})

@bluetooth_routes.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    run_bluetoothctl_command("discoverable on")
    output = run_bluetoothctl_command("pairable on")
    return jsonify({"status": "success", "message": output})

@bluetooth_routes.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    run_bluetoothctl_command("discoverable off")
    output = run_bluetoothctl_command("pairable off")
    return jsonify({"status": "success", "message": output})


#the following can be ignored for now
@bluetooth_routes.route("/devices/connected", methods=["GET"])
def connected_devices():
    output = run_bluetoothctl_command("info")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@bluetooth_routes.route("/devices/available", methods=["GET"])
def available_devices():
    output = run_bluetoothctl_command("paired-devices")
    devices = []
    for line in output.split("\n"):
        if "Device" in line:
            device_info = line.split()
            devices.append({"mac": device_info[1], "name": " ".join(device_info[2:])})
    return jsonify({"status": "success", "devices": devices})

@bluetooth_routes.route("/disconnect", methods=["POST"])
def disconnect_device():
    data = request.json
    if "mac" not in data:
        return jsonify({"status": "error", "message": "Please provide a MAC address."}), 400
    mac_address = data["mac"]
    output = run_bluetoothctl_command(f"disconnect {mac_address}")
    return jsonify({"status": "success", "message": output})
