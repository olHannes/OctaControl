from flask import Blueprint, jsonify
from utils.media_player import *
from utils.Logger import Logger

bt_meta_api = Blueprint("bt_meta_api", __name__, url_prefix="/api/bluetooth/metadata")
blApiTag = "BtMeta"
log = Logger()

@bt_meta_api.route("/all", methods=["GET"])
def all_data():
    log.verbose(blApiTag, "GET /all received")
    try:
        meta = get_metadata()
        progress = get_progress()
        isPlaying = is_playing()
        device = get_player_device_name()

        response = {
            "device": device,
            "is_playing": isPlaying,
            "progress": progress,
        }
        response.update(meta)
        return jsonify(response), 200

    except Exception as e:
        log.error(blApiTag, f"Failed to get all data: {e}")
        return jsonify({"error": str(e)}), 500


@bt_meta_api.route("/track", methods=["GET"])
def track_meta():
    log.verbose(blApiTag, "GET /track received")
    try:
        meta = get_metadata() or {}
        return jsonify(meta)
    except Exception as e:
        log.error(blApiTag, f"Failed to get metadata: {e}")
        return jsonify({"error": str(e)}), 500


@bt_meta_api.route("/progress", methods=["GET"])
def progress():
    log.verbose(blApiTag, "GET /progress received")
    try:
        return jsonify({"progress": get_progress()})
    except Exception as e:
        log.error(blApiTag, f"Failed to get progress: {e}")
        return jsonify({"error": str(e)}), 500


@bt_meta_api.route("/device_name", methods=["GET"])
def device_name():
    log.verbose(blApiTag, "GET /device_name received")
    try:
        return jsonify({"device": get_player_device_name()})
    except Exception as e:
        log.error(blApiTag, f"Failed to get device name: {e}")
        return jsonify({"error": str(e)}), 500
