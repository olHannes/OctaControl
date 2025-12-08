#include "uart_protocol.h"

static uint16_t crc16(const uint8_t* data, uint16_t len) {
    uint16_t crc = 0xFFFF;
    for(uint16_t i = 0; i < len; i++) {
        crc ^=data[i];
        for(int j = 0; j<8; j++) {
            if(crc & 1) 
                crc = (crc >> 1) ^0xA001;
            else
                crc >>= 1;
        }
    }
    return crc;
}

void UartProtocol::sendSensorPacket(const SensorData &data) {
    const uint8_t CMD = 0x01;
    const uint8_t start = 0xAA;

    uint8_t payloadSize = sizeof(SensorData);
    uint16_t len = 1 + payloadSize;

    Serial.write(start);
    Serial.write(len);
    Serial.write(CMD);

    Serial.write((uint8_t*)&data, payloadSize);
    
    uint8_t buffer[1 + payloadSize +1];
    buffer[0] = len;
    buffer[1] = CMD;
    memcpy(&buffer[2], &data, payloadSize);

    uint16_t crc = crc16(buffer, sizeof(buffer));

    Serial.write((uint8_t)(crc & 0xFF));
    Serial.write((uint8_t)((crc >> 8) & 0xFF));
}