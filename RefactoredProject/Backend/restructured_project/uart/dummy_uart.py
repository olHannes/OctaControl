import random
import time
import threading

class DummyUartReader:
    def __init__(self):
        self.data = {
            "gps": {
                "lat": 52.123456,
                "lon": 9.123456,
                "speed": 0.0,
                "sats": 7
            },
            "climate": {
                "temp": 22.0,
                "humidity": 48
            },
            "brightness": 320
        }

        self._lock = threading.Lock()
        self._running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def _loop(self):
        while self._running:
            with self._lock:
                self.data["gps"]["speed"] = round(random.uniform(0, 130), 1)
                self.data["gps"]["lat"] += random.uniform(-0.00001, 0.00001)
                self.data["gps"]["lon"] += random.uniform(-0.00001, 0.00001)

                self.data["climate"]["temp"] += random.uniform(-0.1, 0.1)
                self.data["climate"]["humidity"] += random.randint(-1, 1)

                self.data["brightness"] = max(0, min(
                    1000, self.data["brightness"] + random.randint(-20, 20))
                )

            time.sleep(1)

    def get_data(self):
        with self._lock:
            return self.data.copy()
