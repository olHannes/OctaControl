from database import get_db, get_setting, set_setting

class LightingController:
    def apply(self, *, enabled: bool, brightness: int, colorKey: str):
        # später: via BT an LEDs senden
        pass

class DummyLightingController(LightingController):
    def apply(self, *, enabled: bool, brightness: int, colorKey: str):
        print(f"[DUMMY] lighting -> enabled={enabled} brightness={brightness} color={colorKey}")

class LightingService:
    _instance = None

    PRESETS = {"skoda", "ocean", "sunset", "royal", "rose", "pure", "warm", "cool"}

    def __init__(self):
        self.controller = DummyLightingController()
    
    @classmethod
    def get(cls):
        if not cls._instance:
            cls._instance = LightingService()
        return cls._instance
    
    def load(self):
        db = get_db()
        return {
            "enabled": get_setting(db, "lighting.enabled", "1") == "1",
            "brightness": int(get_setting(db, "lighting.brightness", "70")),
            "colorKey": get_setting(db, "lighting.colorKey", "sunset"),
        }
    
    def update(self, patch: dict):
        current = self.load()
        new = {**current, **patch}

        if not isinstance(new["enabled"], bool):
            raise ValueError("enabled must be boolean")
        
        b = int(new["brightness"])
        if b < 0 or b > 100:
            raise ValueError("enabled must be boolean")
        
        ck = new["colorKey"]
        if ck not in self.PRESETS:
            raise ValueError(f"colorKey must be one of: {sorted(self.PRESETS)}")
        
        db = get_db()
        if "enabled" in patch:
            set_setting(db, "lighting.enabled", "1" if patch["enabled"] else "0")
        if "brightness" in patch:
            set_setting(db, "lighting.brightness", b)
        if "colorKey" in patch:
            set_setting(db, "lighting.colorKey", ck)
        db.commit()

        try:
            self.controller.apply(enabled=new["enabled"], brightness=b, colorKey=ck)
        except Exception as e:
            db.execute(
                "INSERT INTO system_log VALUES (strftime('%s', 'now'), ?, ?, ?)",
                ("lighting", "WARN", f"apply failed: {e}")
            )
            db.commit()
        
        new["brightness"] = b
        return new
