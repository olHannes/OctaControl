
from services.audio_repo import AudioStateRepo, FmStateRepo

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
        data = self.fm.get_data()
        favs = FmStateRepo.list_favorites()
        data["favorites"] = favs

        cur_freq = data.get("frequency")
        if cur_freq is not None:
            data["isFavorite"] = any(int(f["frequency"]) == int(cur_freq) for f in favs)
        else:
            data["isFavorite"] = False
        return data
    



# ----- Fm-Radio specific functions (handles database changes) -----
    def fm_set_freq(self, freq_khz: int):
        ok = self.fm.set_freq(freq_khz)
        if ok:
            FmStateRepo.set_last_freq_khz(freq_khz)
        return ok
    
    def fm_go(self, direction: str):
        ok = self.fm.go_up() if direction == "up" else self.fm.go_down()
        if ok:
            data = self.fm.get_data()
            if "frequency" in data and data["frequency"] is not None:
                FmStateRepo.set_last_freq_khz(int(data["frequency"]))
        return ok
    
    def fm_scan(self, direction: str):
        ok = self.fm.scan_up() if direction == "up" else self.fm.scan_down()
        if ok:
            data = self.fm.get_data()
            if "frequency" in data and data["frequency"] is not None:
                FmStateRepo.set_last_freq_khz(int(data["frequency"]))
        return ok
    
    def fm_add_favorite(self, freq_khz: int, name: str):
        FmStateRepo.add_favorite(freq_khz, name)
        return True
    
    def fm_delete_favorite(self, freq_khz: int):
        FmStateRepo.delete_favorite(freq_khz)
        return True
    
    def fm_list_favorites(self):
        return FmStateRepo.list_favorites()
    
    def fm_list_presets(self):
        return FmStateRepo.list_presets()