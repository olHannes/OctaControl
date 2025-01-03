from flask import Flask, render_template, jsonify, request, jsonify
from flask_cors import CORS
import subprocess
import alsaaudio
from pydbus import SystemBus
from gi.repository import GLib
import threading


def run_bluetoothctl_command(command):
    try:
        result = subprocess.run(
            ["bluetoothctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_playerctl_command(command):
    try:
        result = subprocess.run(
            ["playerctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_amixer_command(command):
    try:
        result = subprocess.run(
            ["amixer"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)



app = Flask(__name__)

class MediaPlayer:
    def __new__(self):
        bus = SystemBus()
        manager = bus.get('org.bluez', '/')
        
        for obj in manager.GetManagedObjects():
            if obj.endswith('/player0'):
                return bus.get('org.bluez', obj)
        
        raise MediaPlayer.DeviceNotFoundError
    
    class DeviceNotFoundError(Exception):
        def __init__(self):
            super().__init__('No Bluetooth media player was found')

    def play(self):
        try:
            self.Play()
        except Exception as e:
            raise Exception(f"Failed to play: {str(e)}")

    def pause(self):
        try:
            self.Pause()
        except Exception as e:
            raise Exception(f"Failed to pause: {str(e)}")

    def next(self):
        try:
            self.Next()
        except Exception as e:
            raise Exception(f"Failed to skip to next track: {str(e)}")

    def previous(self):
        try:
            self.Previous()
        except Exception as e:
            raise Exception(f"Failed to go to previous track: {str(e)}")




# Audio Routes
@app.route("/audio/play", methods=["POST"])
def play_audio():
    print("Trying to play audio")
    try:
        player = MediaPlayer()
        player.play()
        return jsonify({"status": "success", "message": "Playback started"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player was found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/audio/pause", methods=["POST"])
def pause_audio():
    print("Trying to pause audio")
    try:
        player = MediaPlayer()
        player.pause()
        return jsonify({"status": "success", "message": "Playback paused"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player was found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/audio/skip", methods=["POST"])
def skip_audio():
    print("Trying to skip audio")
    try:
        player = MediaPlayer()
        player.next()
        return jsonify({"status": "success", "message": "Skipped to the next track"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player was found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/audio/previous", methods=["POST"])
def previous_audio():
    print("Trying to go to the previous track")
    try:
        player = MediaPlayer()
        player.previous()
        return jsonify({"status": "success", "message": "Went to the previous track"})
    except MediaPlayer.DeviceNotFoundError:
        return jsonify({"status": "error", "message": "No Bluetooth media player was found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500





def get_audio_metadata():
    try:
        handle = MediaPlayer()
        metadata = handle.Track
        
        title = metadata.get('Title', 'Unknown Title')
        artist = metadata.get('Artist', 'Unknown Artist')
        album = metadata.get('Album', 'Unknown Album')
        genre = metadata.get('Genre', 'Unknown Genre')
        
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



@app.route("/audio/getinformation", methods=["GET"])
def get_audio_information():
    """Flask route to get audio information."""
    print("Trying to get audio information")
    try:
        metadata = get_audio_metadata()
        return jsonify({
            "status": "success",
            "information": metadata
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



# Bluetooth routes

@app.route("/bluetooth/on", methods=["POST"])
def bluetooth_on():
    print("try to turn on bluetooth")
    output = run_bluetoothctl_command("power on")
    return jsonify({"status": "success", "message": output})

@app.route("/bluetooth/off", methods=["POST"])
def bluetooth_off():
    print("try to turn off bluetooth")
    output = run_bluetoothctl_command("power off")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/on", methods=["POST"])
def pairing_mode_on():
    print("try to turn on pairing mode")
    run_bluetoothctl_command("discoverable on")
    output = run_bluetoothctl_command("pairable on")
    return jsonify({"status": "success", "message": output})

@app.route("/pairingmode/off", methods=["POST"])
def pairing_mode_off():
    print("try to turn off pairing mode")
    run_bluetoothctl_command("discoverable off")
    output = run_bluetoothctl_command("pairable off")
    return jsonify({"status": "success", "message": output})


#volume routes
@app.route("/volume/get", methods=["GET"])
def get_volume():
    print("Try to get volume using alsaaudio")
    try:
        mixer = alsaaudio.Mixer()
        volume = mixer.getvolume()[0]
        is_muted = mixer.getmute()[0] == 1
        return jsonify({
            "status": "success",
            "volume": volume,
            "is_muted": is_muted
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Could not retrieve volume: {str(e)}"
        }), 500


@app.route("/volume/set", methods=["POST"])
def set_volume():
    print("Try to set Volume")
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "Invalid JSON format."}), 400
    if "volume" not in data:
        return jsonify({"status": "error", "message": "Please provide a volume level."}), 400
    try:
        volume = int(data["volume"])
    except ValueError:
        return jsonify({"status": "error", "message": "Volume must be an integer."}), 400
    if not (0 <= volume <= 100):
        return jsonify({"status": "error", "message": "Volume must be between 0 and 100."}), 400
    try:
        set_volume_with_alsa(volume)  # Hier wird die Funktion aus `alsaaudio` aufgerufen
    except alsaaudio.ALSAAudioError as e:
        return jsonify({"status": "error", "message": f"Error setting volume: {str(e)}"}), 500

    return jsonify({"status": "success", "message": f"Volume set to {volume}%"})


def set_volume_with_alsa(volume):
    """Sets the system volume using alsaaudio."""
    mixer = alsaaudio.Mixer()
    vol = max(0, min(100, int(volume)))  # Sicherstellen, dass der Wert zwischen 0 und 100 liegt
    mixer.setvolume(vol)





@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
