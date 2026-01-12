
class DummyBtreader:
    pass

class DummyFmReader:
    pass

class BtReader:
    pass
class FmReader:
    pass

class AudioService:
    _instance = None

    def __init__(self):
        try:
            self.bt = BtReader()
        except:
            self.bt = DummyBtreader()
        
        try:
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