from uart.dummy_uart import DummyUartReader

class SensorService:
    _instance = None

    def __init__(self):
        self.reader = DummyUartReader()

    @classmethod
    def get(cls):
        if not cls._instance:
            cls._instance = SensorService()
        return cls._instance

    def read_all(self):
        return self.reader.get_data()