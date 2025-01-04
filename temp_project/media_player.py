from pydbus import SystemBus

class MediaPlayer:
    def __new__(self):
        try:
            print("Initializing MediaPlayer...")
            bus = SystemBus()
            print("SystemBus initialized.")

            manager = bus.get('org.bluez', '/')
            print("Manager initialized.")

            managed_objects = manager.GetManagedObjects()
            print("Managed Objects:", managed_objects)  # Debugging

            for obj, props in managed_objects.items():
                print(f"Checking object: {obj}, properties: {props}")  # Debugging

                # Überprüfe, ob das Objekt ein MediaPlayer ist
                if obj.endswith('/player0') and 'org.bluez.MediaPlayer1' in props:
                    print(f"Found valid player object: {obj}")
                    return bus.get('org.bluez', obj)
            
            # Kein gültiges Objekt gefunden
            print("No valid player0 object found.")
            raise MediaPlayer.DeviceNotFoundError
        except Exception as e:
            print(f"Error in MediaPlayer.__new__: {str(e)}")  # Debug-Ausgabe
            raise e

    class DeviceNotFoundError(Exception):
        def __init__(self):
            super().__init__('No Bluetooth media player was found')

    def play(self):
        try:
            print("Attempting to play...")
            self.Play()
        except Exception as e:
            print(f"Failed to play: {str(e)}")
            raise Exception(f"Failed to play: {str(e)}")

    def pause(self):
        try:
            print("Attempting to pause...")
            self.Pause()  # Stelle sicher, dass das richtige Interface verwendet wird
            print("Playback paused successfully.")
        except Exception as e:
            print(f"Error while pausing: {str(e)}")  # Debugging-Ausgabe
            raise Exception(f"Failed to pause: {str(e)}")

    def next(self):
        try:
            print("Attempting to skip to next track...")
            self.Next()
        except Exception as e:
            print(f"Failed to skip to next track: {str(e)}")
            raise Exception(f"Failed to skip to next track: {str(e)}")

    def previous(self):
        try:
            print("Attempting to go to previous track...")
            self.Previous()
        except Exception as e:
            print(f"Failed to go to previous track: {str(e)}")
            raise Exception(f"Failed to go to previous track: {str(e)}")
