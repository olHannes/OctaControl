from flask import Blueprint, jsonify, request
import os
import subprocess
from pathlib import Path
from datetime import datetime
from services.audio_service import AudioService

system_api = Blueprint("system_api", __name__)

DEFAULT_REPO = Path.home() / "Documents" / "OctaControl"
DEFAULT_REPO = Path.home() / "Documents" / "Software Projects" / "OctaControl"
repo_path = Path(os.getenv("OCTA_REPO_PATH", DEFAULT_REPO)).expanduser().resolve()


def run_git(args):
    return subprocess.run(
        ["git", "-C", str(repo_path), *args],
        capture_output=True, text=True, check=True
    ).stdout.strip()



@system_api.route("/reboot", methods=["POST"])
def reboot():
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return jsonify({"status": "Rebooting system"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to reboot - {e}"}), 500



@system_api.route("/shutdown", methods=["POST"])
def shutdown():
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return jsonify({"status": "Shutting down system"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to shutdown: {e}"}), 500



# @system_api.route("/update", methods=["POST"])
#def update():
#    log.verbose(systemApiTag, "POST /update received")
#    script_absolute_path = os.path.join(repo_path, "setup", "full_setup.sh")
#    try:
#        subprocess.run(["sudo", "bash", script_absolute_path], check=True)
#        return jsonify({"status": "System updated"})
#    except subprocess.CalledProcessError as e:
#        log.error(systemApiTag, f"Failed to update the system - {e}")
#        return jsonify({"error": f"Failed to update system - {e}"}), 500
#   except FileNotFoundError:
#        log.error(systemApiTag, f"Failed to update the system - File not found")
#        return jsonify({"error": f"Failed to update the system - File not found"}), 500



@system_api.route("/version", methods=["GET"])
def get_version():
    try:
        if not repo_path.is_dir():
            return jsonify({"error": f"Repo path does not exist: {repo_path}"}), 500
        commit = run_git(["rev-parse", "--short", "HEAD"])
        date_str = run_git(["log", "-1", "--format=%cd", "--date=iso"])
        branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"])
        dirty = subprocess.run(
            ["git", "-C", str(repo_path), "diff", "--quiet"],
        ).returncode != 0

        dt = datetime.fromisoformat(date_str)

        return jsonify({
            "commit": commit,
            "date": dt.isoformat(),
            "branch": branch,
            "dirty": dirty
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Failed to read git version",
            "stderr": e.stderr
        }), 500



@system_api.route("/volume", methods=["PATCH"])
def update_volume():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or "volume" not in data:
        return jsonify({"error": "Missing 'volume' parameter"}), 400
    raw = data["volume"]
    try:
        volume_int = int(raw)
    except (TypeError, ValueError):
        return jsonify({"error": "'volume' must be an integer"}), 400

    volume = max(0, min(100, volume_int))
    try:
        ok = AudioService.get().set_volume(volume)
    except Exception:
        return jsonify({"ok": False, "error": "AudioService failed"}), 503
    if ok:
        return jsonify({"ok": True, "volume": volume}), 200

    return jsonify({"ok": False}), 500