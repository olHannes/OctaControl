from flask import Blueprint, jsonify, request
from utils.bluetooth_controller import BluetoothController
from utils.Logger import Logger

bt_control_api = Blueprint("bt_control_api", __name__, url_prefix="/api/bluetooth/control")
blApiTag = "BtControl"
log = Logger()

@bt_control_api.route("/play", methods=["POST"])
def play():
    log.verbose(blApiTag, "POST /play received")
    try:
        player = BluetoothController()
        player.play()
        return jsonify({"status": "playing"})
    except Exception as e:
        log.error(blApiTag, f"Failed to play: {e}")
        return jsonify({"error": str(e)}), 500


@bt_control_api.route("/pause", methods=["POST"])
def pause():
    log.verbose(blApiTag, "POST /pause received")
    try:
        player = BluetoothController()
        player.pause()
        return jsonify({"status": "paused"})
    except Exception as e:
        log.error(blApiTag, f"Failed to pause: {e}")
        return jsonify({"error": str(e)}), 500


@bt_control_api.route("/stop", methods=["POST"])
def stop():
    log.verbose(blApiTag, "POST /stop received")
    try:
        player = BluetoothController()
        player.stop()
        return jsonify({"status": "stopped"})
    except Exception as e:
        log.error(blApiTag, f"Failed to stop: {e}")
        return jsonify({"error": str(e)}), 500


@bt_control_api.route("/next", methods=["POST"])
def next_track():
    log.verbose(blApiTag, "POST /next received")
    try:
        player = BluetoothController()
        player.next()
        return jsonify({"status": "skipped to next"})
    except Exception as e:
        log.error(blApiTag, f"Failed to next: {e}")
        return jsonify({"error": str(e)}), 500


@bt_control_api.route("/previous", methods=["POST"])
def previous_track():
    log.verbose(blApiTag, "POST /previous received")
    try:
        player = BluetoothController()
        player.previous()
        return jsonify({"status": "skipped to previous"})
    except Exception as e:
        log.error(blApiTag, f"Failed to previous: {e}")
        return jsonify({"error": str(e)}), 500


@bt_control_api.route("/status", methods=["GET"])
def get_status():
    log.verbose(blApiTag, "GET /status received")
    try:
        player = BluetoothController()
        status = player.get_status()
        return jsonify({"status": status})
    except Exception as e:
        log.error(blApiTag, f"Failed to get playing status")
        return jsonify({"error", str(e)}), 500
    