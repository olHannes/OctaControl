from flask import Flask, render_template
import threading

from routes import app_routes
from utils import setSystemTime, updateClimateData, updateBrightnessData

app = Flask(__name__)

app.register_blueprint(app_routes)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    threading.Thread(target=setSystemTime, daemon=True).start()
    threading.Thread(target=updateClimateData, daemon=True).start()
    threading.Thread(target=updateBrightnessData, daemon=True).start()

    app.run(debug=True, host="0.0.0.0", port=5000)
