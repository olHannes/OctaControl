from pydbus import SystemBus

class MediaPlayer:
    class DeviceNotFoundError(Exception):
        def __init__(self):
            super().__init__('No Bluetooth media player found')

    def __init__(self):
        """Initialisiert den MediaPlayer und sucht nach dem verfügbaren Player."""
        try:
            print("Initializing MediaPlayer...")
            bus = SystemBus()
            manager = bus.get('org.bluez', '/')
            managed_objects = manager.GetManagedObjects()

            # Suche nach einem Bluetooth MediaPlayer
            self.player = None
            for obj, props in managed_objects.items():
                if obj.endswith('/player0') and 'org.bluez.MediaPlayer1' in props:
                    self.player = bus.get('org.bluez', obj)
                    break

            if not self.player:
                print("No valid player0 object found.")
                raise MediaPlayer.DeviceNotFoundError

        except Exception as e:
            print(f"Error in MediaPlayer.__init__: {str(e)}")
            raise e

    def play(self):
        """Startet die Wiedergabe des aktuellen Tracks."""
        try:
            if self.player:
                print("Attempting to play...")
                self.player.Play()
                print("Playback started.")
            else:
                print("No player found to play.")
        except Exception as e:
            print(f"Failed to play: {str(e)}")
            raise Exception(f"Failed to play: {str(e)}")

    def pause(self):
        """Pausiert die Wiedergabe des aktuellen Tracks."""
        try:
            if self.player:
                print("Attempting to pause...")
                self.player.Pause()
                print("Playback paused successfully.")
            else:
                print("No player found to pause.")
        except Exception as e:
            print(f"Error while pausing: {str(e)}")
            raise Exception(f"Failed to pause: {str(e)}")

    def next(self):
        """Springt zum nächsten Track."""
        try:
            if self.player:
                print("Attempting to skip to next track...")
                self.player.Next()
                print("Skipped to next track.")
            else:
                print("No player found to skip to next track.")
        except Exception as e:
            print(f"Failed to skip to next track: {str(e)}")
            raise Exception(f"Failed to skip to next track: {str(e)}")

    def previous(self):
        """Springt zum vorherigen Track."""
        try:
            if self.player:
                print("Attempting to go to previous track...")
                self.player.Previous()
                print("Skipped to previous track.")
            else:
                print("No player found to go to previous track.")
        except Exception as e:
            print(f"Failed to go to previous track: {str(e)}")
            raise Exception(f"Failed to go to previous track: {str(e)}")



class MetaPlayer(object):
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