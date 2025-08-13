from flask import Flask, render_template
from utils.Logger import Logger
import os

from api.wlan_setup import wlan_api
from api.bluetooth.bluetooth_setup import bt_setup_api
from services.relais_control import relais_api

log = Logger()
app = Flask(__name__, template_folder="../Frontend/templates", static_folder="../Frontend/static")

app.register_blueprint(wlan_api)
app.register_blueprint(bt_setup_api)
app.register_blueprint(relais_api)


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    log.verbose("App", "Starte Flask Server")
    app.run(host="0.0.0.0", port=5000, debug=True)
