import time
import random

class DummyBtReader:
    """
    Drop-in Dummy für Bluetooth:
    - get_data() liefert GENAU die gleiche Objektstruktur wie vorher.
    - Commands liefern bool (True=ok, False=fehlgeschlagen).
    - Realistische Simulation: Position läuft nur wenn playing=True, Trackwechsel, Clamp etc.
    """

    def __init__(self):
        self.connected = True
        self.device = "Samsung S22 - Dummy"

        self.playing = True
        self.title = "Dummy Song 1"
        self.artist = "Dummy Artist"
        self.album = "Dummy Album"

        self.durationMs = 3 * 60 * 1000  # 3 Minuten
        self.positionMs = 240            # Startposition wie bei dir
        self.volume = 30                 # 0..100

        self._last_ts = time.monotonic()

    # ---------- internal simulation ----------
    def _tick(self) -> None:
        """Simuliert fortlaufende Wiedergabezeit."""
        now = time.monotonic()
        delta_ms = int((now - self._last_ts) * 1000)
        self._last_ts = now

        if not self.connected:
            return

        if self.playing and delta_ms > 0:
            self.positionMs += delta_ms

            # Wenn Track zu Ende: typischerweise stoppen oder nächsten Track starten.
            # Ich mache hier: auf Ende clampen und stoppen (realistischer als sofort 0).
            if self.positionMs >= self.durationMs:
                self.positionMs = self.durationMs
                self.positionMs = 0
                #self.playing = False

    def _new_track(self) -> None:
        """Simuliert Track-Wechsel (skip/previous)."""
        self.positionMs = 0
        self.durationMs = random.randint(120, 360) * 1000
        self.title = f"Dummy Song {random.randint(1, 99)}"
        self.artist = "Dummy Artist"
        self.album = "Dummy Album"
        # Viele Player bleiben beim Skip im playing-Status, wenn vorher playing=True war.
        # Wenn du willst, dass Skip immer play startet, setz hier playing=True.
        self._last_ts = time.monotonic()

    # ---------- public API (same data shape) ----------
    def get_data(self):
        self._tick()
        return {
            "connected": self.connected,
            "device": self.device,
            "playing": self.playing,
            "title": self.title,
            "artist": self.artist,
            "album": self.album,
            "positionMs": self.positionMs,
            "durationMs": self.durationMs,
            "volume": self.volume,
        }

    # ---------- commands (return success boolean) ----------
    def set_volume(self, volume: int) -> bool:
        if not self.connected:
            return False
        try:
            v = int(volume)
        except (TypeError, ValueError):
            return False
        self.volume = max(0, min(100, v))
        return True

    def set_position(self, positionMs: int) -> bool:
        if not self.connected:
            return False
        try:
            p = int(positionMs)
        except (TypeError, ValueError):
            return False
        if p < 0:
            return False
        # Clamp auf Tracklänge
        self.positionMs = min(p, self.durationMs)
        # Zeitbasis sauber neu setzen, damit nach Seek nicht delta doppelt zählt
        self._last_ts = time.monotonic()
        return True

    def play(self) -> bool:
        if not self.connected:
            return False
        # Wenn am Ende: häufig von vorne starten
        if self.positionMs >= self.durationMs:
            self.positionMs = 0
        self.playing = True
        self._last_ts = time.monotonic()
        return True

    def pause(self) -> bool:
        if not self.connected:
            return False
        self._tick()
        self.playing = False
        return True

    def skip(self) -> bool:
        if not self.connected:
            return False
        was_playing = self.playing
        self._new_track()
        self.playing = was_playing  # Skip ändert nicht “automatisch” play/pause
        return True

    def previous(self) -> bool:
        if not self.connected:
            return False
        # Typisches Verhalten: wenn man “weit genug” im Track ist -> nur zum Anfang springen
        if self.positionMs > 3000:
            self.positionMs = 0
            self._last_ts = time.monotonic()
            return True
        was_playing = self.playing
        self._new_track()
        self.playing = was_playing
        return True
