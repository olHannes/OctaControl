
from services.audio_repo import AudioStateRepo

from Reader.dummy_btReader import DummyBtReader
from Reader.dummy_fmReader import DummyFmReader


class BtReader:
    def set_volume(self, volume: int):
        pass
    def get_data(self):
        pass
    def set_position(self, positionMs: int):
        pass
    def play(self):
        pass
    def pause(self):
        pass
    def skip(self):
        pass
    def previous(self):
        pass


class FmReader:
    def get_data(self):
        pass
    def set_volume(self, volume: int):
        pass
    def set_freq(self, freq):
        pass
    def scan_up(self):
        pass
    def scan_down(self):
        pass
    def save_fav(self, freq):
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
            a = 5/0
        except:
            self.fm = DummyFmReader()

        self.active_source = None
    
    def _active_reader(self):
        return self.bt if self.active_source == "bluetooth" else self.fm
    
    @classmethod
    def get(cls):
        if not cls._instance:
            cls._instance = AudioService()
        return cls._instance
    
    def set_active_source(self, source: str):
        if source in ("bluetooth", "radio"):
            self.active_source = source
            if source == "radio":
                self.bt.pause()
    
    def set_volume(self, volume: int):
        reader = self._active_reader()
        ok = hasattr(reader, "set_volume") and reader.set_volume(volume)
        if ok:
            AudioStateRepo.set_source_volume(self.active_source, int(volume))
        return ok
    
    def read_bt(self):
        return self.bt.get_data()

    def read_fm(self):
        return self.fm.get_data()