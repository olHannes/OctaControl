import subprocess
import alsaaudio
import os
import json
import RPi.GPIO as GPIO
import Adafruit_DHT
import board

trunkPowerPin = 23
climatePin = 25
dht_device = adafruit_dht.DHT11(board.D25)

def update_config(key, value, file_path=os.path.expanduser("~/Documents/settings.json")):
    try:
        if not os.path.exists(file_path):
            with open(file_path, 'w') as file:
                json.dump({}, file)

        with open(file_path, 'r') as file:
            try:
                config = json.load(file)
            except json.JSONDecodeError:
                config = {}

        config[key] = value

        with open(file_path, 'w') as file:
            json.dump(config, file, indent=4)

        print(f"Updated {key} to {value} in {file_path}")
        return True

    except Exception as e:
        print(f"Error updating config: {e}")
        return False


def run_bluetoothctl_command(command):
    try:
        result = subprocess.run(
            ["bluetoothctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_playerctl_command(command):
    try:
        result = subprocess.run(
            ["playerctl"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def run_amixer_command(command):
    try:
        result = subprocess.run(
            ["amixer"] + command.split(),
            text=True,
            capture_output=True
        )
        return result.stdout.strip()
    except Exception as e:
        return str(e)


# ---------------------- ALSA HELPER ----------------------
master_volume = 100 

def set_volume_with_alsa(volume):
    global master_volume
    try:
        mixer = alsaaudio.Mixer()
        master_volume = max(0, min(100, int(volume)))
        mixer.setvolume(master_volume)
        print(f"Master-Volume set to {master_volume}%")
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")

def get_volume_with_alsa():
    try:
        mixer = alsaaudio.Mixer()
        volume = mixer.getvolume()[0]
        is_muted = mixer.getmute()[0] == 1
        return volume, is_muted
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")


def set_balance(balance):
    global master_volume
    try:
        mixer = alsaaudio.Mixer()
        balance = max(-100, min(100, balance))
        update_config("balanceValue", balance)

        if balance < 0:
            left = master_volume
            right = int(master_volume * (1 + balance / 100))
        elif balance > 0:
            right = master_volume
            left = int(master_volume * (1 - balance / 100))
        else:
            left = right = master_volume

        mixer.setvolume(left, 0)
        mixer.setvolume(right, 1)

        print(f"Balance set: Left = {left}%, Right = {right}%")
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")

def get_balance():
    try:
        mixer = alsaaudio.Mixer()
        left, right = mixer.getvolume()

        if left == right:
            return 0
        elif left > right:
            return -int(100 * (1 - (right / left)))
        else:
            return int(100 * (1 - (left / right)))
    except alsaaudio.ALSAAudioError as e:
        raise Exception(f"ALSA Error: {str(e)}")



def enable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "on"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "on"], check=True)
        update_config("isPairingmodeEnabled", True)
        return {"status": "success", "message": "Pairing mode enabled. Raspberry Pi is now discoverable and pairable."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "off"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "off"], check=True)
        update_config("isPairingmodeEnabled", False)
        return {"status": "success", "message": "Pairing mode disabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
    
def enable_bluetooth():
    try:
        subprocess.run(["rfkill", "unblock", "bluetooth"], check=True)
        update_config("isBluetoothEnabled", True)
        return {"status": "success", "message": "Bluetooth enabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_bluetooth():
    try:
        subprocess.run(["rfkill", "block", "bluetooth"], check=True)
        update_config("isBluetoothEnabled", False)
        return {"status": "success", "message": "Bluetooth disabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
    


def reboot_system():
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return {"status": "success", "message": "Reboot initiated successfully"}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"Reboot command failed: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}

def shutdown_system():
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return {"status": "success", "message": "Shutdown initiated successfully"}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"Shutdown command failed: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {str(e)}"}


def update_system():
    script_absolute_path = "/home/hannes/Documents/OctaControl/updateOctaControl.sh"

    try:
        subprocess.run(["bash", script_absolute_path], check=True)
        print(f"{script_absolute_path} erfolgreich ausgeführt.")
    except subprocess.CalledProcessError as e:
        print(f"Fehler beim Ausführen des Skripts: {e}")
    except FileNotFoundError:
        print("Das angegebene .sh-Skript wurde nicht gefunden.")

def getVersion():
    project_dir = "/home/hannes/Documents/OctaControl/temp_project"
    try:
        commit_hash = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=project_dir).decode("utf-8").strip()
        commit_date = subprocess.check_output(["git", "log", "-1", "--format=%cd", "--date=short"], cwd=project_dir).decode("utf-8").strip()
        return {"commit": commit_hash, "date": commit_date}
    except subprocess.CalledProcessError:
        return {"commit": "unknown", "date": "unknown"}


def getGitLog():
    project_dir = "/home/hannes/Documents/OctaControl/temp_project"
    try:
        log_output = subprocess.check_output(
            ["git", "log", "-10", "--format=%cd|%h|%s", "--date=short"], cwd=project_dir
        ).decode("utf-8").strip()
        
        commits = []
        for line in log_output.split("\n"):
            date, commit_hash, message = line.split("|", 2)
            commits.append({"date": date, "commit": commit_hash, "message": message})
        
        return commits
    except subprocess.CalledProcessError:
        return []
    

def enable_wlan():
    try:
        subprocess.run(["rfkill", "unblock", "wifi"], check=True)
        update_config("isWlanEnabled", True)
        return {"status": "success", "message": "WLAN wurde eingeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_wlan():
    try:
        subprocess.run(["rfkill", "block", "wifi"], check=True)
        update_config("isWlanEnabled", False)
        return {"status": "success", "message": "WLAN wurde ausgeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def getWlanStatus():
    try:
        result = subprocess.run(["rfkill", "list", "wifi"], capture_output=True, text=True, check=True)
        output = result.stdout.lower()
        
        if "soft blocked: yes" in output or "hard blocked: yes" in output:
            return {"status": "disabled", "message": "WLAN ist deaktiviert."}
        else:
            return {"status": "enabled", "message": "WLAN ist aktiviert."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def initializeGPIO():
    if not GPIO.getmode():
        GPIO.setmode(GPIO.BCM)
    try:
        GPIO.cleanup(trunkPowerPin)
        GPIO.setup(trunkPowerPin, GPIO.OUT)
    except RuntimeError:
        pass
    print(f"GPIO trunkPowerPin '{trunkPowerPin}' wurde aktualisiert")

def enableTrunkPower():
    initializeGPIO()
    GPIO.output(trunkPowerPin, GPIO.HIGH)
    update_config("isTrunkPowerEnabled", True)

def disableTrunkPower():
    initializeGPIO()
    GPIO.output(trunkPowerPin, GPIO.LOW)
    update_config("isTrunkPowerEnabled", False)


def getBrightness():
    return {
        "brightness": 0
    }

def getClimate():
    temperature = dht_device.temperature
    humidity = dht_device.humidity
    
    if humidity is not None and temperature is not None:
        return {
            "temperature": temperature,
            "humidity": humidity
        }
    else:
        return {
            "error": "Failed to read from DHT sensor"}