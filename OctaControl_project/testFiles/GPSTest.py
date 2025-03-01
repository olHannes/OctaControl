import gps
import time
import datetime
import pytz


print("Start...")
def get_gps_data():
    # Verbindung zum GPS-Daemon herstellen
    session = gps.gps(mode=gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)
    
    while True:
        try:
            report = session.next()  # Nächste GPS-Daten abrufen

            # Wenn ein Standortbericht vorhanden ist
            if report['class'] == 'TPV':  
                # Position mit 5 Nachkommastellen
                latitude = round(getattr(report, 'lat', 0.0), 5)
                longitude = round(getattr(report, 'lon', 0.0), 5)

                # Höhe
                altitude = getattr(report, 'alt', 0.0)

                # Geschwindigkeit in km/h (GPS gibt sie in m/s zurück)
                speed = round(getattr(report, 'speed', 0.0) * 3.6, 2)

                # Richtung (0-360°)
                track = getattr(report, 'track', 0.0)

                # Satellitenanzahl (aus SKY-Bericht)
                satellites = session.satellites_used if hasattr(session, 'satellites_used') else "N/A"

                # GPS-Zeit (UTC)
                utc_time = getattr(report, 'time', None)
                local_time = "N/A"
                if utc_time:
                    utc_dt = datetime.datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%S.%fZ")
                    utc_dt = utc_dt.replace(tzinfo=pytz.utc)
                    local_tz = pytz.timezone("Europe/Berlin")
                    local_time = utc_dt.astimezone(local_tz).strftime("%Y-%m-%d %H:%M:%S")

                # Ausgabe der GPS-Daten
                print(f"Satelliten: {satellites}")
                print(f"Position: {latitude}, {longitude}")
                print(f"Höhe: {altitude} m")
                print(f"Geschwindigkeit: {speed} km/h")
                print(f"Richtung: {track}°")
                print(f"Uhrzeit (Lokal): {local_time}")
                print("-" * 40)

            time.sleep(1)  # 1 Sekunde warten

        except KeyError:
            print("Fehler beim Auslesen der GPS-Daten.")
        except KeyboardInterrupt:
            print("\nBeende GPS-Tracking.")
            break
        except StopIteration:
            print("\nGPS-Signal verloren.")
            break

if __name__ == "__main__":
    get_gps_data()
