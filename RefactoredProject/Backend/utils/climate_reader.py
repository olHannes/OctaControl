import time
import threading
import json
import os

from .Logger import Logger

log = Logger()
TAG = "ClimateReader"

update_interval = 5

ON_RPI = False
try:
    import board
    import adafruit_dht

    ht_device = adafruit_dht.DHT11(board.D25)
    ON_RPI = True
except (ImportError, AttributeError, RuntimeError):
    log.verbose(TAG, "Raspberry Pi Hardware nicht gefunden, benutze Dummy-Werte")


FILE_PATH = os.path.join(os.path.dirname(__file__), "climate_data.json")

reader_thread = None
stop_event = threading.Event()
climate_lock = threading.Lock()


def save_climate_data(temperature, humidity):
    with climate_lock:
        data = {
            "temperature": temperature,
            "humidity": humidity
        }
        try:
            with open(FILE_PATH, "w") as f:
                json.dump(data, f)
            log.verbose(TAG, f"climate data saved: {data}")
        except Exception as e:
            log.error(TAG, f"Failed to write climate data: {e}")


def climate_worker():
    log.verbose(TAG, "climate worker has been started")
    while not stop_event.is_set():
        try:
            if ON_RPI:
                temperature = ht_device.temperature
                humidity = ht_device.humidity
            else:
                temperature = 0.1
                humidity = 0.1

            if temperature is not None and humidity is not None:
                save_climate_data(temperature, humidity)
            else:
                log.error(TAG, "no climate data available")

        except Exception as e:
            log.error(TAG, f"failed to read sensor: {e}")
        
        time.sleep(update_interval)
    log.verbose(TAG, "climate worker has been stopped")


def start():
    global reader_thread
    if reader_thread is None or not reader_thread.is_alive():
        stop_event.clear()
        reader_thread = threading.Thread(target=climate_worker, daemon=True)
        reader_thread.start()
        return "Reader starts"
    else:
        log.verbose(TAG, "Reader thread is already active")
        return "Reader is already active"


def stop():
    global reader_thread
    stop_event.set()
    if reader_thread is not None:
        reader_thread.join(timeout=2)
    try:
        if ON_RPI:
            ht_device.exit()
    except Exception as e:
        log.error(TAG, f"Error while releasing the sensor: {e}")
