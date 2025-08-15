from flask import Blueprint, jsonify, request
import alsaaudio
from utils.Logger import Logger

volume_api = Blueprint("volume_api", __name__, url_prefix="/api/system/volume")

log = Logger()
volumeApiTag = "VolumeApi"

mixer_name = 'Master'


@system_api.route("/get", methods=["GET"])
def get_volume():
    """
    Reads and returns the volume and the muted status
    {"volume", "muted"}
    """
    log.verbose(volumeApiTag, "GET /get received")
    try:
        mixer = alsaaudio.Mixer(mixer_name)
        volume = mixer.getvolume()[0]
        is_muted = mixer.getmute()[0] == 1
        return jsonify({
            "volume": volume,
            "muted": is_muted
        }), 200
    except alsaaudio.ALSAAudioError as e:
        log.error(volumeApiTag, f"/get Alsa Error: {str(e)}")
        return jsonify({"error": f"ALSA Error: {str(e)}"}), 500
    except Exception as e:
        log.error(volumeApiTag, f"/get exception: {str(e)}")
        return jsonify({"error": str(e)}), 500


@system_api.route("/set", methods=["POST"])
def set_volume():
    """
    sets the volume of the pi based on the given parameter
    Payload = {"volume": 0< x <100}
    """
    log.verbose(volumeApiTag, "POST /set received")
    data = request.get_json()
    if not data or "volume" not in data:
        log.error(volumeApiTag, "/set missing parameter")
        return jsonify({"error": "Missing 'volume' parameter"}), 400
    
    try:
        vol = int(data["volume"])
    except (ValueError, TypeError):
        log.error(volumeApiTag, "/set invalid type")
        return jsonify({"error": "Volume must be an integer"}), 400
    volume = max(0, min(100, vol))

    try:
        mixer = alsaaudio.Mixer(mixer_name)
        volume = max(0, min(100, int(data["volume"])))
        mixer.setvolume(volume)
        return jsonify({
            "status": "success",
            "volume": volume
        }), 200
    except alsaaudio.ALSAAudioError as e:
        log.error(volumeApiTag, f"/set Alsa error: {str(e)}")
        return jsonify({"error": f"ALSA Error: {str(e)}"}), 500
    except Exception as e:
        log.error(volumeApiTag, f"/set exception: {e}")
        return jsonify({"error": str(e)}), 500
