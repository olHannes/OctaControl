import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "octa.db"

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def get_setting(db, key, default=None):
    row = db.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return row["value"] if row else default

def set_setting(db, key, value):
    db.execute("""
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, strftime('%s', 'now'))
        ON CONFLICT(key) DO UPDATE SET
            value=excluded.value,
            updated_at=excluded.updated_at
    """, (key, str(value)))


#FOR DEBUG ONLY
def wipe_db():
    db = get_db()

    db.execute("DROP TABLE IF EXISTS settings")
    db.execute("DROP TABLE IF EXISTS sensors")
    db.execute("DROP TABLE IF EXISTS sensor_log")
    db.execute("DROP TABLE IF EXISTS audio_state")
    db.execute("DROP TABLE IF EXISTS dab_stations")
    db.execute("DROP TABLE IF EXISTS gps_track")
    db.execute("DROP TABLE IF EXISTS system_log")
    db.execute("DROP TABLE IF EXISTS calibration")

    db.commit()



def init_db():
    wipe_db()

    db = get_db()

    db.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS sensors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        datafields TEXT NOT NULL,
        active BOOLEAN NOT NULL
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS sensor_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER,
        sensor_id INTEGER NOT NULL,
        value REAL NOT NULL,
        meta_json TEXT,

        FOREIGN KEY(sensor_id) REFERENCES sensors(id)
               ON UPDATE CASCADE
               ON DELETE RESTRICT
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS audio_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        source TEXT NOT NULL,
        volume INTEGER NOT NULL,
        muted BOOLEAN NOT NULL,
        updated_at INTEGER
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS dab_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ensemble TEXT,
        name TEXT NOT NULL,
        service_id TEXT NOT NULL UNIQUE,
        favorite BOOLEAN DEFAULT 0
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS gps_track (
        ts INTEGER,
        lat REAL,
        lon REAL,
        speed REAL,
        altitude REAL,
        satellites INTEGER,
        accuracy REAL
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS system_log (
        ts INTEGER,
        module TEXT,
        level TEXT,
        message TEXT
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS calibration (
        key TEXT PRIMARY KEY,
        value REAL,
        updated_at INTEGER
    )
    """)


    # Initialwerte
    db.executemany("""
    INSERT OR IGNORE INTO settings (key, value, updated_at) 
        VALUES (?, ?, strftime('%s', 'now'))
        """, [
            ("lighting.enabled", "1"),
            ("lighting.brightness", "70"),
            ("lighting.colorKey", "sunset"),
    ])

    db.execute("""
    INSERT OR IGNORE INTO audio_state VALUES
    (1, 'bluetooth', 30, 0, strftime('%s','now'))
    """)

    db.executemany("""
    INSERT OR IGNORE INTO sensors (name, description, datafields, active)
    VALUES (?, ?, ?, ?)
    """, [
        ("DHT11", "Air-Sensor for Temperature and Humidity",
         "Temperature (°C) & Humidity (%)", 1),

        ("BH1750", "I²C based Sensor for Brightness",
         "Brightness (lux)", 1),

        ("GT-U7", "GPS Sensor",
         "Position, Speed, Altitude, Time", 1)
    ])

    db.commit()
