from flask import Blueprint, jsonify, request
from utils.Logger import Logger
import subprocess
import re
import time

bt_setup_api = Blueprint("bt_setup_api", __name__, url_prefix="/api/bluetooth/setup")

blApiTag = "BtSetup"
log = Logger()



# Helper function to run bluetoothctl commands
def run_bt(commands, timeout=8):
    """
    commands: list of command strings (without trailing newline)
    returns: (returncode, stdout, stderr)
    """
    try:
        process = subprocess.Popen(
            ["bluetoothctl"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # commands -> join with newline; ensure final 'quit'
        cmd_input = "\n".join(commands + ["quit"]) + "\n"
        stdout, stderr = process.communicate(cmd_input, timeout=timeout)
        return process.returncode, stdout or "", stderr or ""
    except subprocess.TimeoutExpired:
        process.kill()
        try:
            stdout, stderr = process.communicate(timeout=2)
        except Exception:
            stdout, stderr = "", ""
        return -1, stdout or "", stderr or ""
    except FileNotFoundError as e:
        # bluetoothctl not installed
        return -127, "", str(e)
    except Exception as e:
        return -128, "", str(e)



@bt_setup_api.route("/power", methods=["POST"])
def power():
    """
    Payload: {"state": "on"|"off"}
    Turns bluetooth on or off via systemctl and rfkill
    """
    log.verbose(blApiTag, "POST /power received")
    data = request.json
    if not data or "state" not in data:
        log.error(blApiTag, f"Failed to toggle BT-Power: Missing Parameter")
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            subprocess.run(["rfkill", "unblock", "bluetooth"], check=True, timeout=8)
            subprocess.run(["systemctl", "start", "bluetooth"], check=True, timeout=8)
        elif state == "off":
            subprocess.run(["systemctl", "stop", "bluetooth"], check=True, timeout=8)
            subprocess.run(["rfkill", "block", "bluetooth"], check=True, timeout=8)
        else:
            log.error(blApiTag, f"Failed to toggle BT-Power: Invalid state")
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        rc, out, err = run_bt(["show"])
        powered = None
        if rc >= 0 and out:
            powered = "yes" if "Powered: yes" in out else "no"

        return jsonify({"status": f"bluetooth turned {state}", "powered": powered}), 200
    except subprocess.CalledProcessError as e:
        log.error(blApiTag, f"Failed to toggle BT-Power: {e}")
        return jsonify({"error": f"Failed to set bluetooth state: {e}"}), 500
    except Exception as e:
        log.error(blApiTag, f"Unexpected error in power toggle - {e}")
        return jsonify({"error": f"Unexpected error: {e}"}), 500



@bt_setup_api.route("/scan", methods=["GET"])
def scan_devices():
    """
    Scans for available Bluetooth devices.
    Returns list of devices found during a short scan window.
    Query param: ?duration=3  (seconds) optional, default 3
    """
    log.verbose(blApiTag, "GET /scan received")
    try:
        try:
            duration = int(request.args.get("duration", 3))
            duration = max(1, min(duration, 15))  # clamp 1..15s
        except Exception:
            duration = 3

        # Turn scan on, wait, then list devices
        rc_on, out_on, err_on = run_bt(["scan on"], timeout=5)
        # small wait to allow scan to discover devices
        time.sleep(duration)
        rc_dev, out_dev, err_dev = run_bt(["devices"], timeout=5)

        devices = []
        output = out_dev or ""
        for line in output.strip().splitlines():
            parts = line.strip().split(" ", 2)
            # valid device lines typically start with "Device <MAC> <NAME>"
            if len(parts) >= 3 and parts[0] == "Device":
                address = parts[1]
                name = parts[2]
                devices.append({"address": address, "name": name})

        # optionally stop scanning to reduce noise
        run_bt(["scan off"], timeout=3)

        return jsonify({"devices": devices, "scan_duration": duration}), 200
    except Exception as e:
        log.error(blApiTag, f"Failed to scan devices - {e}")
        return jsonify({"error": f"Failed to scan devices - {e}"}), 500



@bt_setup_api.route("/visibility", methods=["POST"])
def set_visibility():
    """
    Payload: {"discoverable": "on"|"off"}
    """
    log.verbose(blApiTag, "POST /visibility received")
    data = request.json or {}
    discoverable = str(data.get("discoverable", "off")).lower()
    if discoverable not in ("on", "off", "yes", "no", "true", "false", "1", "0"):
        return jsonify({"error": "Invalid value for discoverable; use 'on' or 'off'"}), 400

    # normalize to 'on' or 'off'
    discoverable = "on" if discoverable in ("on", "yes", "true", "1") else "off"

    try:
        cmds = [
            "discoverable-timeout 0",
            f"discoverable {discoverable}",
            f"pairable {discoverable}"
        ]
        rc, out, err = run_bt(cmds, timeout=6)
        if rc < 0:
            log.error(blApiTag, f"set_visibility failed rc={rc} err={err}")
            return jsonify({"error": "Failed to change visibility", "detail": err}), 500

        return jsonify({
            "status": "visibility updated",
            "discoverable": discoverable,
            "pairable": discoverable,
            "output": out
        }), 200
    except Exception as e:
        log.error(blApiTag, f"Failed to change visibility - {e}")
        return jsonify({"error": f"Failed to change visibility - {e}"}), 500



@bt_setup_api.route("/paired_devices", methods=["GET"])
def paired_devices():
    """
    Lists all paired Bluetooth devices
    """
    log.verbose(blApiTag, "GET /paired_devices received")
    try:
        rc, out, err = run_bt(["paired-devices"], timeout=5)
        if rc < 0:
            log.error(blApiTag, f"paired_devices command failed rc={rc} err={err}")
            # Instead of 500, return empty list so frontend can continue gracefully
            return jsonify({"paired_devices": []}), 200

        devices = []
        for line in (out or "").strip().splitlines():
            parts = line.strip().split(" ", 2)
            if len(parts) >= 3 and parts[0] == "Device":
                devices.append({"address": parts[1], "name": parts[2]})
        return jsonify({"paired_devices": devices}), 200

    except Exception as e:
        log.error(blApiTag, f"Failed to list all paired devices - {e}")
        return jsonify({"error": f"Failed to list all paired devices - {e}"}), 500



@bt_setup_api.route("/pair", methods=["POST"])
def pair_device():
    """
    Payload: {"address": "<device_mac_address>"}
    tries to pair with a device
    """
    log.verbose(blApiTag, "POST /pair received")
    data = request.json or {}
    address = data.get("address")
    if not address:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address' parameter"}), 400

    if not re.match(r"^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$", address):
        log.error(blApiTag, "Invalid MAC address format")
        return jsonify({"error": "Invalid MAC address format"}), 400

    try:
        # Pair and trust the device
        rc, out, err = run_bt([f"pair {address}", f"trust {address}"], timeout=15)
        out_lower = (out or "").lower()
        if rc < 0:
            log.error(blApiTag, f"pair command failed rc={rc} err={err}")
            return jsonify({"error": "Pair command failed", "detail": err}), 500

        # heuristics for success
        if "pairing successful" in out_lower or "paired: yes" in out_lower or "successful" in out_lower:
            return jsonify({"status": f"Paired with {address}", "output": out}), 200
        else:
            log.error(blApiTag, f"Failed to pair with '{address}', output: {out}")
            return jsonify({"error": f"Failed to pair with {address}", "output": out}), 500
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
    data = request.json or {}
    address = data.get("address")
    if not address:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        rc, out, err = run_bt([f"connect {address}"], timeout=10)
        if rc < 0:
            return jsonify({"error": "Connect command failed", "detail": err}), 500

        out_lower = (out or "").lower()
        if "connected: yes" in out_lower or "connection successful" in out_lower or "connection successful" in err.lower():
            return jsonify({"status": f"Connected to {address}", "output": out}), 200
        # sometimes bluetoothctl responds with "Connection successful" text
        if "successful" in out_lower:
            return jsonify({"status": f"Connected to {address}", "output": out}), 200

        log.error(blApiTag, f"Failed to connect to {address}. output: {out} err: {err}")
        return jsonify({"error": f"Failed to connect to {address}", "output": out, "err": err}), 500
    except Exception as e:
        log.error(blApiTag, f"Failed to connect - {e}")
        return jsonify({"error": str(e)}), 500



@bt_setup_api.route("/disconnect", methods=["POST"])
def disconnect_device():
    """
    Payload: {"address": "<device_mac_address>"}
    """
    log.verbose(blApiTag, "POST /disconnect received")
    data = request.json or {}
    address = data.get("address")
    if not address:
        log.error(blApiTag, "Missing address data")
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        rc, out, err = run_bt([f"disconnect {address}"], timeout=8)
        if rc < 0:
            return jsonify({"error": "Disconnect command failed", "detail": err}), 500
        return jsonify({"status": f"Disconnected from {address}", "output": out}), 200
    except Exception as e:
        log.error(blApiTag, f"Failed to disconnect - {e}")
        return jsonify({"error": str(e)}), 500



@bt_setup_api.route("/remove", methods=["POST"])
def remove_device():
    """
    Payload: {"address": "<device_mac_address>"}
    """
    log.verbose(blApiTag, "POST /remove received")
    data = request.json or {}
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing 'address'"}), 400

    try:
        rc, out, err = run_bt([f"remove {address}"], timeout=8)
        if rc < 0:
            return jsonify({"error": "Remove command failed", "detail": err}), 500
        return jsonify({"status": f"Removed device {address}", "output": out}), 200
    except Exception as e:
        log.error(blApiTag, f"Failed to remove device - {e}")
        return jsonify({"error": str(e)}), 500



@bt_setup_api.route("/status", methods=["GET"])
def bt_status():
    log.verbose(blApiTag, "GET /status received")
    try:
        rc_show, out_show, err_show = run_bt(["show"], timeout=5)
        if rc_show < 0:
            log.error(blApiTag, f"show command failed rc={rc_show} err={err_show}")
            return jsonify({"error": "Failed to query bluetooth state", "detail": err_show}), 500

        out = out_show or ""
        powered = True if "Powered: yes" in out else False
        discoverable = True if "Discoverable: yes" in out else False
        pairable = True if "Pairable: yes" in out else False

        timeout_match = re.search(r"DiscoverableTimeout:\s*(0x[0-9A-Fa-f]+|\d+)", out)
        discoverable_timeout = None
        if timeout_match:
            tval = timeout_match.group(1)
            try:
                if tval.startswith("0x") or tval.startswith("0X"):
                    discoverable_timeout = int(tval, 16)
                else:
                    discoverable_timeout = int(tval)
            except Exception:
                discoverable_timeout = None

        # get paired devices list (best-effort)
        rc_paired, out_paired, err_paired = run_bt(["paired-devices"], timeout=5)
        paired_devices_list = []
        if rc_paired >= 0 and out_paired:
            for line in out_paired.strip().splitlines():
                parts = line.strip().split(" ", 2)
                if len(parts) >= 3 and parts[0] == "Device":
                    paired_devices_list.append({"address": parts[1], "name": parts[2]})

        # find any currently connected paired device (info on each)
        connected_device = None
        for d in paired_devices_list:
            addr = d["address"]
            rc_info, out_info, err_info = run_bt([f"info {addr}"], timeout=4)
            if rc_info >= 0 and out_info and "Connected: yes" in out_info:
                name_match = re.search(r"Name:\s*(.+)", out_info)
                connected_device = {"address": addr, "name": name_match.group(1) if name_match else d.get("name", "Unknown")}
                break

        return jsonify({
            "powered": "yes" if powered else "no",
            "discoverable": "yes" if discoverable else "no",
            "pairable": "yes" if pairable else "no",
            "discoverable_timeout": discoverable_timeout,
            "paired_devices_count": len(paired_devices_list),
            "connected_device": connected_device
        }), 200

    except Exception as e:
        log.error(blApiTag, f"Failed to get BT status - {e}")
        return jsonify({"error": str(e)}), 500
