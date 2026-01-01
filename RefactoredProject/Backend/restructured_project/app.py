import os
from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS

from database import init_db

from api.sensors_api import sensors_api
from api.lighting_api import lighting_api
from sockets.sensor_socket import init_sensor_socket, init_test

init_db()

#App config
####################################################################
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(
        BASE_DIR, "..", "..", "Frontend", "restructuredProject", "templates"
    ),
    static_folder=os.path.join(
        BASE_DIR, "..", "..", "Frontend", "restructuredProject", "static"
    ),
)

CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config["SECRET_KEY"] = "dev"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

#REST APIs registrieren
####################################################################
@app.route("/")
def index():
    return render_template("index.html")

app.register_blueprint(sensors_api, url_prefix="/api/sensors")
app.register_blueprint(lighting_api, url_prefix="/api/lighting")

#WebSocket initialisieren
####################################################################
init_sensor_socket(socketio)
#init_test(socketio)


#Start
####################################################################
if __name__ == "__main__":
    print("OctaControl Backend läuft...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False, use_reloader=False)
