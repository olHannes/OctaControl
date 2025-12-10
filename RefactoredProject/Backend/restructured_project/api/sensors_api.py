from flask import Blueprint, jsonify
from database import get_db
from services.sensor_service import SensorService

sensors_api = Blueprint("sensors_api", __name__)

@sensors_api.route("/data", methods=["GET"])
def get_sensors():
    data = SensorService.get().read_all()
    return jsonify(data)

@sensors_api.route("/", methods=["GET"])
def get_supported_sensors():
    db = get_db()
    rows = db.execute("SELECT id, name, description, datafields, active FROM sensors").fetchall()
    sensors = [dict(row) for row in rows]
    
    return jsonify(sensors)