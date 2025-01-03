import subprocess

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
