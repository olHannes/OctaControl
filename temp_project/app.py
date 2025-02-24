import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template
from flask_socketio import SocketIO

from routes import app_routes
from utils import gps_reader, metadata_reader



app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(app_routes)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    socketio.start_background_task(target=gps_reader)
    socketio.start_background_task(target=metadata_reader)
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
