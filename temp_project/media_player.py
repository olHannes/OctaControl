from pydbus import SystemBus

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
