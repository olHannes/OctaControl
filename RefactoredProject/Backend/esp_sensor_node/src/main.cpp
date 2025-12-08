#include <Arduino.h>
#include "sensor_data.h"
#include "uart_protocol.h"

#include "sensor_interface.h"
#include "dht_sensor.h"
#include "bh1750_sensor.h"
#include "gt_u7_sensor.h"

SensorInterface* sensors[] = {
    &DHT11Sensor
    ,&BH1750Sensor
    ,&GTU7Sensor
};

void setup() {
    Serial.begin(115200);
    for (auto s: sensors) s->init();
    Serial.println("ESP32 Sensor Node started.");
}

void loop() {

    for(auto s: sensors) s->update();

    static uint32_t lastRead = 0;
    if(millis() - lastRead >= 500) {
        lastRead = millis();

        SensorData data = {};
        for(auto s: sensors) s->read(data);

        UartProtocol::sendSensorPacket(data);
    }
}