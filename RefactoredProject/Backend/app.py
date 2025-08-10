from flask import Flask, render_template
from api.wlan_setup import wlan_api
from utils.Logger import Logger
import os

log = Logger()
app = Flask(__name__, template_folder="../Frontend/templates", static_folder="../Frontend/static")

app.register_blueprint(wlan_api)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    log.verbose("App", "Starte Flask Server")
    app.run(host="0.0.0.0", port=5000, debug=True)
