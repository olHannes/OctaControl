#pragma once

// ====================
// Arduino Nano Config
// ====================
#ifdef BOARD_NANO

// I2C (BH1750)
#define PIN_SDA     A4
#define PIN_SCL     A5

// DHT11
#define PIN_DHT     2

// GPS (SoftwareSerial)
#define PIN_GPS_RX  8
#define PIN_GPS_TX  7

#endif //BOARD_NANO


// ====================
// ESP32 Config
// ====================
#ifdef DBOARD_ESP32

// I2C (BH1750)
#define PIN_SDA     21
#define PIN_SCL     22

// DHT11
#define PIN_DHT     4

// GPS (HardwareSerial2)
#define PIN_GPS_RX  16 //ESP32 RX2 <- GPS TX
#define PIN_GPS_TX  17 //ESP32 TX2 -> GPS RX

#endif //DBOARD_ESP32