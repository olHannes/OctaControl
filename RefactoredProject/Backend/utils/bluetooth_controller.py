from pydbus import SystemBus

class BluetoothController:
    def __init__(self):
        self.bus = SystemBus()
        self.player = None
        self._find_current_player()

    def _find_current_player(self):
        manager = self.bus.get('org.bluez', '/')
        for obj in manager.GetManagedObjects():
            if obj.endswith('/player0'):
                self.player = self.bus.get('org.bluez', obj)
                break

    def _ensure_player(self):
        if not self.player:
            raise RuntimeError("No Bluetooth media player found")

    def play(self):
        self._ensure_player()
        self.player.Play()

    def pause(self):
        self._ensure_player()
        self.player.Pause()

    def stop(self):
        self._ensure_player()
        self.player.Stop()

    def next(self):
        self._ensure_player()
        self.player.Next()

    def previous(self):
        self._ensure_player()
        self.player.Previous()
