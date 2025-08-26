SYSTEM_RPI = False

USE_SOCKETS = False

LOGGER = {
    "LOGGING": True,
    "TO_FILE": True,
    "FILE": "app.log",
}

RELAIS_PINS = {
    "park-assistent": 2,
    "trunk": 3,
}

RELAIS_DEFAULTS = {
    "park-assistent": "LOW",
    "trunk": "HIGH",
}

CLIMATE = {
    "SENSOR": 25,
    "UPDATE_INTERVAL": 5,
    "FILE_PATH": "~/Documents/OctaControl/RefactoredProject/Backend/utils/climate_data.json",
}

AUDIO = {
    "UPDATE_INTERVAL": 1,
}