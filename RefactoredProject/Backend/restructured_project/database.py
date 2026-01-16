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
    db.execute("DROP TABLE IF EXISTS fm_presets")
    db.execute("DROP TABLE IF EXISTS fm_favorites")
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
        source TEXT PRIMARY KEY,
        volume INTEGER NOT NULL CHECK(volume BETWEEN 0 AND 100),
        muted INTEGER NOT NULL CHECK(muted in (0,1)),
        updated_at INTEGER
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS fm_presets (
        slot INTEGER PRIMARY KEY CHECK(slot BETWEEN 0 AND 5),
        frequency_khz INTEGER NOT NULL CHECK(frequency_khz BETWEEN 87500 AND 108000),
        name TEXT    
    )
    """)

    db.execute("""
    CREATE TABLE IF NOT EXISTS fm_favorites (
        frequency_khz INTEGER PRIMARY KEY CHECK(frequency_khz BETWEEN 87500 AND 108000),
        name TEXT NOT NULL,
        created_at INTEGER
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
            ("audio.active_source", "bluetooth"),
            ("fm.last_frequency_khz", 98500),
    ])

    db.executemany("""
    INSERT OR IGNORE INTO audio_state (source, volume, muted, updated_at)
    VALUES (?, ?, ?, strftime('%s', 'now'))
    """, [
        ('bluetooth', 30, 0),
        ('radio', 20, 1)
    ])

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

    db.executemany("""
    INSERT OR IGNORE INTO fm_presets (slot, frequency_khz, name)
    VALUES (?, ?, ?)
    """, [
        (0, 88500, "Preset 1"),
        (1, 91500, "Preset 2"),
        (2, 94500, "Preset 3"),
        (3, 98500, "Preset 4"),
        (4, 101300, "Preset 5"),
        (5, 104600, "Preset 6"),
    ])
    db.commit()
