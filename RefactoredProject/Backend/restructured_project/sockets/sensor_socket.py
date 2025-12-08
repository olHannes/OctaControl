import time
import threading
from services.sensor_service import SensorService


def init_test(socketio):
    def test_loop():
        while True:
            socketio.emit("sensor_test", "test")
            socketio.sleep(1)
    socketio.start_background_task(test_loop)


def init_sensor_socket(socketio):
    def sensor_loop():
        while True:
            data = SensorService.get().read_all()
            socketio.emit("sensor_update", data)
            socketio.sleep(1)
    
    socketio.start_background_task(sensor_loop)