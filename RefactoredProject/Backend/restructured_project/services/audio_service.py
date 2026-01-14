
from Reader.dummy_btReader import DummyBtReader



class DummyFmReader:
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
    
    def set_volume(self, volume: int):
        reader = self._active_reader()
        if not hasattr(reader, "set_volume"):
            return False
        return reader.set_volume(volume)
    
    def read_bt(self):
        return self.bt.get_data()

    def read_fm(self):
        return self.fm.get_data()