from flask import Flask
from controllers.bluetooth_controller import bluetooth_routes
from controllers.audio_controller import audio_routes
from controllers.volume_controller import volume_routes

app = Flask(__name__)

# Registering the routes from the controllers
app.register_blueprint(bluetooth_routes)
app.register_blueprint(audio_routes)
app.register_blueprint(volume_routes)

# Start the Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
