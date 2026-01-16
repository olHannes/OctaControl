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

