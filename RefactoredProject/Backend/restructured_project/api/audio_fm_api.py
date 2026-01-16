from flask import Blueprint, jsonify, request
from services.audio_service import AudioService

fmAudio_api = Blueprint("audio_fm_api", __name__)

# ---------- Helper functions ----------
def bad_request(message: str, **details):
    payload = { "error": message }
    if details:
        payload["details"] = details
    return jsonify(payload), 400
def require_direction() -> str:
    direction = request.args.get("direction", type=str)
    if not direction:
        raise ValueError("Missing required query parameter 'direction'")
    direction = direction.strip().lower()
    if direction not in ("up", "down"):
        raise ValueError("Invalid 'direction' (expected 'up' oder 'down')")
    return direction
def parse_freq_khz(value) -> int:
    try:
        freq = int(value)
    except:
        raise ValueError("Invalid 'freq' (expected integer kHz, e.g. 98500)")
    if freq < 87500 or freq > 108000:
        raise ValueError("Invalid 'freq' (expected 87500..108000 kHz)")
    if freq % 100 != 0:
        raise ValueError("Invalid 'freq' (expected 100 kHz steps, e.g. 98500)")
    return freq
def require_name() -> str:
    name = None
    body = request.get_json(silent=True) or {}
    name = body.get("name")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Missing / invalid JSON field 'name' (expected non-empty string)")
    return name.strip()


# ---------- REST-APIs ----------
@fmAudio_api.route("/", methods=["GET"])
def get_data():
    data = AudioService.get().read_fm()
    return jsonify(data)


@fmAudio_api.route("/scan", methods=["GET"])
def scan():
    try:
        direction = require_direction()
    except ValueError as e:
        return bad_request(str(e), param="direction")
    
    ok = AudioService.get().fm_scan(direction)
    if not ok:
        return jsonify({"ok": False, "error": "scan failed"}), 503
    return jsonify({"ok": True, "action": "scan", "direction": direction}), 200


@fmAudio_api.route("/go", methods=["GET"])
def go():
    try:
        direction = require_direction()
    except ValueError as e:
        return bad_request(str(e), param="direction")
    ok = AudioService.get().fm_go(direction)
    if not ok:
        return jsonify({"ok": False, "error": "go failed"}), 503
    return jsonify({"ok": True, "action": "go", "direction": direction}), 200


@fmAudio_api.route("/set", methods=["POST"])
def set_freq():
    body = request.get_json(silent=True)
    if not body:
        return bad_request("Missing JSON body")
    
    if "freq" not in body:
        return bad_request("Missing required JSON field 'freq'", field="freq")
    try:
        freq_khz = parse_freq_khz(body.get("freq"))
    except ValueError as e:
        return bad_request(str(e), field="freq")
    ok = AudioService.get().fm_set_freq(freq_khz)
    if not ok:
        return jsonify({"ok": False, "error": "set failed"}), 503    
    return jsonify({"ok": True, "action": "set", "freq": freq_khz}), 200


@fmAudio_api.route("/presets", methods=["GET"])
def presets_list():
    favs = AudioService.get().fm_list_presets()
    return jsonify({"ok": True, "presets": favs}), 200


@fmAudio_api.route("/favorites", methods=["POST"])
def favorite_add():
    body = request.get_json(silent=True)
    if not body:
        return bad_request("Missing JSON body")
    if "freq" not in body:
        return bad_request("Missing required JSON field 'freq'", field="freq")
    
    try:
        freq_khz = parse_freq_khz(body.get("freq"))
    except ValueError as e:
        return bad_request(str(e), field="freq")
    name = body.get("name")
    #name check?!
    
    ok = AudioService.get().fm_add_favorite(freq_khz, name)
    if not ok:
        return jsonify({"ok": False, "error": "add favorite failed"}), 503
    return jsonify({"ok": True, "action": "favourite_add", "freq": freq_khz, "name": name}), 200


@fmAudio_api.route("/favorites", methods=["DELETE"])
def favorite_delete():
    freq_raw = request.args.get("freq")
    if freq_raw is None:
        return bad_request("Missing required query parameter 'freq'", param="freq")

    try:
        freq_khz = parse_freq_khz(freq_raw)
    except ValueError as e:
        return bad_request(str(e), param="freq")

    ok = AudioService.get().fm_delete_favorite(freq_khz)
    if not ok:
        return jsonify({"ok": False, "error": "favorite_delete_failed"}), 503
    return jsonify({"ok": True, "action": "favorite_delete", "freq": freq_khz}), 200
