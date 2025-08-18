from flask import Blueprint, jsonify, request
import subprocess
from datetime import datetime
import os

from utils.Logger import Logger

system_api = Blueprint("system_api", __name__, url_prefix="/api/system")

log = Logger()
systemApiTag = "SystemApi"
repo_path = os.path.join(os.path.expanduser("~"), "Documents", "OctaControl", "RefactoredProject")


@system_api.route("/reboot", methods=["POST"])
def reboot():
    log.verbose(systemApiTag, "POST /reboot received")
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return jsonify({"status": "Rebooting system"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, f"/reboot failed to reboot - {e}")
        return jsonify({"error": f"Failed to reboot - {e}"}), 500


@system_api.route("/shutdown", methods=["POST"])
def shutdown():
    log.verbose(systemApiTag, "POST /shutdown received")
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return jsonify({"status": "Shutting down system"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, f"Failed to shutdown - {e}")
        return jsonify({"error": f"Failed to shutdown: {e}"}), 500


@system_api.route("/update", methods=["POST"])
def update():
    log.verbose(systemApiTag, "POST /update received")
    script_absolute_path = os.path.join(repo_path, "setup", "full_setup.sh")
    try:
        subprocess.run(["sudo", "bash", script_absolute_path], check=True)
        return jsonify({"status": "System updated"})
    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, f"Failed to update the system - {e}")
        return jsonify({"error": f"Failed to update system - {e}"}), 500
    except FileNotFoundError:
        log.error(systemApiTag, f"Failed to update the system - File not found")
        return jsonify({"error": f"Failed to update the system - File not found"}), 500


@system_api.route("/version", methods=["GET"])
def getVersion():
    log.verbose(systemApiTag, "GET /version received")
    try:
        if not os.path.isdir(repo_path):
            return jsonify({"error": "Repo path does not exist"}), 500
        result = subprocess.run(
            ["git", "-C", repo_path, "log", "-1", "--format=%cd", "--date=iso"],
            capture_output=True,
            text=True,
            check=True
        )
        date_str = result.stdout.strip()
        date = datetime.fromisoformat(date_str).date()
        return jsonify({"version": date.isoformat()}), 200

    except subprocess.CalledProcessError as e:
        log.error(systemApiTag, f"Failed to read version - {e}")
        return jsonify({"error": f"Failed to read version - {e}"}), 500
