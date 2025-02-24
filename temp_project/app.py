from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS
from routes import app_routes
import eventlet
from utils import gps_reader

eventlet.monkey_patch()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(app_routes)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    socketio.start_background_task(target=gps_reader)
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
