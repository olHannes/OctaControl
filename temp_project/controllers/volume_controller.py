from flask import Blueprint, jsonify, request
from ..helpers import run_amixer_command

volume_routes = Blueprint('volume', __name__)

@volume_routes.route("/volume/get", methods=["GET"])
def get_volume():
    output = run_amixer_command("get Master")
    for line in output.split("\n"):
        if "%" in line:
            volume = line.split("[")[1].split("%")[0]
            is_muted = "off" in line
            return jsonify({
                "status": "success",
                "volume": int(volume),
                "is_muted": is_muted
            })
    return jsonify({"status": "error", "message": "Could not retrieve volume."})

@volume_routes.route("/volume/set", methods=["POST"])
def set_volume():
    data = request.json
    if "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400
    volume = data["volume"]
    if not (0 <= volume <= 100):
        return jsonify({"status": "error", "message": "Volume must be between 0 and 100."}), 400
    output = run_amixer_command(f"set Master {volume}%")
    return jsonify({"status": "success", "message": output})
