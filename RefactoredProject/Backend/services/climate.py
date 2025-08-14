from flask import Blueprint, jsonify, request
from utils.Logger import Logger
from utils.climate_reader import start, stop
import RPi.GPIO as GPIO
import os
import json

climate_api = Blueprint("climate_api", __name__, url_prefix="/api/climate")

log = Logger()
climateApiTag = "ClimateData"

DEVICE_PINS = {
    "climateReader": 20
}


def init_GPIO():
    """
    inits the general gpio settings and sets every used pin to low
    """
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

        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.normpath(os.path.join(base_dir, "../../utils/climate_data.js"))

        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                json.dump({"temperature": None, "humidity": None}, f)
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
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "../../utils/climate_data.json")
        file_path = os.path.normpath(file_path)

        with open(file_path, "r") as file:
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