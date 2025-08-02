from flask import Blueprint, jsonify, request
import subprocess

system_api = Blueprint("system_api", __name__, url_prefix="/api/system")

@system_api.route("/reboot", methods=["POST"])
def reboot():
    try:
        subprocess.run(["sudo", "reboot"], check=True)
        return jsonify({"status": "Rebooting system"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to reboot: {e}"}), 500

@system_api.route("/shutdown", methods=["POST"])
def shutdown():
    try:
        subprocess.run(["sudo", "shutdown", "now"], check=True)
        return jsonify({"status": "Shutting down system"})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to shutdown: {e}"}), 500

@system_api.route("/update", methods=["POST"])
def update():
    """
    Führt ein Systemupdate durch (Beispiel Debian/Ubuntu apt-get)
    """
    script_absolute_path = "/home/hannes/Documents/OctaControl/updateOctaControl.sh"

    try:
        subprocess.run(["bash", script_absolute_path], check=True)
        print(f"{script_absolute_path} erfolgreich ausgeführt.")
        return jsonify({"status": "System updated"})
    except subprocess.CalledProcessError as e:
        print(f"Fehler beim Ausführen des Skripts: {e}")
        return jsonify({"error": f"Failed to update system: {e}"}), 500
    except FileNotFoundError:
        print("Das angegebene .sh-Skript wurde nicht gefunden.")
        return jsonify({"error": f"Failed to update system: {e}"}), 500
