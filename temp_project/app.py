from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from routes import *

app = Flask(__name__)
socketio = SocketIO(app)

# Register routes from routes.py
app.register_blueprint(app_routes)

#main route
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
