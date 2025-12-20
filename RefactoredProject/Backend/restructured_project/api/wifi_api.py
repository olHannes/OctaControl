from flask import Blueprint, jsonify, request
import subprocess
from utils.Logger import Logger

wlan_api = Blueprint("wlan_api", __name__, url_prefix="/api/wlan")

wlanApiTag = "WlanApi"
log = Logger()



@wlan_api.route("/status", methods=["GET"])
def wlan_status():
    """
    provides the current wlan status
    """
    log.verbose(wlanApiTag, "POST /status received")
    
    try:
        wifi_power_output = subprocess.check_output(["nmcli", "radio", "wifi"]).decode().strip()
        state = "on" if wifi_power_output.lower() == "enabled" else "off"

        if state == "off":
            return jsonify({
                "state": "off",
                "status": "disconnected",
                "name": None,
                "ip": None,
                "signal": None
            }), 200

        con_info = subprocess.check_output(
            ["nmcli", "-t", "-f", "active,ssid,signal", "dev", "wifi"]
        ).decode().strip().splitlines()

        active_connection = next((line for line in con_info if line.startswith("ja:")), None)
        if not active_connection:
            return jsonify({
                "state": "on",
                "status": "disconnected",
                "name": None,
                "ip": None,
                "signal": None
            }), 200
        
        _, ssid, signal = active_connection.split(":")

        ip_output = subprocess.check_output(["hostname", "-I"]).decode().strip()
        ip_address = ip_output.split()[0] if ip_output else "unbekannt"

        return jsonify({
            "state": "on",
            "status": "connected",
            "name": ssid,
            "ip": ip_address,
            "signal": signal
        })
    except Exception as e:
        log.error(wlanApiTag, f"/status: failed to get status - {e}")
        return jsonify({"error": f"Failed to get Wlan state - {e}"}), 500



@wlan_api.route("/power", methods=["POST"])
def wlan_power():
    """
    Payload: {"state": "on"|"off"}
    WLAN Ein- oder Ausschalten via rfkill
    """
    log.verbose(wlanApiTag, "POST /power received")
    data = request.json
    if not data or "state" not in data:
        log.error(wlanApiTag, "/power: Missing parameter")
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            subprocess.run(["rfkill", "unblock", "wifi"], check=True)

        elif state == "off":
            subprocess.run(["rfkill", "block", "wifi"], check=True)
        else:
            log.error(wlanApiTag, "/power: invalid state")
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        return jsonify({"status": f"WLAN turned {state}"})
    except subprocess.CalledProcessError as e:
        log.error(wlanApiTag, f"/power: failed to toggle wlan - {e}")
        return jsonify({"error": f"Failed to set WLAN state - {e}"}), 500



@wlan_api.route("/scan", methods=["GET"])
def scan_wifi():
    """
    Scans the wifi and returns a list of reachable networks
    return value: networs = [{ssid, signal}, ...]
    """
    log.verbose(wlanApiTag, "GET /scan received")
    try:
        subprocess.run(["nmcli", "dev", "wifi", "rescan"], check=True)
        result = subprocess.check_output(
            ["nmcli", "-t", "-f", "ssid,signal", "dev", "wifi"], 
            stderr=subprocess.STDOUT
        ).decode("utf-8").strip().splitlines()

        network_map = {}
        for line in result:
            if not line:
                continue
            ssid, signal = line.split(":", 1)
            ssid = ssid if ssid else "<hidden>"
            
            if not signal.isdigit():
                continue

            signal_val = int(signal)
            if ssid in network_map:
                if signal_val > int(network_map[ssid]["signal"]):
                    network_map[ssid] = {"ssid": ssid, "signal": str(signal_val)}
            else:
                network_map[ssid] = {"ssid": ssid, "signal": str(signal_val)}
    
        networks = list(network_map.values())
        return jsonify({ "networks": networks }), 200

    except subprocess.CalledProcessError as e:
        log.error(wlanApiTag, f"/scan failed - {e.output.decode().strip()}")
        return jsonify({ "error": "Scan command failed" }), 500
    except Exception as e:
        log.error(wlanApiTag, f"/scan failed - {e}")
        return jsonify({ "error": f"Failed to scan - {e}" }), 500



@wlan_api.route("/known", methods=["GET"])
def known_wifi():
    """
    Returns a list of known WIFI networks
    """
    log.verbose(wlanApiTag, "GET /known received")
    try:
        result = subprocess.run(
            ["nmcli", "-t", "-f", "name,type", "connection", "show"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        lines = result.stdout.strip().split("\n")
        wifi_connections = []

        for line in lines:
            if not line.strip():
                continue
            name, conn_type = line.strip().split(":")

            if conn_type == "802-11-wireless":
                wifi_connections.append({
                    "ssid": name
                })
        return jsonify({ "networks": wifi_connections }), 200
    except subprocess.CalledProcessError as e:
        log.error(wlanApiTag, f"Failed to get known networks - {e.stderr}")
        return jsonify({ "error": "Could not list known networks" }), 500



@wlan_api.route("/connect", methods=["POST"])
def connect_to_wifi():
    log.verbose(wlanApiTag, "POST /connect received")
    try:
        data = request.json
        if not data or "ssid" not in data:
            log.error(wlanApiTag, "/connect: Missing 'ssid'")
            return jsonify({"error": "Missing 'ssid'"}), 400
        
        ssid = data["ssid"]
        password = data.get("password")

        subprocess.run(["nmcli", "device", "disconnect", "wlan0"], check=False)

        if password:
            cmd = ["nmcli", "dev", "wifi", "connect", ssid, "password", password]
        else:
            cmd = ["nmcli", "dev", "wifi", "connect", ssid]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify({"error": "Failed to connect - " + result.stderr}), 500

        return jsonify({"status": f"Connected to {ssid}"}), 200

    except Exception as e:
        log.error(wlanApiTag, f"Failed to connect with {data.get('ssid')} - {e}")
        return jsonify({"error": f"Failed to connect to wifi - {e}"}), 500

    

@wlan_api.route("/disconnect", methods=["POST"])
def disconnect_to_wifi():
    """
    Payload: {"ssid": "<network_name>"}
    Tries to disconnect the Raspberry Pi from the given WiFi network.
    """
    log.verbose(wlanApiTag, "POST /disconnect received")
    try:
        data = request.json
        if not data or "ssid" not in data:
            log.error(wlanApiTag, "/disconnect: Missing 'ssid'")
            return jsonify({"error": "Missing 'ssid'"}), 400
        
        ssid = data["ssid"]

        result = subprocess.run(["nmcli", "connection", "down", ssid], capture_output=True, text=True)

        if result.returncode != 0:
            log.error(wlanApiTag, f"Disconnect failed: {result.stderr.strip()}")
            return jsonify({"error": f"Failed to disconnect: {result.stderr.strip()}"}), 500
        
        return jsonify({"status": f"Disconnected from {ssid}"}), 200

    except Exception as e:
        log.error(wlanApiTag, f"Exception during disconnect from {ssid} - {e}")
        return jsonify({"error": f"Failed to disconnect from WiFi: {e}"}), 500
