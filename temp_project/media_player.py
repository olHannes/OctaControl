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
        print("function: play")
        self.Play()

    def pause(self):
        print("function: pause")
        self.Pause()

    def next(self):
        print("function: next")
        self.Next()

    def previous(self):
        print("function: previous")
        self.Previous()
