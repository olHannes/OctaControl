from flask import Flask, render_template
from flask_socketio import SocketIO
import random
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Funktion, die alle 2 Sekunden eine zufällige Zahl sendet
def send_random_number():
    while True:
        number = random.randint(1, 100)  # Zufällige Zahl zwischen 1 und 100
        print(f"Sending random number: {number}")
        socketio.emit("update_number", {"number": number})  # Event "update_number" senden
        time.sleep(2)  # 2 Sekunden warten

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    # Thread starten, um die zufälligen Zahlen zu senden
    threading.Thread(target=send_random_number, daemon=True).start()
    # Flask-Server starten
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)