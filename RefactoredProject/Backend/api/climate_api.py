from flask import Blueprint, jsonify, request
import os
import json
from utils.Logger import Logger
from utils.climate_reader import start, stop
import config

if config.SYSTEM_RPI:
    import RPi.GPIO as GPIO
    mock = False
else:
    from utils.gpio_mock import MockGPIO
    GPIO = MockGPIO()
    mock = True

climate_api = Blueprint("climate_api", __name__, url_prefix="/api/climate")

log = Logger()
climateApiTag = "ClimateData"
CLIMATE_FILE = os.path.expanduser(config.CLIMATE["FILE_PATH"])


@climate_api.route("/init", methods=["GET"])
def initPins():
    """
    Trys to init the used .json file
    """
    log.verbose(climateApiTag, "GET /init received")
    try:
        if not os.path.exists(CLIMATE_FILE):
            with open(CLIMATE_FILE, "w") as f:
                json.dump({"temperature": -0.1, "humidity": -0.1}, f)
            log.verbose(climateApiTag, "climate_data.json wurde initial erstellt")  
        
        return jsonify({"status": "success"}), 200
    except Exception as e:
        log.error(climateApiTag, f"/init: {e}")
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
    log.verbose(climateApiTag, "POST /start received")
    res = start()
    return jsonify({"status": "success", "message": res}), 200


@climate_api.route("/stop", methods=["POST"])
def stopThread():
    """
    Trys to stop the climate_reader Thread
    """
    log.verbose(climateApiTag, "POST /stop received")
    stop()
    return jsonify({"status": "success"}), 200