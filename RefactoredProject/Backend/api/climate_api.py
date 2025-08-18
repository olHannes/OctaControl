from flask import Blueprint, jsonify, request
import os
import json
from utils.Logger import Logger
from utils.climate_reader import start, stop
try:
    import RPi.GPIO as GPIO
    mock = True
except (ImportError, RuntimeError):
    from utils.gpio_mock import MockGPIO
    GPIO = MockGPIO()
    mock = True

climate_api = Blueprint("climate_api", __name__, url_prefix="/api/climate")

log = Logger()
climateApiTag = "ClimateData"

DEVICE_PINS = {
    "climateReader": 20
}

BASE_DIR = os.path.join(os.path.expanduser("~"), "Documents", "OctaControl", "RefactoredProject", "Backend", "utils")
CLIMATE_FILE = os.path.join(BASE_DIR, "climate_data.json")


def init_GPIO():
    """
    inits the general gpio settings and sets every used pin to low
    """
    global mock
    if mock:
        return
    log.verbose(climateApiTag, "/init GPIO pins")
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    for pin in DEVICE_PINS.values():
        GPIO.setup(pin, GPIO.OUT, initial=GPIO.LOW)

@climate_api.route("/init", methods=["GET"])
def initPins():
    """
    Trys to init the used gpio pins
    """
    log.verbose(climateApiTag, "GET /init received")
    try:
        init_GPIO()

        if not os.path.exists(CLIMATE_FILE):
            with open(CLIMATE_FILE, "w") as f:
                json.dump({"temperature": 0.1, "humidity": 0.1}, f)
            log.verbose(climateApiTag, "climate_data.json wurde initial erstellt")  
        
        return jsonify({"status": "success"}), 200
    except Exception as e:
        log.error(climateApiTag, f"/initPins: {e}")
        return jsonify({"error": str(e)}), 500


@climate_api.route("/get", methods=["GET"])
def getData():
    """
    Trys to read the climate-data file and returns the output
    Returns: {"temperature": x.x, "humidity": x.x}
    """
    log.verbose(climateApiTag, "GET /get received")
    try:
        with open(CLIMATE_FILE, "r") as file:
            data = json.load(file)

        temperature = data.get("temperature")
        humidity = data.get("humidity")

        if temperature is None or humidity is None:
            raise ValueError("Missing temp. or hum. in json")
        
        return jsonify({
            "temperature": temperature,
            "humidity": humidity
        }), 200
    
    except Exception as e:
        log.error(climateApiTag, f"/get failed: {e}")
        return jsonify({ "error": str(e) }), 500


@climate_api.route("/start", methods=["POST"])
def startThread():
    """
    Trys to start the climate_reader Thread
    """
    res = start()
    return jsonify({"status": "success", "message": res}), 200


@climate_api.route("/stop", methods=["POST"])
def stopThread():
    """
    Trys to stop the climate_reader Thread
    """
    stop()
    return jsonify({"status": "success"}), 200