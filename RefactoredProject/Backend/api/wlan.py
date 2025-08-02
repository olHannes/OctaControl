from flask import Blueprint, jsonify, request
import subprocess

wlan_api = Blueprint("wlan_api", __name__, url_prefix="/api/wlan")

@wlan_api.route("/power", methods=["POST"])
def wlan_power():
    """
    Payload: {"state": "on"|"off"}
    WLAN Ein- oder Ausschalten via nmcli
    """
    data = request.json
    if not data or "state" not in data:
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            subprocess.run(["rfkill", "unblock", "wifi"], check=True)

        elif state == "off":
            subprocess.run(["rfkill", "block", "wifi"], check=True)
        else:
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        return jsonify({"status": f"WLAN turned {state}"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to set WLAN state: {e}"}), 500

@wlan_api.route("/status", methods=["GET"])
def wlan_status():
    """
    Liefert den aktuellen WLAN Status
    """
    try:
        output = subprocess.check_output(["nmcli", "radio", "wifi"]).decode().strip()
        return jsonify({"wifi_status": output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
