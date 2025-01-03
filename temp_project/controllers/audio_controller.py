from flask import Blueprint, jsonify
from ..helpers import run_playerctl_command

audio_routes = Blueprint('audio', __name__)

@audio_routes.route("/audio/play", methods=["POST"])
def play_audio():
    output = run_playerctl_command("play")
    return jsonify({"status": "success", "message": output})

@audio_routes.route("/audio/pause", methods=["POST"])
def pause_audio():
    output = run_playerctl_command("pause")
    return jsonify({"status": "success", "message": output})

@audio_routes.route("/audio/skip", methods=["POST"])
def skip_audio():
    output = run_playerctl_command("next")
    return jsonify({"status": "success", "message": output})

@audio_routes.route("/audio/previous", methods=["POST"])
def previous_audio():
    output = run_playerctl_command("previous")
    return jsonify({"status": "success", "message": output})

@audio_routes.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    try:
        title = run_playerctl_command("metadata xesam:title")
        artist = run_playerctl_command("metadata xesam:artist")
        album = run_playerctl_command("metadata xesam:album")
        genre = run_playerctl_command("metadata xesam:genre")
        return jsonify({
            "status": "success",
            "information": {
                "title": title,
                "artist": artist,
                "album": album,
                "genre": genre
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
