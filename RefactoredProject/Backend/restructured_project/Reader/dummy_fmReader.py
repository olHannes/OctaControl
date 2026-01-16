import time
import random

class DummyFmReader:
    """
    Dummy für FM-Radio:
    - get_data() liefert stabilen, realistischen FM-State
    - scan_up / scan_down springen auf simulierte Sender
    - Frequenzen in kHz (int)
    """

    FM_MIN = 87500
    FM_MAX = 108000
    FM_STEP = 100  # 0.1 MHz

    def __init__(self):
        # simulierte "empfangbare" Sender
        self._stations = {
            88500: "Radio Eins",
            91500: "Deutschlandfunk",
            94500: "Antenne Bayern",
            98500: "Bayern 3",
            101300: "SWR3",
            104600: "Radio Energy",
        }

        self.frequency = 98500
        self.volume = 30

        self.signal = 80           # 0..100
        self.radioStation = self._stations.get(self.frequency)

        self._last_ts = time.monotonic()
        self._favorites = set()

    # ---------- internal helpers ----------

    def _tick(self):
        """
        Simuliert minimale Signaländerungen über Zeit,
        damit get_data() nicht statisch bleibt.
        """
        now = time.monotonic()
        if now - self._last_ts < 0.5:
            return
        self._last_ts = now

        if self.frequency in self._stations:
            self.signal = max(60, min(100, self.signal + random.randint(-2, 2)))
        else:
            self.signal = max(0, min(20, self.signal + random.randint(-3, 3)))

    def _tune(self, freq: int):
        freq = int(freq)
        freq = max(self.FM_MIN, min(self.FM_MAX, freq))

        self.frequency = freq
        self.radioStation = self._stations.get(freq)
        self.signal = random.randint(65, 95) if self.radioStation else random.randint(0, 15)
        self._last_ts = time.monotonic()

    def _scan(self, direction: int):
        """
        direction: +1 = up, -1 = down
        """
        freqs = sorted(self._stations.keys())
        cur = self.frequency

        if direction > 0:
            for f in freqs:
                if f > cur:
                    self._tune(f)
                    return True
            self._tune(freqs[0])
            return True
        else:
            for f in reversed(freqs):
                if f < cur:
                    self._tune(f)
                    return True
            self._tune(freqs[-1])
            return True

    # ---------- public API ----------

    def get_data(self):
        self._tick()
        return {
            "frequency": self.frequency,
            "radioStation": self.radioStation,
            "signal": self.signal,
            "volume": self.volume,
        }

    def set_volume(self, volume: int) -> bool:
        try:
            v = int(volume)
        except (TypeError, ValueError):
            return False
        self.volume = max(0, min(100, v))
        return True

    def set_freq(self, freq) -> bool:
        try:
            self._tune(int(freq))
            return True
        except Exception:
            return False

    def go(self, direction):
        if direction == "up":
            if self.frequency+self.FM_STEP <= self.FM_MAX:
                self.frequency += self.FM_STEP
        elif direction == "down":
            if self.frequency-self.FM_STEP >= self.FM_MIN:
                self.frequency -= self.FM_STEP
        return self.frequency

    def scan(self, direction):
        if direction == "up":
            return self.scan_up()
        elif direction == "down":
            return self.scan_down()
        return False
    
    def scan_up(self) -> bool:
        return self._scan(+1)

    def scan_down(self) -> bool:
        return self._scan(-1)

    def save_fav(self, freq) -> bool:
        try:
            f = int(freq)
        except (TypeError, ValueError):
            return False
        self._favorites.add(f)
        return True
