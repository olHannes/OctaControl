import os
import subprocess
import json
import threading
import time
import datetime
import smbus
import RPi.GPIO as GPIO
import board
import adafruit_dht
import gps
import pytz

class DeviceManager:
    def __init__(self):
        # Pin Konfiguration
        self.trunk_power_pin = 23
        self.dht_device = adafruit_dht.DHT11(board.D25)
        self.brightness_address = 0x23

        # Interne Zustände
        self.climate_lock = threading.Lock()
        self.brightness_lock = threading.Lock()
        self.gps_lock = threading.Lock()
        self.brightness_values = []
        self.gps_data = {}
        self.time_initialized = False
        self.climate_data_path = "climateData.txt"

        self._init_gpio()
    
    # ---------------------------- GPIO RELAIS ----------------------------
    def _init_gpio(self):
        if not GPIO.getmode():
            GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.trunk_power_pin, GPIO.OUT)
        print(f"[GPIO] Initialisiert: Pin {self.trunk_power_pin}")

    def enable_trunk_power(self):
        GPIO.output(self.trunk_power_pin, GPIO.HIGH)
        print("[Relais] Trunk-Power aktiviert")

    def disable_trunk_power(self):
        GPIO.output(self.trunk_power_pin, GPIO.LOW)
        print("[Relais] Trunk-Power deaktiviert")

    # ---------------------------- DHT SENSOR ----------------------------
    def read_climate_data(self):
        try:
            temperature = self.dht_device.temperature
            humidity = self.dht_device.humidity

            if temperature is not None and humidity is not None:
                with self.climate_lock:
                    with open(self.climate_data_path, "w") as f:
                        json.dump({"temperature": temperature, "humidity": humidity}, f)
                print(f"[Klima] T: {temperature}°C, H: {humidity}%")
                
                # TODO: MongoDB-Speicherung
                
                return {"temperature": temperature, "humidity": humidity}
        except Exception as e:
            print(f"[DHT11] Fehler beim Lesen: {e}")
        return None

    def load_climate_data(self):
        try:
            with self.climate_lock:
                with open(self.climate_data_path, "r") as file:
                    return json.load(file)
        except Exception:
            return {"temperature": 0, "humidity": 0}

    # ---------------------------- BH1750 LICHTSENSOR ----------------------------
    def read_brightness(self):
        try:
            bus = smbus.SMBus(1)
            bus.write_byte(self.brightness_address, 0x1)
            time.sleep(0.2)
            data = bus.read_i2c_block_data(self.brightness_address, 2)
            lux = (data[0] << 8 | data[1]) / 1.2
            brightness = round(lux, 2)
            print(f"[Licht] Helligkeit: {brightness} lux")
            return brightness
        except Exception as e:
            print(f"[BH1750] Fehler: {e}")
            return None

    def update_brightness_list(self):
        curr = self.read_brightness()
        if curr is not None:
            with self.brightness_lock:
                if len(self.brightness_values) >= 5:
                    self.brightness_values.pop(0)
                self.brightness_values.append(curr)
            # TODO: MongoDB-Speicherung

    def get_brightness_values(self):
        with self.brightness_lock:
            return list(self.brightness_values)

    # ---------------------------- GPS ----------------------------
    def _set_system_time(self, timestamp):
        if timestamp.year > 2000:
            subprocess.run(["sudo", "systemctl", "stop", "systemd-timesyncd"])
            time.sleep(1)
            subprocess.run(["sudo", "timedatectl", "set-time", str(timestamp)])
            subprocess.run(["sudo", "systemctl", "start", "systemd-timesyncd"])
            print(f"[Systemzeit] Aktualisiert auf: {timestamp}")
            self.time_initialized = True

    def polling_gps_data(self):
        session = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)
        session.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)

        while True:
            try:
                report = session.next()
                if report['class'] == 'TPV':
                    latitude = round(getattr(report, 'lat', 0.0), 5)
                    longitude = round(getattr(report, 'lon', 0.0), 5)
                    altitude = getattr(report, 'alt', 0.0)
                    speed = round(getattr(report, 'speed', 0.0) * 3.6, 2)
                    track = getattr(report, 'track', 0.0)
                    utc_time = getattr(report, 'time', None)
                    local_time = "N/A"

                    if utc_time:
                        utc_dt = datetime.datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%S.%fZ")
                        utc_dt = utc_dt.replace(tzinfo=pytz.utc)
                        local_tz = pytz.timezone("Europe/Berlin")
                        local_time = utc_dt.astimezone(local_tz)

                    with self.gps_lock:
                        self.gps_data = {
                            "latitude": latitude,
                            "longitude": longitude,
                            "altitude": altitude,
                            "speed": speed,
                            "track": track,
                            "local_time": local_time.strftime("%Y-%m-%d %H:%M:%S") if isinstance(local_time, datetime.datetime) else local_time
                        }

                    if not self.time_initialized and isinstance(local_time, datetime.datetime):
                        self._set_system_time(local_time)

                    print(f"[GPS] Pos: ({latitude}, {longitude}) - {speed}km/h - {local_time}")
                    
                    # TODO: MongoDB-Speicherung

                time.sleep(1)
            except Exception as e:
                print(f"[GPS] Fehler: {e}")

    def get_gps_data(self):
        with self.gps_lock:
            return self.gps_data.copy()

    def restart_gps_module(self):
        os.system("sudo systemctl restart gpsd")
        print("[GPS] gpsd neu gestartet")

