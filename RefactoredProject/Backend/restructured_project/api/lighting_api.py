from flask import Blueprint, jsonify, request
from services.lighting_service import LightingService

lighting_api = Blueprint("lighting_api", __name__)

@lighting_api.route("", methods=["GET"])
def get_lighting():
    data = LightingService.get().load()
    return jsonify(data)

@lighting_api.route("", methods=["PATCH"])
def patch_lighting():
    payload = request.get_json(silent=True) or {}

    allowed = {"enabled", "brightness", "colorKey"}
    unknown = set(payload.keys()) - allowed
    if unknown:
        return jsonify({
            "error": "unknown fields",
            "unknown": sorted(unknown),
            "allowed": sorted(allowed),
        }), 400
    
    try:
        updated = LightingService.get().update(payload)
        return jsonify(updated)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "internal error", "details": str(e)}), 500