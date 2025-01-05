from pydbus import SystemBus

class BluetoothController:
    def __init__(self):
        self.bus = SystemBus()
        self.player = None
        self.find_current_player()

    def find_current_player(self):
        manager = self.bus.get('org.bluez', '/')
        for obj in manager.GetManagedObjects():
            if obj.endswith('/player0'):
                self.player = self.bus.get('org.bluez', obj)
                break

    def play(self):
        if self.player:
            self.player.Play()
            print("Playing music.")
        else:
            print("No Bluetooth device found.")

    def pause(self):
        if self.player:
            self.player.Pause()
            print("Pausing music.")
        else:
            print("No Bluetooth device found.")

    def stop(self):
        if self.player:
            self.player.Stop()
            print("Stopping music.")
        else:
            print("No Bluetooth device found.")

    def next(self):
        if self.player:
            self.player.Next()
            print("Skipping to next track.")
        else:
            print("No Bluetooth device found.")

    def previous(self):
        if self.player:
            self.player.Previous()
            print("Skipping to previous track.")
        else:
            print("No Bluetooth device found.")
