import os
from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS

from database import init_db
from services.AudioSourceService import AudioSourceService
from services.audio_service import AudioService

from api.system_api import system_api

from api.sensors_api import sensors_api
from api.lighting_api import lighting_api
from api.audio_source_api import audio_source_api
from api.audio_bt_api import btAudio_api

from sockets.sensor_socket import init_sensor_socket
from sockets.audio_socket import init_audio_socket

from api.bluetooth_mock import bt_setup_api
from api.wlan_api import wifi_api

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

app.register_blueprint(system_api, url_prefix="/api/system")

app.register_blueprint(sensors_api, url_prefix="/api/sensors")
app.register_blueprint(lighting_api, url_prefix="/api/lighting")

app.register_blueprint(audio_source_api, url_prefix="/api/audio/source")
app.register_blueprint(btAudio_api, url_prefix="/api/audio/bluetooth")

app.register_blueprint(wifi_api, url_prefix="/api/wlan")
app.register_blueprint(bt_setup_api, url_prefix="/api/bluetooth")

#WebSocket initialisieren
####################################################################
init_sensor_socket(socketio)
init_audio_socket(socketio)

#Initialize Moduls
####################################################################
AudioService.get().set_active_source(AudioSourceService.get().load()["activeSource"])


#Start
####################################################################
if __name__ == "__main__":
    print("OctaControl Backend läuft...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=True)
