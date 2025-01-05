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


def print_meta():
    try:
        handle = MediaPlayer()
        metadata = handle.Track
        print(metadata)
    except MediaPlayer.DeviceNotFoundError:
        print("No device found")