import sys

class MockGPIO:
    BCM = "BCM"
    BOARD = "BOARD"
    OUT = "OUT"
    IN = "IN"
    HIGH = 1
    LOW = 0

    def __init__(self):
        self.pins = {}

    def setmode(self, mode):
        print(f"[GPIO MOCK] setmode({mode})")

    def setup(self, pin, mode):
        self.pins[pin] = {"mode": mode, "state": self.LOW}
        print(f"[GPIO MOCK] setup(pin={pin}, mode={mode})")

    def output(self, pin, state):
        if pin in self.pins:
            self.pins[pin]["state"] = state
        print(f"[GPIO MOCK] output(pin={pin}, state={state})")

    def input(self, pin):
        value = self.pins.get(pin, {}).get("state", self.LOW)
        print(f"[GPIO MOCK] input(pin={pin}) -> {value}")
        return value

    def cleanup(self):
        print("[GPIO MOCK] cleanup()")
        self.pins.clear()


# Damit dein Code weiterhin `import RPi.GPIO as GPIO` schreiben kann:
sys.modules['RPi'] = sys.modules.get('RPi', type(sys)('RPi'))
sys.modules['RPi.GPIO'] = MockGPIO()
