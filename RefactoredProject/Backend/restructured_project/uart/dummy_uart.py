import random
import time
import threading
from datetime import datetime, timezone
import copy


class DummyUartReader:
    def __init__(self):
        self.data = {
            "dummy": True,

            "time": "",
            "local_time": "",

            "flags": {
                "gps_fix": True,
                "charging": False,
                "internet": True,
            },

            "gps": {
                "lat": 52.123456,
                "lon": 9.123456,
                "speed": 0.0,
                "sats": 7,
                "altitude": 238.0,
                "accuracy": 5.9,
                "quality": "medium",
                "heading": 60.0,
            },

            "climate": {
                "temperature": 22.0,
                "humidity": 48
            },

            "brightness": 320
        }

        self._lock = threading.Lock()
        self._running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def _update_time(self):
        utc_now = datetime.now(timezone.utc)
        local_now = datetime.now()

        self.data["time"] = utc_now.strftime("%Y-%m-%d %H:%M:%S")
        self.data["local_time"] = local_now.strftime("%Y-%m-%d %H:%M:%S")

    def _update_gps_quality(self):
        acc = self.data["gps"]["accuracy"]
        if acc < 5:
            q = "good"
        elif acc < 20:
            q = "medium"
        else:
            q = "poor"
        self.data["gps"]["quality"] = q

    def _loop(self):
        while self._running:
            with self._lock:
                self._update_time()

                cur_speed = self.data["gps"]["speed"]
                target = random.uniform(0, 130)
                new_speed = cur_speed + (target - cur_speed) * random.uniform(0.15, 0.35)
                self.data["gps"]["speed"] = round(max(0.0, min(130.0, new_speed)), 1)

                self.data["gps"]["heading"] = round((self.data["gps"]["heading"] + random.uniform(-8, 8)) % 360, 1)

                move_scale = 0.000005 + (self.data["gps"]["speed"] / 130.0) * 0.00002
                self.data["gps"]["lat"] += random.uniform(-move_scale, move_scale)
                self.data["gps"]["lon"] += random.uniform(-move_scale, move_scale)

                sats = self.data["gps"]["sats"] + random.choice([-1, 0, 0, 0, 1])
                self.data["gps"]["sats"] = int(max(4, min(12, sats)))

                base_acc = max(2.0, 60.0 - self.data["gps"]["sats"] * 6.0)
                acc = base_acc + random.uniform(-3.0, 8.0)
                self.data["gps"]["accuracy"] = round(max(2.0, min(80.0, acc)), 1)

                alt = self.data["gps"]["altitude"] + random.uniform(-1.2, 1.2)
                self.data["gps"]["altitude"] = round(max(-50.0, min(4000.0, alt)), 1)

                self._update_gps_quality()

                temp = self.data["climate"]["temperature"] + random.uniform(-0.08, 0.08)
                hum = self.data["climate"]["humidity"] + random.randint(-1, 1)
                self.data["climate"]["temperature"] = round(max(-10.0, min(45.0, temp)), 1)
                self.data["climate"]["humidity"] = int(max(0, min(100, hum)))

                b = self.data["brightness"] + random.randint(-25, 25)
                self.data["brightness"] = int(max(0, min(1000, b)))

                if random.random() < 0.01:
                    self.data["flags"]["internet"] = not self.data["flags"]["internet"]
                self.data["flags"]["gps_fix"] = self.data["gps"]["sats"] >= 5

            time.sleep(1)

    def stop(self):
        self._running = False

    def get_data(self):
        with self._lock:
            return copy.deepcopy(self.data)
