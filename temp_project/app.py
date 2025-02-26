from flask import Flask, render_template
from flask_sock import Sock
import threading

from routes import app_routes
from utils import gps_reader, metadata_reader, setSystemTime, climatedata_reader

app = Flask(__name__)
sock = Sock(app)

app.register_blueprint(app_routes)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    #threading.Thread(target=setSystemTime, daemon=True).start()
    threading.Thread(target=climatedata_reader, daemon=True).start()
    #threading.Thread(target=gps_reader, daemon=True).start()
    #threading.Thread(target=metadata_reader, daemon=True).start()

    app.run(debug=True, host="0.0.0.0", port=5000)
