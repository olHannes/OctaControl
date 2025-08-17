from flask import Blueprint, jsonify, request
from utils.Logger import Logger
try:
    import RPi.GPIO as GPIO
    mock = False
except (ImportError, RuntimeError):
    from utils.gpio_mock import MockGPIO
    GPIO = MockGPIO()
    mock = True


relais_api = Blueprint("relais_api", __name__, url_prefix="/api/system/relais")

log = Logger()
relaisApiTag = "RelaisApi"

DEVICE_PINS = {
    "park-assistent": 17,
    "trunk": 27,
}


def init_GPIO():
    """
    inits the general gpio settings and sets every used pin to low
    """
    log.verbose(relaisApiTag, "/init GPIO pins")
    if mock == False:
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        for name, pin in DEVICE_PINS.items():
            if name == "trunk":
                GPIO.setup(pin, GPIO.OUT, initial=GPIO.HIGH)
            else:
                GPIO.setup(pin, GPIO.OUT, initial=GPIO.LOW)


@relais_api.route("/init", methods=["GET"])
def initPins():
    """
    Trys to init the used gpio pins
    """
    log.verbose(relaisApiTag, "GET /init received")
    try:
        init_GPIO()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        log.error(relaisApiTag, f"/initPins: {e}")
        return jsonify({"error": str(e)}), 500


@relais_api.route("/toggle", methods=["POST"])
def toggleRelais():
    """
    Payload {"type": <name>, "newState": bool}
    sets the given newState to the pin-"type"
    """
    log.verbose(relaisApiTag, "POST /toggle received")
    
    data = request.get_json()
    if not data or "type" not in data or not "newState" in data:
        log.error(relaisApiTag, "/toggleRelais: Missing data")
        return jsonify({"error": "Missing 'type' or 'newState' in request body"}), 400
    
    device_type = data["type"]
    state = data["newState"]

    if device_type not in DEVICE_PINS:
        log.error(relaisApiTag, "/toggleRelais: unknown type")
        return jsonify({"error": f"Unknown type '{device_type}'"}), 400
    pin = DEVICE_PINS[device_type]
    
    if state:
        GPIO.output(pin, GPIO.HIGH)
    else: 
        GPIO.output(pin, GPIO.LOW)
    return jsonify({"status": "toggled", "type": device_type})


@relais_api.route("/status", methods=["GET"])
def getStatus():
    """
    URL-Param: {"type": <name>}
    Returns the status of the requested pin: {"type", "status", "pin"}
    """
    log.verbose(relaisApiTag, "GET /status received")
    
    device_type = request.args.get("type")
    if not device_type:
        return jsonify({"error": "Missing 'type' in query params"}), 400

    if device_type not in DEVICE_PINS:
        return jsonify({"error": f"Unknown type '{device_type}'"}), 400
    
    pin = DEVICE_PINS[device_type]
    pin_state = GPIO.input(pin)
    
    status = "off" if pin_state == GPIO.LOW else "on"
    
    return jsonify({
        "type": device_type,
        "status": status,
        "pin": pin
    })
