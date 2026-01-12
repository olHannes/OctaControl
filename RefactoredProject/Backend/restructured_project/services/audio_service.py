
import time 
import random
class DummyBtReader:
    def __init__(self):
        self.connected = True
        self.device = "Samsung S22 - Dummy"

        self.playing = True
        self.title = "Dummy Song"
        self.artist = "Dummy Artist"
        self.album = "Dummy Album"

        self.durationMs = 3 * 60 * 1000
        self.positionMs = 240

        self.volume = 50

        self._last_ts = time.monotonic()
    
    def _tick(self):
        now = time.monotonic()
        delta_ms = int((now-self._last_ts) * 1000)
        self._last_ts = now

        if self.playing:
            self.positionMs += delta_ms
            if self.positionMs >= self.durationMs:
                self.positionMs = self.durationMs
                self.playing = False
    def get_data(self):
        self._tick()

        return {
            "connected": self.connected,
            "device": self.device,
            "playing": self.playing,
            "title": self.title,
            "artist": self.artist,
            "album": self.album,
            "positionMs": self.positionMs,
            "durationMs": self.durationMs,
            "volume": self.volume,
        }

    def play(self):
        if self.connected:
            self.playing = True
            self._last_ts = time.monotonic()

    def pause(self):
        self._tick()
        self.playing = False

    def skip(self):
        self._new_track()

    def previous(self):
        self._new_track()

    def set_volume(self, volume: int):
        self.volume = max(0, min(100, int(volume)))

    def _new_track(self):
        self.positionMs = 0
        self.durationMs = random.randint(120, 360) * 1000
        self.title = f"Dummy Song {random.randint(1,99)}"
        self.artist = "Dummy Artist"
        self.album = "Dummy Album"
        self.playing = True
        self._last_ts = time.monotonic()




class DummyFmReader:
    pass

class BtReader:
    pass
class FmReader:
    pass


#Audio Service (used in Sockets to get real or mock data)
class AudioService:
    _instance = None

    def __init__(self):
        try:    #Bluetooth
            self.bt = BtReader()
            a = 5/0
        except:
            self.bt = DummyBtReader()
        try:    #FM-Radio
            self.fm = FmReader()
        except:
            self.fm = DummyFmReader()

        self.active_source = None
    
    @classmethod
    def get(cls):
        if not cls._instance:
            cls._instance = AudioService()
        return cls._instance
    
    def set_active_source(self, source: str):
        if source in ("bluetooth", "radio"):
            self.active_source = source
    
    def read_bt(self):
        return self.bt.get_data()

    def read_fm(self):
        return self.fm.get_data()