import subprocess
import alsaaudio

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
