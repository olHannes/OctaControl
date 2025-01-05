from pydbus import SystemBus
from gi.repository import GLib
import io
from PIL import Image

class MediaPlayer(object):
    def __new__(self):
        bus = SystemBus()
        manager = bus.get('org.bluez', '/')
        
        for obj in manager.GetManagedObjects():
            if obj.endswith('/player0'):
                return bus.get('org.bluez', obj)
        
        raise MediaPlayer.DeviceNotFoundError
    
    class DeviceNotFoundError(Exception):
        def __init__(self):
            super().__init__('No bluetooth device was found')


def getMeta():
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
        print("No Device found")
