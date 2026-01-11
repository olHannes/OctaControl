from flask import Blueprint, jsonify, request
from services.AudioSourceService import AudioSourceService

audio_source_api = Blueprint("audio_control_api", __name__)

@audio_source_api.route("/status", methods=["GET"])
def get_status():
    data = AudioSourceService.get().load()
    return jsonify(data)

@audio_source_api.route("/change", methods=["PATCH"])
def change_audio_source():
    payload = request.get_json(silent=True) or {}

    allowed = {"oldSource", "newSource"}
    unknown = set(payload.keys()) - allowed
    if unknown:
        return jsonify({
            "error": "unknown fields",
            "unknown": sorted(unknown),
            "allowed": sorted(allowed)
        }), 400

    if "oldSource" not in payload or "newSource" not in payload:
        return jsonify({"error": "oldSource and newSource are required"}), 400

    try:
        updated = AudioSourceService.get().change_source(
            old_source=payload["oldSource"],
            new_source=payload["newSource"],
        )
        return jsonify(updated)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "internal error", "details": str(e)}), 500
