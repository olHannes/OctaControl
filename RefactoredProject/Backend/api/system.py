from flask import Blueprint, jsonify, request
import subprocess
from utils.Logger import Logger

system_api = Blueprint("system_api", __name__, url_prefix="/api/system")

log = Logger()
systemApiTag = "SystemApi"

@system_api.route("/reboot", methods=["POST"])
def reboot():
    log.verbose(systemApiTag, "POST /reboot received")
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return jsonify({"status": "Rebooting system"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, "/reboot failed to reboot - {e}")
        return jsonify({"error": f"Failed to reboot - {e}"}), 500

@system_api.route("/shutdown", methods=["POST"])
def shutdown():
    log.verbose(systemApiTag, "POST /shutdown received")
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return jsonify({"status": "Shutting down system"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, "Failed to shutdown - {e}")
        return jsonify({"error": f"Failed to shutdown: {e}"}), 500

@system_api.route("/update", methods=["POST"])
def update():
    log.verbose(systemApiTag, "POST /update received")
    script_absolute_path = "/home/hannes/Documents/OctaControl/updateOctaControl.sh"

    try:
        subprocess.run(["bash", script_absolute_path], check=True)
        return jsonify({"status": "System updated"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, "Failed to update the system - {e}")
        return jsonify({"error": f"Failed to update system - {e}"}), 500
    except FileNotFoundError:
        log.error(systemApiTag, "Failed to update the system - File not found")
        return jsonify({"error": f"Failed to update the system - File not found"}), 500
