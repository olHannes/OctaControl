import serial
import struct
import threading
import copy
from timezonefinder import TimezoneFinder
from datetime import datetime
import pytz

START_BYTE = 0xAA
FMT = "<hhBiihBiiHHBBBBBB"
PAYLOAD_SIZE = struct.calcsize(FMT)

tf = TimezoneFinder()

class SensorUartReader:
    def __init__(self, port="COM12", baud=115200):
        self.ser = serial.Serial(port, baud, timeout=None)

        self.data = {
            "gps": {
                "lat": 0.0,
                "lon": 0.0,
                "speed": 0.0,
                "sats": 0,
                "altitude": 0.0,
                "accuracy": 0.0,
                "quality": "none",
                "heading": 0.0
            },
            "climate": {
                "temperature": 0.0,
                "humidity": 0.0
            },
            "brightness": 0,
            "time": "0000-00-00 00:00:00",
            "flags": 0
        }
    
        self._lock = threading.Lock()
        self._running = True
        

        threading.Thread(target=self._loop, daemon=True).start()

    # ---------------------------------------------------------

    def _crc16(self, data: bytes):
        crc = 0xFFFF
        for byte in data:
            crc ^= byte
            for _ in range(8):
                if crc & 1:
                    crc = (crc >> 1) ^ 0xA001
                else:
                    crc >>= 1
        return crc
    
    # ---------------------------------------------------------

    def _loop(self):
        while self._running:
            try:
                b = self.ser.read(1)
                if not b:
                    continue
                if b[0] != START_BYTE:
                    continue

                length = self.ser.read(1)[0]
                
                if length != PAYLOAD_SIZE +1:
                    continue
                
                cmd = self.ser.read(1)[0]

                payload = self.ser.read(length - 1)
                crc_lo = self.ser.read(1)[0]
                crc_hi = self.ser.read(1)[0]
                crc_recv = crc_lo | (crc_hi << 8)

                crc_data = bytes([length, cmd]) + payload
                crc_calc = self._crc16(crc_data)

                if crc_calc != crc_recv:
                    continue

                values = struct.unpack(FMT, payload)

                brightness, temperature, humidity, \
                lat, lon, speed, sats, \
                altitude, accuracy, heading, \
                year, month, day, hour, minute, second, \
                flags = values
                
                acc = accuracy / 100.0
                
                local_time = None
                
                if sats >= 4 and acc < 100 and lat != 0 and lon != 0:
                    local_time = utc_to_local(lat / 1e6, lon / 1e6, year, month, day, hour, minute, second)

                with self._lock:
                    self.data["brightness"] = brightness / 10.0

                    self.data["climate"]["temperature"] = temperature / 10.0
                    self.data["climate"]["humidity"] = humidity

                    self.data["gps"]["lat"] = lat / 1e6
                    self.data["gps"]["lon"] = lon / 1e6
                    self.data["gps"]["speed"] = speed / 10.0
                    self.data["gps"]["sats"] = sats
                    self.data["gps"]["altitude"] = altitude / 100.0
                    self.data["gps"]["accuracy"] = accuracy / 100.0
                    self.data["gps"]["quality"] = (
                        "good" if acc < 5 else "medium" if acc < 20 else "poor"
                    )
                    self.data["gps"]["heading"] = heading / 10.0

                    self.data["time"] = (
                        f"{year:04d}-{month:02d}-{day:02d} "
                        f"{hour:02d}:{minute:02d}:{second:02d}"
                    )
                    
                    self.data["local_time"] = local_time

                    self.data["flags"] = flags

            except Exception as e:
                pass
    
    # ---------------------------------------------------------

    def get_data(self):
        with self._lock:
            return copy.deepcopy(self.data)

        
# ---------------------------------------------------------

def utc_to_local(lat, lon, year, month, day, hour, minute, second):
    try:
        tz_name = tf.timezone_at(lat=lat, lng=lon)
        if tz_name is None:
            return None
        tz = pytz.timezone(tz_name)
        
        utc_dt = datetime(year, month, day, hour, minute, second, tzinfo=pytz.utc)
        local_dt = utc_dt.astimezone(tz)
        return local_dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return None