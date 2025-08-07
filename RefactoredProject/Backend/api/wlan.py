from flask import Blueprint, jsonify, request
import subprocess
from utils.Logger import Logger

wlan_api = Blueprint("wlan_api", __name__, url_prefix="/api/wlan")

wlanApiTag = "WlanApi"
log = Logger()

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

        active_connection = next((line for line in con_info if line.startswith("yes:")), None)
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


@wlan_api.route("/scan", methods=["GET"])
def scan_wifi():
    log.verbose(wlanApiTag, "GET /scan received")
    try:
        subprocess.run(["nmcli", "dev", "wifi", "rescan"], check=True)
        result = subprocess.check_output(
            ["nmcli", "-t", "-f", "ssid,signal", "dev", "wifi"], 
            stderr=subprocess.STDOUT
        ).decode("utf-8").strip().splitlines()

        networks = []
        for line in result:
            if not line:
                continue
        ssid, signal = line.split(":", 1)
        networks.append({
            "ssid": ssid if ssid else "<hidden>",
            "signal": signal
        })
        return jsonify({ "networks": networks }), 200

    except subprocess.CalledProcessError as e:
        log.error(wlanApiTag, f"/scan failed - {e.output.decode().strip()}")
        return jsonify({ "error": "Scan command failed" }), 500
    except Exception as e:
        log.error(wlanApiTag, f"/scan failed - {e}")
        return jsonify({ "error": f"Failed to scan - {e}" }), 500