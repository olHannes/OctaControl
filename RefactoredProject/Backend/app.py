from flask import Flask, render_template
from utils.Logger import Logger
import os

from api.wlan_setup import wlan_api
from api.bluetooth.bluetooth_setup import bt_setup_api
from api.bluetooth.audio_control import bt_control_api
from api.bluetooth.audio_metadata import bt_meta_api
from services.relais_control import relais_api
from services.system import system_api
from services.volume_control import volume_api
from services.climate import climate_api

log = Logger()
app = Flask(__name__, template_folder="../Frontend/templates", static_folder="../Frontend/static")

app.register_blueprint(system_api)
app.register_blueprint(volume_api)
app.register_blueprint(wlan_api)
app.register_blueprint(bt_setup_api)
app.register_blueprint(bt_control_api)
app.register_blueprint(bt_meta_api)
app.register_blueprint(relais_api)
app.register_blueprint(climate_api)


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    log.verbose("App", "Starte Flask Server")
    app.run(host="0.0.0.0", port=5000, debug=True)
