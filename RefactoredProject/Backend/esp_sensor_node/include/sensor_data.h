#pragma once
#include <stdint.h>

struct SensorData
{
    int16_t brightness;       // luc
    int16_t temperature;      // °C
    uint8_t humidity;         // %
 
    int32_t gps_lat;         // latitude
    int32_t gps_lon;         // longitude
    int16_t gps_speed;        // km/h
    uint8_t gps_satellites; // Number Satelites
    int32_t gps_altitude;   // meters * 100
    int32_t gps_accuracy;   // combined accuracy in cm
    uint16_t gps_heading;   // degree * 10

    uint16_t gps_year;
    uint8_t gps_month;
    uint8_t gps_day;
    uint8_t gps_hour;
    uint8_t gps_minute;
    uint8_t gps_second;

    uint8_t status_flags;   // Bitfield
};
