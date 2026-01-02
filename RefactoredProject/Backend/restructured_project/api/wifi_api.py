from flask import Blueprint, jsonify, request
import subprocess
import os
from typing import List, Optional

#from utils.Logger import Logger

wlan_api = Blueprint("wlan_api", __name__, url_prefix="/api/wlan")

wlanApiTag = "WlanApi"
#log = Logger()

NMCLI_ENV = {
    **os.environ,
    "LANG": "C",
    "LC_ALL": "C",
}

DEFAULT_TIMEOUT = 8

def run_cmd(args: List[str], timeout: int = DEFAULT_TIMEOUT, check: bool = False):
    """
    Einheitlicher subprocess wrapper
    """
    return subprocess.run(
        args,
        capture_output=True,
        text=True,
        env=NMCLI_ENV,
        timeout=timeout,
        check=check
    )

def get_wifi_device() -> Optional[str]:
    """
    search for first device with TYPE=wifi
    nmcli -t -f DEVICE,TYPE dev status -> z.B. 'wlan0:wifi'
    """
    r = run_cmd(["nmcli", "-t", "-f", "DEVICE,TYPE", "dev", "status"])
    if r.returncode != 0:
        return None
    for line in r.stdout.splitlines():
        if not line:
            continue
        dev, typ = (line.split(":", 1) + [""])[:2]
        if typ == "wifi":
            return dev
    return None


@wlan_api.route("/status", methods=["GET"])
def wlan_status():
    """
    provides the current wlan status
    """    
    try:
        wifi_power = run_cmd(["nmcli", "radio", "wifi"])
        if wifi_power.returncode != 0:
            return jsonify({"error": wifi_power.stderr.strip()}), 500
        wifi_power_output = wifi_power.stdout.strip()

        state = "on" if wifi_power_output.lower() == "enabled" else "off"

        if state == "off":
            return jsonify({
                "state": "off",
                "status": "disconnected",
                "name": None,
                "ip": None,
                "signal": None
            }), 200
        
        wifi_dev = get_wifi_device()
        con_info = run_cmd(
            ["nmcli", "-t", "-f", "IN-USE,SSID,SIGNAL", "dev", "wifi"]
        )

        if con_info.returncode != 0:
            return jsonify({"error": con_info.stderr.strip()}), 500
        
        active_line = next((line for line in con_info.stdout.splitlines() if line.startswith("*:")), None)

        if not active_line:
            return jsonify({
                "state": "on",
                "status": "disconnected",
                "name": None,
                "ip": None,
                "signal": None
            }), 200
        
        _, ssid, signal = active_line.split(":", 2)

        ip_address = None
        if wifi_dev:
            ipr = run_cmd(["nmcli", "-t", "-g", "IP4.ADDRESS", "dev", "show", wifi_dev])
            if ipr.returncode == 0:
                ip_address = (ipr.stdout.strip().splitlines()[0].split("/", 1)[0]
                              if ipr.stdout.strip() else None)
        if not ip_address:
            ipr2 = run_cmd(["hostname", "-I"])
            ip_address = ipr2.stdout.split()[0] if ipr2.stdout else None

        #ip_output = subprocess.check_output(["hostname", "-I"]).decode().strip()
        #ip_address = ip_output.split()[0] if ip_output else "unbekannt"

        return jsonify({
            "state": "on",
            "status": "connected",
            "name": ssid,
            "ip": ip_address,
            "signal": signal
        })
    
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to get Wlan state - {e}"}), 500



@wlan_api.route("/power", methods=["POST"])
def wlan_power():
    """
    Payload: {"state": "on"|"off"}
    WLAN Ein- oder Ausschalten via rfkill
    """
    #log.verbose(wlanApiTag, "POST /power received")
    data = request.json
    if not data or "state" not in data:
        #log.error(wlanApiTag, "/power: Missing parameter")
        return jsonify({"error": "Missing 'state' parameter"}), 400

    state = data["state"].lower()
    try:
        if state == "on":
            run_cmd(["rfkill", "unblock", "wifi"], timeout=DEFAULT_TIMEOUT, check=True)
        elif state == "off":
            run_cmd(["rfkill", "block", "wifi"], timeout=DEFAULT_TIMEOUT, check=True)
        else:
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        return jsonify({"status": f"WLAN turned {state}"})
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except subprocess.CalledProcessError as e:
        #log.error(wlanApiTag, f"/power: failed to toggle wlan - {e}")
        return jsonify({"error": f"Failed to set WLAN state - {e}"}), 500



@wlan_api.route("/scan", methods=["GET"])
def scan_wifi():
    """
    Scans the wifi and returns a list of reachable networks
    return value: networs = [{ssid, signal}, ...]
    """
    #log.verbose(wlanApiTag, "GET /scan received")
    try:
        run_cmd(["nmcli", "dev", "wifi", "rescan"], timeout=DEFAULT_TIMEOUT, check=True)

        r = run_cmd(["nmcli", "-t", "-f", "SSID,SIGNAL", "dev", "wifi"], timeout=DEFAULT_TIMEOUT)
        if r.returncode != 0:
            return jsonify({"error": r.stderr.strip()}), 500
        
        result = r.stdout.strip().splitlines()

        network_map = {}
        for line in result:
            if not line:
                continue
            ssid, signal = line.split(":", 1)
            ssid = ssid if ssid else "<hidden>"
            
            if not signal.isdigit():
                continue

            signal_val = int(signal)
            if ssid in network_map:
                if signal_val > int(network_map[ssid]["signal"]):
                    network_map[ssid] = {"ssid": ssid, "signal": str(signal_val)}
            else:
                network_map[ssid] = {"ssid": ssid, "signal": str(signal_val)}
    
        networks = list(network_map.values())
        return jsonify({ "networks": networks }), 200
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except subprocess.CalledProcessError as e:
        return jsonify({ "error": "Scan command failed" }), 500
    except Exception as e:
        return jsonify({ "error": f"Failed to scan - {e}" }), 500



@wlan_api.route("/known", methods=["GET"])
def known_wifi():
    """
    Returns a list of known WIFI networks
    """
    try:
        result = run_cmd(["nmcli", "-t", "-f", "NAME,TYPE", "connection", "show"], timeout=DEFAULT_TIMEOUT)

        lines = result.stdout.strip().split("\n")
        wifi_connections = []

        for line in lines:
            if not line.strip():
                continue
            name, conn_type = line.strip().split(":")

            if conn_type == "802-11-wireless":
                wifi_connections.append({
                    "ssid": name
                })
        return jsonify({ "networks": wifi_connections }), 200
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except subprocess.CalledProcessError as e:
        return jsonify({ "error": "Could not list known networks" }), 500



@wlan_api.route("/connect", methods=["POST"])
def connect_to_wifi():
    try:
        data = request.json
        if not data or "ssid" not in data:
            return jsonify({"error": "Missing 'ssid'"}), 400
        
        ssid = data["ssid"]
        password = data.get("password")

        wifi_dev = get_wifi_device()
        if wifi_dev:
            run_cmd(["nmcli", "wifi", "disconnect", wifi_dev], timeout=DEFAULT_TIMEOUT, check=False)

        cmd = ["nmcli", "dev", "wifi", "connect", ssid]
        if password:
            cmd += ["password", password]

        result = run_cmd(cmd, timeout=DEFAULT_TIMEOUT)

        if result.returncode != 0:
            return jsonify({"error": result.stderr.strip()}), 500

        return jsonify({"status": f"Connected to {ssid}"}), 200

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to connect to wifi - {e}"}), 500

    

@wlan_api.route("/disconnect", methods=["POST"])
def disconnect_to_wifi():
    """
    Payload: {"ssid": "<network_name>"}
    Tries to disconnect the Raspberry Pi from the given WiFi network.
    """
    try:
        data = request.json
        if not data or "ssid" not in data:
            return jsonify({"error": "Missing 'ssid'"}), 400
        
        ssid = data["ssid"]
        result = run_cmd(["nmcli", "connection", "down", ssid], timeout=DEFAULT_TIMEOUT)

        if result.returncode != 0:
            return jsonify({"error": f"Failed to disconnect: {result.stderr.strip()}"}), 500
        return jsonify({"status": f"Disconnected from {ssid}"}), 200
    
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to disconnect from WiFi: {e}"}), 500
