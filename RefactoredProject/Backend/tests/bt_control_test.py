import dbus
import time

class BluetoothManager:
    def __init__(self):
        self.bus = dbus.SystemBus()
        self.adapter_path = self._get_adapter_path()
        self.adapter = dbus.Interface(self.bus.get_object("org.bluez", self.adapter_path),
                                      "org.bluez.Adapter1")
        self.props = dbus.Interface(self.bus.get_object("org.bluez", self.adapter_path),
                                   "org.freedesktop.DBus.Properties")
        self.manager = dbus.Interface(self.bus.get_object("org.bluez", "/"),
                                     "org.freedesktop.DBus.ObjectManager")

    def _get_adapter_path(self):
        manager = dbus.Interface(self.bus.get_object("org.bluez", "/"),
                                 "org.freedesktop.DBus.ObjectManager")
        objects = manager.GetManagedObjects()
        for path, interfaces in objects.items():
            if "org.bluez.Adapter1" in interfaces:
                return path
        raise Exception("Bluetooth Adapter nicht gefunden")

    def bluetooth_on(self):
        self.props.Set("org.bluez.Adapter1", "Powered", dbus.Boolean(True))

    def bluetooth_off(self):
        self.props.Set("org.bluez.Adapter1", "Powered", dbus.Boolean(False))

    def set_discoverable(self, discoverable: bool):
        self.props.Set("org.bluez.Adapter1", "Discoverable", dbus.Boolean(discoverable))

    def is_powered(self) -> bool:
        return self.props.Get("org.bluez.Adapter1", "Powered")

    def is_discoverable(self) -> bool:
        return self.props.Get("org.bluez.Adapter1", "Discoverable")

    def scan_devices(self, timeout=8):
        adapter_path = self.get_adapter_path()
        props = dbus.Interface(self.bus.get_object("org.bluez", adapter_path),
                            "org.freedesktop.DBus.Properties")
        
        # Check if discovery already running
        try:
            discovering = props.Get("org.bluez.Adapter1", "Discovering")
            if discovering:
                print("Discovery läuft schon, stoppe erst.")
                adapter = dbus.Interface(self.bus.get_object("org.bluez", adapter_path),
                                        "org.bluez.Adapter1")
                adapter.StopDiscovery()
                time.sleep(1)  # kurz warten
        except Exception as e:
            print(f"Fehler beim Abfragen des Discovery-Status: {e}")

        # Jetzt StartDiscovery starten
        adapter = dbus.Interface(self.bus.get_object("org.bluez", adapter_path),
                                "org.bluez.Adapter1")
        adapter.StartDiscovery()
        print("Scan gestartet...")
        time.sleep(timeout)
        adapter.StopDiscovery()
        print("Scan beendet")

        devices = []
        objects = self.manager.GetManagedObjects()
        for path, interfaces in objects.items():
            if "org.bluez.Device1" in interfaces:
                props = interfaces["org.bluez.Device1"]
                name = props.get("Name") or props.get("Alias") or ""
                if not name:
                    # Fallback auf Adresse als Name
                    name = props.get("Address", "Unbekannt")
                # Umwandeln dbus-Strings in native Strings
                name = str(name)
                address = str(props.get("Address"))
                devices.append({"name": name, "address": address})

        return devices

    def get_paired_devices(self):
        objects = self.manager.GetManagedObjects()
        paired_devices = []
        for path, interfaces in objects.items():
            if "org.bluez.Device1" in interfaces:
                props = interfaces["org.bluez.Device1"]
                if props.get("Paired", False):
                    name = props.get("Name") or props.get("Alias") or ""
                    if not name:
                        name = props.get("Address", "Unbekannt")
                    paired_devices.append({
                        "name": str(name),
                        "address": str(props.get("Address"))
                    })
        return paired_devices

    def pair_device(self, address):
        paired = self.get_paired_devices()
        if any(d["address"] == address for d in paired):
            print(f"Gerät {address} ist bereits gepairt, Pairing übersprungen.")
            return
        
        # Suche Device Pfad
        device_path = None
        objects = self.manager.GetManagedObjects()
        for path, interfaces in objects.items():
            if "org.bluez.Device1" in interfaces:
                if str(interfaces["org.bluez.Device1"].get("Address")) == address:
                    device_path = path
                    break
        if not device_path:
            # Device noch nicht bekannt, erzeugen
            device_path = self.adapter_path + "/dev_" + address.replace(":", "_")

        device = dbus.Interface(self.bus.get_object("org.bluez", device_path),
                                "org.bluez.Device1")

        try:
            device.Pair()
            # Hier müsste man eigentlich auf das Pairing-Resultat warten,
            # ggf. mit Signalen arbeiten. Für Einfachheit synchron.
            return True
        except Exception as e:
            raise Exception(f"Pairing fehlgeschlagen: {e}")

    def connect_device(self, address):
        # Suche Device Pfad
        device_path = None
        objects = self.manager.GetManagedObjects()
        for path, interfaces in objects.items():
            if "org.bluez.Device1" in interfaces:
                if str(interfaces["org.bluez.Device1"].get("Address")) == address:
                    device_path = path
                    break
        if not device_path:
            raise Exception("Gerät nicht gefunden")

        device = dbus.Interface(self.bus.get_object("org.bluez", device_path),
                                "org.bluez.Device1")
        props_iface = dbus.Interface(self.bus.get_object("org.bluez", device_path),
                                    "org.freedesktop.DBus.Properties")

        paired = props_iface.Get("org.bluez.Device1", "Paired")
        connected = props_iface.Get("org.bluez.Device1", "Connected")

        if not paired:
            self.pair_device(address)

        if connected:
            return "Bereits verbunden"

        try:
            device.Connect()
            return "Verbindung erfolgreich"
        except Exception as e:
            raise Exception(f"Verbindung fehlgeschlagen: {e}")





bt = BluetoothManager()

# Bluetooth einschalten
print("Bluetooth an...")
try:
    bt.bluetooth_on()
    print("Bluetooth eingeschaltet.")
except Exception as e:
    print(f"Fehler beim Einschalten: {e}")

# Sichtbarkeit aktivieren
print("Sichtbarkeit an...")
try:
    bt.set_discoverable(True)
    print("Sichtbarkeit aktiviert.")
except Exception as e:
    print(f"Fehler bei Sichtbarkeit: {e}")

exit(0)


# Geräte scannen (5 Sekunden)
print("Scan nach Geräten...")
try:
    devices = bt.scan_devices(timeout=5)
    print(f"Gefundene Geräte: {devices}")
except Exception as e:
    print(f"Fehler beim Scannen: {e}")

# Gepaarte Geräte ausgeben
print("Gepaarte Geräte:")
try:
    paired = bt.get_paired_devices()
    print(paired)
except Exception as e:
    print(f"Fehler beim Abrufen gepaarter Geräte: {e}")

# Beispiel-Adresse (hier anpassen!)
test_address = "40:5E:F6:7F:89:07"

# Pairing testen
print(f"Pairing mit {test_address}...")
try:
    bt.pair_device(test_address)
    print("Pairing erfolgreich.")
except Exception as e:
    print(f"Fehler beim Pairing: {e}")

# Verbindung testen
print(f"Verbinden mit {test_address}...")
try:
    result = bt.connect_device(test_address)
    print(result)
except Exception as e:
    print(f"Fehler beim Verbinden: {e}")

# Bluetooth ausschalten
print("Bluetooth aus...")
try:
    bt.bluetooth_off()
    print("Bluetooth ausgeschaltet.")
except Exception as e:
    print(f"Fehler beim Ausschalten: {e}")