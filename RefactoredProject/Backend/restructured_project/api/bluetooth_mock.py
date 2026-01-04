from flask import Blueprint, jsonify, request
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import random
import re
import time

# Blueprint exakt wie in bluetooth_api.py
bt_setup_api = Blueprint("bt_setup_api_mock", __name__)


@dataclass
class MockBluetoothState:
    powered: bool = True
    discoverable: bool = False
    pairable: bool = False
    discoverable_timeout: int = 0  # 0 = infinite in your real code

    # Hardcoded example devices found by scan
    scan_devices: List[Dict[str, str]] = field(default_factory=lambda: [
        {"address": "AA:BB:CC:DD:EE:01", "name": "JBL Flip 6"},
        {"address": "AA:BB:CC:DD:EE:02", "name": "Sony WH-1000XM4"},
        {"address": "AA:BB:CC:DD:EE:03", "name": "Pixel 8"},
        {"address": "AA:BB:CC:DD:EE:04", "name": "BT-Keyboard"},
    ])

    # Paired devices (subset or independent)
    paired_devices: List[Dict[str, str]] = field(default_factory=lambda: [
        {"address": "AA:BB:CC:DD:EE:01", "name": "JBL Flip 6"},
        {"address": "AA:BB:CC:DD:EE:99", "name": "Raspi-Remote"},
    ])

    connected_device: Optional[Dict[str, str]] = None

    # Simulation knobs (like wlan_mock.py)
    simulate_timeouts: bool = False
    timeout_probability: float = 0.0
    simulated_delay_s: float = 0.0


STATE = MockBluetoothState()
STATE.connected_device = {
        "address": "AA:BB:CC:DD:EE:01",
        "name": "JBL Flip 6"
    }


def maybe_delay_or_timeout(endpoint_name: str):
    """Simuliert Verzögerungen/Timeouts wie in wlan_mock.py."""
    if STATE.simulated_delay_s > 0:
        time.sleep(STATE.simulated_delay_s)

    if STATE.simulate_timeouts:
        raise TimeoutError(f"Simulated timeout in {endpoint_name}")

    if STATE.timeout_probability > 0.0 and random.random() < STATE.timeout_probability:
        raise TimeoutError(f"Random simulated timeout in {endpoint_name}")


def is_valid_mac(address: str) -> bool:
    return bool(re.match(r"^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$", address or ""))


def find_name_for_address(address: str) -> str:
    for d in STATE.scan_devices:
        if d["address"].lower() == address.lower():
            return d["name"]
    for d in STATE.paired_devices:
        if d["address"].lower() == address.lower():
            return d["name"]
    return "Unknown"


@bt_setup_api.route("/power", methods=["POST"])
def power():
    """
    Payload: {"state": "on"|"off"}
    Returns: {"status": "...", "powered": "yes"|"no"}
    """
    data = request.json
    if not data or "state" not in data:
        return jsonify({"error": "Missing 'state' parameter"}), 400

    desired = str(data["state"]).lower().strip()
    if desired not in ("on", "off"):
        return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

    try:
        maybe_delay_or_timeout("/power")

        STATE.powered = (desired == "on")
        if not STATE.powered:
            # mimic typical behavior: if powered off, no discoverable/pairable/connection
            STATE.discoverable = False
            STATE.pairable = False
            STATE.connected_device = None

        return jsonify({
            "status": f"bluetooth turned {desired}",
            "powered": "yes" if STATE.powered else "no"
        }), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {e}"}), 500

@bt_setup_api.route("/visibility", methods=["POST"])
def set_visibility():
    """
    Payload: {"discoverable": "on"|"off"}
    Returns: {"status":"visibility updated","discoverable":"on/off","pairable":"on/off","output":"..."}
    """
    data = request.json or {}
    discoverable = str(data.get("discoverable", "off")).lower().strip()
    if discoverable not in ("on", "off", "yes", "no", "true", "false", "1", "0"):
        return jsonify({"error": "Invalid value for discoverable; use 'on' or 'off'"}), 400

    desired_on = discoverable in ("on", "yes", "true", "1")

    try:
        maybe_delay_or_timeout("/visibility")

        if not STATE.powered and desired_on:
            return jsonify({"error": "Bluetooth is off"}), 409

        STATE.discoverable = desired_on
        STATE.pairable = desired_on
        STATE.discoverable_timeout = 0

        # mimic bluetoothctl output field used by your real endpoint
        output = "Mock: discoverable-timeout 0\nMock: discoverable {}\nMock: pairable {}\n".format(
            "on" if desired_on else "off",
            "on" if desired_on else "off",
        )

        return jsonify({
            "status": "visibility updated",
            "discoverable": "on" if desired_on else "off",
            "pairable": "on" if desired_on else "off",
            "output": output
        }), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to change visibility - {e}"}), 500


@bt_setup_api.route("/status", methods=["GET"])
def bt_status():
    """
    Returns like real code:
    {
      "powered":"yes/no",
      "discoverable":"yes/no",
      "pairable":"yes/no",
      "discoverable_timeout": <int or None>,
      "paired_devices_count": <int>,
      "connected_device": {"address":..., "name":...} | None
    }
    """
    try:
        maybe_delay_or_timeout("/status")

        connected_name = STATE.connected_device["name"] if STATE.connected_device else None
        connected_mac = STATE.connected_device["address"] if STATE.connected_device else None

        return jsonify({
            "powered": "yes" if STATE.powered else "no",
            "discoverable": "yes" if STATE.discoverable else "no",
            "connectedDeviceName": connected_name,
            "connectedDeviceMac": connected_mac,
        }), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/scan", methods=["GET"])
def scan_devices():
    """
    Query: ?duration=3
    Returns: {"devices": [...], "scan_duration": duration}
    """
    try:
        maybe_delay_or_timeout("/scan")

        if not STATE.powered:
            # real code doesn't explicitly error, but scanning without power makes little sense
            return jsonify({"devices": [], "scan_duration": 0}), 200

        try:
            duration = int(request.args.get("duration", 3))
            duration = max(1, min(duration, 15))
        except Exception:
            duration = 3

        # optionally: small artificial wait to mimic scan time
        time.sleep(min(duration, 2))

        # jitter: random subset + maybe reorder
        devices = STATE.scan_devices[:]
        random.shuffle(devices)
        # simulate that not all devices are always discovered
        keep_n = random.randint(max(1, len(devices) // 2), len(devices))
        devices = devices[:keep_n]

        return jsonify({"scannedDevices": devices, "scan_duration": duration}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to scan devices - {e}"}), 500


@bt_setup_api.route("/paired_devices", methods=["GET"])
def paired_devices():
    """Returns: {"paired_devices":[...]}"""
    try:
        maybe_delay_or_timeout("/paired_devices")
        return jsonify({"pairedDevices": STATE.paired_devices}), 200
    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to list all paired devices - {e}"}), 500


@bt_setup_api.route("/pair", methods=["POST"])
def pair_device():
    """
    Payload: {"address":"<MAC>"}
    Returns: 200 on success, 500 otherwise (like real code).
    """
    data = request.json or {}
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing 'address' parameter"}), 400
    if not is_valid_mac(address):
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        maybe_delay_or_timeout("/pair")

        if not STATE.powered:
            return jsonify({"error": "Pair command failed", "detail": "Bluetooth is off"}), 500

        # already paired?
        if any(d["address"].lower() == address.lower() for d in STATE.paired_devices):
            return jsonify({"status": f"Paired with {address}", "output": "Mock: already paired"}), 200

        name = find_name_for_address(address)
        STATE.paired_devices.append({"address": address, "name": name})

        output = f"Mock: Pairing successful\nMock: Device {address} trusted\n"
        return jsonify({"status": f"Paired with {address}", "output": output}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/connect", methods=["POST"])
def connect_device():
    """
    Payload: {"address":"<MAC>"}
    """
    data = request.json or {}
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing 'address'"}), 400
    if not is_valid_mac(address):
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        maybe_delay_or_timeout("/connect")

        if not STATE.powered:
            return jsonify({"error": "Connect command failed", "detail": "Bluetooth is off"}), 500

        if not any(d["address"].lower() == address.lower() for d in STATE.paired_devices):
            return jsonify({"error": f"Failed to connect to {address}", "output": "", "err": "Not paired"}), 500

        STATE.connected_device = {"address": address, "name": find_name_for_address(address)}
        output = "Mock: Connection successful\nConnected: yes\n"
        return jsonify({"status": f"Connected to {address}", "output": output}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/disconnect", methods=["POST"])
def disconnect_device():
    """
    Payload: {"address":"<MAC>"}
    """
    data = request.json or {}
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing 'address'"}), 400
    if not is_valid_mac(address):
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        maybe_delay_or_timeout("/disconnect")

        if STATE.connected_device and STATE.connected_device["address"].lower() == address.lower():
            STATE.connected_device = None

        output = "Mock: Disconnected\n"
        return jsonify({"status": f"Disconnected from {address}", "output": output}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bt_setup_api.route("/remove", methods=["POST"])
def remove_device():
    """
    Payload: {"address":"<MAC>"}
    """
    data = request.json or {}
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing 'address'"}), 400
    if not is_valid_mac(address):
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        maybe_delay_or_timeout("/remove")

        # remove from paired list
        STATE.paired_devices = [d for d in STATE.paired_devices if d["address"].lower() != address.lower()]

        # if connected, disconnect
        if STATE.connected_device and STATE.connected_device["address"].lower() == address.lower():
            STATE.connected_device = None

        output = "Mock: Removed\n"
        return jsonify({"status": f"Removed device {address}", "output": output}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500
