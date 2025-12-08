#pragma once
#include <Arduino.h>
#include "sensor_data.h"

namespace UartProtocol {
    void sendSensorPacket(const SensorData &data);
}