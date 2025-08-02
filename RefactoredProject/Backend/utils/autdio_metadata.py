from pydbus import SystemBus
from gi.repository import GLib
from PIL import Image

class MediaPlayer:
    def __new__(cls):
        bus = SystemBus()
        manager = bus.get('org.bluez', '/')

        for obj_path in manager.GetManagedObjects():
            if obj_path.endswith('/player0'):
                return bus.get('org.bluez', obj_path)

        raise MediaPlayer.DeviceNotFoundError

    class DeviceNotFoundError(Exception):
        def __init__(self):
            super().__init__("No Bluetooth media player found.")

def get_metadata():
    try:
        player = MediaPlayer()
        metadata = player.Track

        return {
            "title": metadata.get("Title", "Unknown Title"),
            "artist": metadata.get("Artist", "Unknown Artist"),
            "album": metadata.get("Album", "Unknown Album"),
            "genre": metadata.get("Genre", "Unknown Genre")
        }

    except MediaPlayer.DeviceNotFoundError:
        return {
            "title": None,
            "artist": None,
            "album": None,
            "genre": None,
            "error": "No Bluetooth device connected"
        }

def get_player_device_name():
    bus = SystemBus()
    manager = bus.get('org.bluez', '/')

    for path, interfaces in manager.GetManagedObjects().items():
        if 'org.bluez.MediaPlayer1' in interfaces:
            device_path = path.rsplit('/', 1)[0]
            device = bus.get('org.bluez', device_path)
            return device.Name
    return "Unknown Device"

_last_position = 0
_is_playing = False

def get_progress():
    global _last_position, _is_playing
    try:
        player = MediaPlayer()
        metadata = player.Track
        position = player.Position
        duration = metadata.get("Duration", 0)

        if duration == 0:
            return 0

        _is_playing = abs(position - _last_position) > 10
        _last_position = position

        return int((position / duration) * 100)
    except MediaPlayer.DeviceNotFoundError:
        return 0

def is_playing():
    return _is_playing
