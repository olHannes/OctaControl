from database import get_db, get_setting, set_setting

class AudioSourceService:
    _instance = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load(self):
        db = get_db()

        active = get_setting(db, "audio.active_source", default="radio")

        rows = db.execute("""
            SELECT source, volume, muted
            FROM audio_state
        """).fetchall()

        sources = {}
        for r in rows:
            sources[r["source"]] = {
                "volume": int(r["volume"]),
                "muted": int(r["muted"]),
            }

        return {
            "activeSource": active,
            "sources": sources
        }

    def change_source(self, old_source: str, new_source: str):
        db = get_db()

        exists = db.execute("""
            SELECT source FROM audio_state WHERE source IN (?,?)
        """, (old_source, new_source)).fetchall()
        if len(exists) != 2:
            raise ValueError("oldSource/newSource unknown (not in audio_state)")

        current = get_setting(db, "audio.active_source", default="bluetooth")
        if current != old_source:
            return self.load()

        set_setting(db, "audio.active_source", new_source)
        db.commit()

        return self.load()
