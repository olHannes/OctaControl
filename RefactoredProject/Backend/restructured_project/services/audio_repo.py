from database import get_db, get_setting, set_setting

class AudioStateRepo:
    @staticmethod
    def get_source_state(source: str):
        db = get_db()
        row = db.execute(
            "SELECT volume, muted FROM audio_state WHERE source = ?",
            (source,),
        ).fetchone()
        if not row:
            raise ValueError(f"unknown source in audio_state: {source}")
        return {"volume": int(row["volume"]), "muted": int(row["muted"])}
    
    @staticmethod
    def set_source_volume(source: str, volume: int):
        db = get_db()
        db.execute(
            "UPDATE audio_state SET volume = ?, updated_at = strftime('%s', 'now') WHERE source = ?",
            (int(volume), source),
        )
        db.commit()


class FmStateRepo:
    @staticmethod
    def get_last_freq_khz(default_khz: int = 98500) -> int:
        db = get_db()
        v = get_setting(db, "fm.last_frequency_khz", default=str(default_khz))
        try:
            return int(v)
        except:
            return default_khz
        
    @staticmethod
    def set_last_freq_khz(freq_khz: int):
        db = get_db()
        set_setting(db, "fm.last_frequency_khz", str(int(freq_khz)))
        db.commit()

    @staticmethod
    def add_favorite(freq_khz: int, name: str):
        db = get_db()
        db.execute("""
            INSERT OR REPLACE INTO fm_favorites (frequency_khz, name, created_at)
            VALUES (?, ?, strftime('%s', 'now'))""",
            (int(freq_khz), name))
        db.commit()
    
    @staticmethod
    def delete_favorite(freq_khz: int):
        db = get_db()
        db.execute("DELETE FROM fm_favorites WHERE frequency_khz = ?", (int(freq_khz),))
        db.commit()
    
    @staticmethod
    def list_favorites():
        db = get_db()
        rows = db.execute(
            "SELECT frequency_khz, name FROM fm_favorites ORDER BY created_at DESC"
        ).fetchall()
        return [{"frequency": int(r["frequency_khz"]), "name": r["name"]} for r in rows]

    @staticmethod
    def list_presets():
        db = get_db()
        rows = db.execute(
            "SELECT slot, frequency_khz, name FROM fm_presets ORDER BY slot ASC"
        ).fetchall()
        return [{"frequency": int(r["frequency_khz"]), "name": r["name"]} for r in rows]