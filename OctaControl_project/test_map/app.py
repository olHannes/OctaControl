from flask import Flask, jsonify, render_template
import threading
import gps
import time
import datetime
import pytz

app = Flask(__name__)

gps_data = {
    "latitude": 0.0,
    "longitude": 0.0,
    "altitude": 0.0,
    "speed": 0.0,
    "track": 0.0,
    "satellites": "N/A",
    "local_time": "N/A"
}

gps_lock = threading.Lock()

def pollingGPSData():
    session = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)
    while True:
        try:
            report = session.next()
            if report['class'] == 'TPV':
                latitude = round(getattr(report, 'lat', 0.0), 5)
                longitude = round(getattr(report, 'lon', 0.0), 5)
                altitude = getattr(report, 'alt', 0.0)
                speed = round(getattr(report, 'speed', 0.0) * 3.6, 2)
                track = getattr(report, 'track', 0.0)
                satellites = session.satellites_used if hasattr(session, 'satellites_used') else "N/A"
                utc_time = getattr(report, 'time', None)
                local_time = "N/A"
                if utc_time:
                    utc_dt = datetime.datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%S.%fZ")
                    utc_dt = utc_dt.replace(tzinfo=pytz.utc)
                    local_tz = pytz.timezone("Europe/Berlin")
                    local_time = utc_dt.astimezone(local_tz).strftime("%Y-%m-%d %H:%M:%S")
                
                with gps_lock:
                    gps_data['latitude'] = latitude
                    gps_data['longitude'] = longitude
                    gps_data['altitude'] = altitude
                    gps_data['speed'] = speed
                    gps_data['track'] = track
                    gps_data['satellites'] = satellites
                    gps_data['local_time'] = local_time
                
                print(f"Satellites: {satellites}")
                print(f"Position: {latitude}, {longitude}")
                print(f"Hoehe: {altitude}m")
                print(f"Geschwindigkeit: {speed}km/h")
                print(f"Richtung: {track}")
                print(f"Uhrzeit (lokal): {local_time}")
            time.sleep(1)
        except Exception as e:
            print(f"GPS Error: {e}")

def get_gps_data():
    with gps_lock:
        return gps_data.copy()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/location', methods=['GET'])
def location():
    return jsonify(get_gps_data())

if __name__ == '__main__':
    gps_thread = threading.Thread(target=pollingGPSData, daemon=True)
    gps_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
