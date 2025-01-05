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

def print_metadata():
    try:
        handle = MediaPlayer()

        # Hole die aktuellen Metadaten einmalig ab
        track_metadata = handle.Get('org.freedesktop.DBus.Properties', 'Track')
        title = track_metadata.get('Title', 'Unknown Title')
        duration = track_metadata.get('Duration', 'Unknown Duration')
        album = track_metadata.get('Album', 'Unknown Album')
        artist = track_metadata.get('Artist', 'Unknown Artist')

        # Zeige die Metadaten an
        print("Metadata:")
        print(f"Title: {title}")
        print(f"Duration: {duration}")
        print(f"Album: {album}")
        print(f"Artist: {artist}")
        
    except MediaPlayer.DeviceNotFoundError:
        print("No Bluetooth device found.")
    except Exception as e:
        print(f"Error: {e}")

# Aufruf der Funktion
print_metadata()
