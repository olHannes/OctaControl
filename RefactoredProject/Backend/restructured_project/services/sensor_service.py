from uart.dummy_uart import DummyUartReader
from uart.uart_sensor_reader import SensorUartReader

class SensorService:
    _instance = None

    def __init__(self):
        try:
            self.reader = SensorUartReader("COM12", 115200)
        except:
            self.reader = DummyUartReader()

    @classmethod
    def get(cls):
        if not cls._instance:
            cls._instance = SensorService()
        return cls._instance

    def read_all(self):
        return self.reader.get_data()