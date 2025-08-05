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
        log.error(wlanApiTag, "/power: failed to toggle wlan - {e}")
        return jsonify({"error": f"Failed to set WLAN state - {e}"}), 500

@wlan_api.route("/status", methods=["GET"])
def wlan_status():
    """
    provides the current wlan status
    """
    log.verbose(wlanApiTag, "POST /status received")
    try:
        output = subprocess.check_output(["nmcli", "radio", "wifi"]).decode().strip()
        return jsonify({"wifi_status": output})
    except Exception as e:
        log.error(wlanApiTag, "/status: failed to get status - {e}")
        return jsonify({"error": f"Failed to get Wlan state - {e}"}), 500
