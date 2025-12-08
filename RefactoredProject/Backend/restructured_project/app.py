import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO

from database import init_db

from api.sensors_api import sensors_api
from sockets.sensor_socket import init_sensor_socket, init_test

init_db()

#App config
####################################################################
app = Flask(__name__)
app.config["SECRET_KEY"] = "dev"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


#REST APIs registrieren
####################################################################
app.register_blueprint(sensors_api, url_prefix="/api/sensors")


#WebSocket initialisieren
####################################################################
init_sensor_socket(socketio)
#init_test(socketio)


#Start
####################################################################
if __name__ == "__main__":
    print("OctaControl Backend läuft...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
