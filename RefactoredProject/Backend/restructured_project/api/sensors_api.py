from flask import Blueprint, jsonify
from services.sensor_service import SensorService

sensors_api = Blueprint("sensors_api", __name__)

@sensors_api.route("/data", methods=["GET"])
def get_sensors():
    data = SensorService.get().read_all()
    return jsonify(data)

@sensors_api.route("/", methods=["GET"])
def get_supported_sensors():
    data = [{"sensor": "DHT11", "description": "Sensor for Humidity and Temperature.", "format": "°C and % value"},
            {"sensor": "BH1750", "description": "Brightness-sensor.", "format": "lux value"}]
    return jsonify(data)