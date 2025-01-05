from flask import Blueprint, jsonify, request
from media_player import *
from utils import *

app_routes = Blueprint('app_routes', __name__)

# Audio Routes
@app_routes.route("/audio/play", methods=["POST"])
def play_audio():
    try:
        player = MediaPlayer()
        player.play()
        return jsonify({"status": "success", "message": "Playback started"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/pause", methods=["POST"])
def pause_audio():
    try:
        player = MediaPlayer()
        player.pause()
        return jsonify({"status": "success", "message": "Playback paused"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/skip", methods=["POST"])
def skip_audio():
    try:
        player = MediaPlayer()
        player.next()
        return jsonify({"status": "success", "message": "Skipped to the next track"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/audio/previous", methods=["POST"])
def previous_audio():
    try:
        player = MediaPlayer()
        player.previous()
        return jsonify({"status": "success", "message": "Went to the previous track"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def get_audio_metadata():
    try:
        player = MetaPlayer()
        metadata = player.Track
        
        title = metadata.get('title', 'Unknown Title')
        artist = metadata.get('artist', 'Unknown Artist')
        album = metadata.get('album', 'Unknown Album')
        genre = metadata.get('genre', 'Unknown Genre')
        
        return {
            "title": title,
            "artist": artist,
            "album": album,
            "genre": genre
        }
    except MediaPlayer.DeviceNotFoundError:
        raise Exception("No Bluetooth media player found.")
    except Exception as e:
        raise Exception(f"Failed to retrieve metadata: {str(e)}")


@app_routes.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    """Flask route to get audio information."""
    try:
        metadata = get_audio_metadata()
        return jsonify({
            "status": "success",
            "information": metadata
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Bluetooth routes
@app_routes.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    result = enable_bluetooth()
    return jsonify(result)

@app_routes.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    result = disable_bluetooth()
    return jsonify(result)

@app_routes.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    result = enable_pairing_mode()
    return jsonify(result)

@app_routes.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    result = disable_pairing_mode()
    return jsonify(result)

# Volume routes
@app_routes.route("/volume/get", methods=["GET"])
def get_volume():
    try:
        volume, is_muted = get_volume_with_alsa()
        return jsonify({
            "status": "success",
            "volume": volume,
            "is_muted": is_muted
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app_routes.route("/volume/set", methods=["POST"])
def set_volume():
    data = request.json
    if "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400

    try:
        volume = int(data["volume"])
        if 0 <= volume <= 100:
            set_volume_with_alsa(volume)
            return jsonify({"status": "success", "message": f"Volume set to {volume}%"})
        else:
            raise ValueError("Volume must be between 0 and 100.")
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
