from flask import Blueprint, jsonify, request
from services.audio_service import AudioService

btAudio_api = Blueprint("audio_bt_api", __name__)

@btAudio_api.route("/", methods=["GET"])
def get_data():
    data = AudioService.get().read_bt()
    return jsonify(data)

@btAudio_api.route("/play", methods=["POST"])
def trigger_play():
    ok = AudioService.get().bt.play()
    if not ok:
        return jsonify({"ok": False}), 409
    return jsonify({"ok": True}), 200

@btAudio_api.route("/pause", methods=["POST"])
def trigger_pause():
    ok = AudioService.get().bt.pause()
    if not ok:
        return jsonify({"ok": False}), 409
    return jsonify({"ok": True}), 200

@btAudio_api.route("/skip", methods=["POST"])
def trigger_skip():
    ok = AudioService.get().bt.skip()
    if not ok:
        return jsonify({"ok": False}), 409
    return jsonify({"ok": True}), 200

@btAudio_api.route("/previous", methods=["POST"])
def trigger_previous():
    ok = AudioService.get().bt.previous()
    if not ok:
        return jsonify({"ok": False}), 409
    return jsonify({"ok": True}), 200

@btAudio_api.route("/set_position", methods=["POST"])
def trigger_position():
    data = request.json
    if not data:
        return jsonify({"ok": False, "error": "request body missing or invalid JSON"}), 400
    if "positionMs" not in data:
        return jsonify({"ok": False, "error": "missing field 'positionMs'"}), 400
    ok = AudioService.get().bt.set_position(data["positionMs"])
    if not ok:
        return jsonify({"ok": False}), 409
    return jsonify({"ok": True}), 200
