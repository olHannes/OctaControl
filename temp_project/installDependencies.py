import subprocess

def install_apt_packages():
    print("Installing necessary system packages...")
    apt_packages = [
        "python3", "python3-pip", "python3-gi",
        "bluez", "libbluetooth-dev",
        "gir1.2-glib-2.0", "python3-smbus",
        "pulseaudio", "pulseaudio-module-bluetooth",
        "libportaudio2", "libasound2-dev",
        "ffmpeg", "playerctl", "alsa-utils",
        "unclutter", "i2c-tools", "python3-bluez",
        "gpsd", "gpsd-clients", "python3-gps"
    ]
    try:
        subprocess.run(["sudo", "apt", "update"], check=True)
        subprocess.run(["sudo", "apt", "install", "-y"] + apt_packages, check=True)
        print("System packages installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing system packages: {e}")
        exit(1)

def install_pip_packages():
    print("Installing necessary Python packages...")
    pip_packages = [
        "flask", "flask-cors", "flask-socketio", "eventlet",
        "numpy", "scipy",
        "sounddevice", "pyaudio", "pyalsaaudio",
        "pydbus",
        "Pillow", "opencv-python",
        "adafruit-circuitpython-dht", "smbus2", "RPi.GPIO",
        "gpsd-py3",
        "pynmea2", "pyserial"
    ]
    try:
        subprocess.run(["pip3", "install", "--break-system-packages"] + pip_packages, check=True)
        subprocess.run(["sudo", "apt", "install", "-y", "libgpiod2"], check=True)
        print("Python packages installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing Python packages: {e}")
        exit(1)

def setup_pulseaudio():
    print("Setting up PulseAudio for Bluetooth...")
    try:
        subprocess.run(["pactl", "load-module", "module-bluetooth-discover"], check=True)
        print("PulseAudio Bluetooth module loaded successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error setting up PulseAudio: {e}")
        print("Ensure that PulseAudio is running and try again.")
        exit(1)

if __name__ == "__main__":
    print("Starting installation process...")
    install_apt_packages()
    install_pip_packages()
    setup_pulseaudio()
    print("All dependencies installed and configured successfully!")
