from flask import Flask
from routes import app_routes

app = Flask(__name__)

# Register routes from routes.py
app.register_blueprint(app_routes)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
