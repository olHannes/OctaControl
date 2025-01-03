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
            super().__init__('No Bluetooth media player found')

    def play(self):
        self.Play()

    def pause(self):
        self.Pause()

    def next(self):
        self.Next()

    def previous(self):
        self.Previous()
