from pydbus import SystemBus
from gi.repository import GLib

class BluetoothMediaPlayer:
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

    def get_metadata(self):
        if not self.player:
            print("No Bluetooth device found.")
            return None

        try:
            properties = self.player.getProperties()
            track_metadata = properties.get('Track', {})
            
            title = track_metadata.get('Title', 'Unknown Title')
            album = track_metadata.get('Album', 'Unknown Album')
            artist = track_metadata.get('Artist', 'Unknown Artist')
            genre = track_metadata.get('Genre', 'Unknown Genre')

            return {
                'Title': title,
                'Album': album,
                'Artist': artist,
                'Genre': genre
            }
        except Exception as e:
            print(f"Error while fetching metadata: {e}")
            return None
