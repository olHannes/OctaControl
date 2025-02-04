import subprocess
import alsaaudio
import os

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

def set_volume_with_alsa(volume):
    print("set Volume with alsa -->")
    mixer = alsaaudio.Mixer()
    vol = max(0, min(100, int(volume)))
    mixer.setvolume(vol)

def get_volume_with_alsa():
    print("get Volume with alsa <--")
    mixer = alsaaudio.Mixer()
    volume = mixer.getvolume()[0]
    is_muted = mixer.getmute()[0] == 1
    return volume, is_muted



def enable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "on"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "on"], check=True)
        return {"status": "success", "message": "Pairing mode enabled. Raspberry Pi is now discoverable and pairable."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_pairing_mode():
    try:
        subprocess.run(["bluetoothctl", "discoverable", "off"], check=True)
        subprocess.run(["bluetoothctl", "pairable", "off"], check=True)
        return {"status": "success", "message": "Pairing mode disabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
    
def enable_bluetooth():
    try:
        subprocess.run(["rfkill", "unblock", "bluetooth"], check=True)
        return {"status": "success", "message": "Bluetooth enabled."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_bluetooth():
    try:
        subprocess.run(["rfkill", "block", "bluetooth"], check=True)
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


def enable_wlan():
    try:
        subprocess.run(["rfkill", "unblock", "wifi"], check=True)
        return {"status": "success", "message": "WLAN wurde eingeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}

def disable_wlan():
    try:
        subprocess.run(["rfkill", "block", "wifi"], check=True)
        return {"status": "success", "message": "WLAN wurde ausgeschaltet."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
