
from flask import Flask, Blueprint, jsonify, request
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import random
import time

wlan_api = Blueprint("wlan_api", __name__)


@dataclass
class MockWlanState:
    wifi_enabled: bool = True
    connected_ssid: Optional[str] = "MyHomeWifi"
    ip_address: Optional[str] = "192.168.178.42"
    signal: Optional[int] = 72

    scan_networks: List[Dict[str, str]] = field(default_factory=lambda: [
        {"ssid": "MyHomeWifi", "signal": "72"},
        {"ssid": "GuestWifi", "signal": "55"},
        {"ssid": "<hidden>", "signal": "40"},
        {"ssid": "CoffeeShop", "signal": "25"},
    ])

    known_networks: List[str] = field(default_factory=lambda: [
        "MyHomeWifi",
        "GuestWifi",
        "OfficeNet",
    ])

    simulate_timeouts: bool = False        
    timeout_probability: float = 0.0       
    simulated_delay_s: float = 0.0         


STATE = MockWlanState()


def maybe_delay_or_timeout(endpoint_name: str):
    """
    Simuliert Verzögerungen/Timeouts.
    Du kannst das nutzen, um deine Client-Logik zu testen.
    """
    if STATE.simulated_delay_s > 0:
        time.sleep(STATE.simulated_delay_s)

    if STATE.simulate_timeouts:
        raise TimeoutError(f"Simulated timeout in {endpoint_name}")

    if STATE.timeout_probability > 0.0 and random.random() < STATE.timeout_probability:
        raise TimeoutError(f"Random simulated timeout in {endpoint_name}")


def normalize_signal(sig: int) -> int:
    return max(0, min(100, sig))


@wlan_api.route("/status", methods=["GET"])
def wlan_status():
    try:
        maybe_delay_or_timeout("/status")

        if not STATE.wifi_enabled:
            return jsonify({
                "power": "off",
                "state": "disconnected",
                "ip": None,
                "ssid": None,
                "signal": None
            }), 200

        if not STATE.connected_ssid:
            return jsonify({
                "power": "on",
                "state": "disconnected",
                "ip": None,
                "ssid": None,
                "signal": None
            }), 200

        return jsonify({
            "power": "on",
            "state": "connected",
            "ip": STATE.ip_address,
            "ssid": STATE.connected_ssid,
            "signal": str(normalize_signal(STATE.signal or 0))
        }), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to get Wlan state - {e}"}), 500


@wlan_api.route("/power", methods=["POST"])
def wlan_power():
    data = request.json
    if not data or "state" not in data:
        return jsonify({"error": "Missing 'state' parameter"}), 400

    desired = str(data["state"]).lower().strip()

    try:
        maybe_delay_or_timeout("/power")

        if desired not in ("on", "off"):
            return jsonify({"error": "Invalid state, use 'on' or 'off'"}), 400

        if desired == "off":
            STATE.wifi_enabled = False
            STATE.connected_ssid = None
            STATE.ip_address = None
            STATE.signal = None
        else:
            STATE.wifi_enabled = True
        return jsonify({"status": f"WLAN turned {desired}"}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to set WLAN state - {e}"}), 500


@wlan_api.route("/scan", methods=["GET"])
def scan_wifi():
    try:
        maybe_delay_or_timeout("/scan")

        if not STATE.wifi_enabled:
            return jsonify({"error": "WLAN is off"}), 409

        networks = []
        for n in STATE.scan_networks:
            ssid = n["ssid"]
            sig = int(n["signal"])
            sig = normalize_signal(sig + random.randint(-3, 3))
            networks.append({"ssid": ssid, "signal": str(sig)})

        return jsonify({"scannedNetworks": networks}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to scan - {e}"}), 500


@wlan_api.route("/known", methods=["GET"])
def known_wifi():
    try:
        maybe_delay_or_timeout("/known")

        networks = [{"ssid": ssid} for ssid in STATE.known_networks]
        return jsonify({"knownNetworks": networks}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Could not list known networks - {e}"}), 500


@wlan_api.route("/connect", methods=["POST"])
def connect_to_wifi():
    try:
        maybe_delay_or_timeout("/connect")

        if not STATE.wifi_enabled:
            return jsonify({"error": "WLAN is off"}), 409

        data = request.json
        if not data or "ssid" not in data:
            return jsonify({"error": "Missing 'ssid'"}), 400

        ssid = str(data["ssid"])
        password = data.get("password")

        if ssid == "OfficeNet" and password != "correcthorsebatterystaple":
            return jsonify({"error": "Authentication failed (simulated)"}), 401

        STATE.connected_ssid = ssid
        STATE.ip_address = "192.168.178.42"
        found = next((n for n in STATE.scan_networks if n["ssid"] == ssid), None)
        STATE.signal = int(found["signal"]) if found else 60

        if ssid not in STATE.known_networks:
            STATE.known_networks.append(ssid)

        return jsonify({"status": f"Connected to {ssid}"}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to connect to wifi - {e}"}), 500


@wlan_api.route("/disconnect", methods=["POST"])
def disconnect_to_wifi():
    try:
        maybe_delay_or_timeout("/disconnect")

        if not STATE.wifi_enabled:
            return jsonify({"status": "No active WiFi connection"}), 200

        data = request.json
        if not data or "ssid" not in data:
            return jsonify({"error": "Missing 'ssid'"}), 400

        ssid = str(data["ssid"])

        if STATE.connected_ssid is None:
            return jsonify({"status": "No active WiFi connection"}), 200

        if ssid != STATE.connected_ssid:
            return jsonify({"error": f"Not connected to {ssid}"}), 409

        STATE.connected_ssid = None
        STATE.ip_address = None
        STATE.signal = None
        return jsonify({"status": f"Disconnected from {ssid}"}), 200

    except TimeoutError:
        return jsonify({"error": "Command timed out (simulated)"}), 504
    except Exception as e:
        return jsonify({"error": f"Failed to disconnect from WiFi: {e}"}), 500
